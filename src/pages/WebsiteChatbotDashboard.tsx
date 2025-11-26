import React, { useState, useEffect } from 'react'
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Play,
  Pause,
  Settings,
  Activity,
  Bot,
  Globe,
  Database,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Star,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { useTranslation } from 'react-i18next';
import { tStatTitle } from '@/lib/dashboardI18n';

import AdminBannerOverlay from '@/components/AdminBannerOverlay';


interface ChatSession {
  id: string;
  visitorName: string;
  sessionStart: Date;
  lastMessage: Date;
  messageCount: number;
  status: 'active' | 'resolved' | 'escalated' | 'abandoned';
  satisfaction?: number;
  topic: string;
}

interface AutomationStats {
  totalSessions: number;
  activeSessions: number;
  resolvedSessions: number;
  avgResponseTime: number;
  satisfactionRate: number;
  escalationRate: number;
  conversionRate: number;
}

const WebsiteChatbotDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [automationStats, setAutomationStats] = useState<AutomationStats>({
    totalSessions: 0,
    activeSessions: 0,
    resolvedSessions: 0,
    avgResponseTime: 0,
    satisfactionRate: 0,
    escalationRate: 0,
    conversionRate: 0
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const { isConnected } = useRealtimeMetrics('AI Website Chatbot');


  const sessionStatuses = {
    active: { label: 'Active', color: 'bg-blue-500' },
    resolved: { label: 'Resolved', color: 'bg-green-500' },
    escalated: { label: 'Escalated', color: 'bg-orange-500' },
    abandoned: { label: 'Abandoned', color: 'bg-red-500' }
  };

  // Mock data for chat sessions
  const mockSessions: ChatSession[] = [
    {
      id: '1',
      visitorName: 'John Smith',
      sessionStart: new Date('2024-01-15T10:00:00'),
      lastMessage: new Date('2024-01-15T10:15:00'),
      messageCount: 8,
      status: 'resolved',
      satisfaction: 4,
      topic: 'Product Information'
    },
    {
      id: '2',
      visitorName: 'Sarah Johnson',
      sessionStart: new Date('2024-01-15T11:00:00'),
      lastMessage: new Date('2024-01-15T11:30:00'),
      messageCount: 12,
      status: 'active',
      topic: 'Pricing'
    },
    {
      id: '3',
      visitorName: 'Mike Wilson',
      sessionStart: new Date('2024-01-15T09:00:00'),
      lastMessage: new Date('2024-01-15T09:45:00'),
      messageCount: 15,
      status: 'escalated',
      topic: 'Technical Support'
    },
    {
      id: '4',
      visitorName: 'Emily Davis',
      sessionStart: new Date('2024-01-15T12:00:00'),
      lastMessage: new Date('2024-01-15T12:05:00'),
      messageCount: 2,
      status: 'abandoned',
      topic: 'General Inquiry'
    },
    {
      id: '5',
      visitorName: 'David Brown',
      sessionStart: new Date('2024-01-15T13:00:00'),
      lastMessage: new Date('2024-01-15T13:20:00'),
      messageCount: 10,
      status: 'resolved',
      satisfaction: 5,
      topic: 'Order Status'
    },
    {
      id: '6',
      visitorName: 'Lisa Garcia',
      sessionStart: new Date('2024-01-15T14:00:00'),
      lastMessage: new Date('2024-01-15T14:25:00'),
      messageCount: 6,
      status: 'active',
      topic: 'Account Issues'
    },
    {
      id: '7',
      visitorName: 'Robert Taylor',
      sessionStart: new Date('2024-01-15T08:00:00'),
      lastMessage: new Date('2024-01-15T08:30:00'),
      messageCount: 18,
      status: 'resolved',
      satisfaction: 4,
      topic: 'Feature Request'
    },
    {
      id: '8',
      visitorName: 'Maria Rodriguez',
      sessionStart: new Date('2024-01-15T15:00:00'),
      lastMessage: new Date('2024-01-15T15:10:00'),
      messageCount: 4,
      status: 'abandoned',
      topic: 'Demo Request'
    }
  ];

  const statusColors = {
    active: 'text-blue-600',
    resolved: 'text-green-600',
    escalated: 'text-orange-600',
    abandoned: 'text-red-600'
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    changeType?: 'positive' | 'negative';
  }) => {
    const { t } = useTranslation();
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <BackButton />
              <p className="text-sm font-medium text-muted-foreground">{tStatTitle(title as string, t)}</p>
              <p className="text-2xl font-bold">{value}</p>
              {change && (
                <p className={`text-xs flex items-center mt-1 ${
                  changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {change}
                </p>
              )}
            </div>
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const loadSessionData = () => {
    // TODO: Replace with real API call
    setSessions(mockSessions);
    calculateStats(mockSessions);
  };

  const calculateStats = (sessionData: ChatSession[]) => {
    const total = sessionData.length;
    const active = sessionData.filter(s => s.status === 'active').length;
    const resolved = sessionData.filter(s => s.status === 'resolved').length;
    const escalated = sessionData.filter(s => s.status === 'escalated').length;

    const avgResponseTime = 2.5; // Mock average response time in seconds
    const satisfactionRate = 85; // Mock satisfaction rate
    const escalationRate = (escalated / total) * 100;
    const conversionRate = 12; // Mock conversion rate

    setAutomationStats({
      totalSessions: total,
      activeSessions: active,
      resolvedSessions: resolved,
      avgResponseTime,
      satisfactionRate,
      escalationRate,
      conversionRate
    });
  };

  const handleAutomationControl = (action: string) => {
    console.log(`AI Website Chatbot Automation: ${action}`);
    // Implement actual automation control
  };

  const loadPendingRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: requests, error } = await supabase
        .from('workflow_control_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('workflow_name', 'AI Website Chatbot')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading pending requests:', error);
        return;
      }

      setPendingRequests(requests || []);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const loadProcessedRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: requests, error } = await supabase
        .from('workflow_control_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('workflow_name', 'AI Website Chatbot');

      if (error) {
        console.error('Error loading processed requests:', error);
        return;
      }

      const processed = (requests || [])
        .filter(req => req.status !== 'pending')
        .sort((a, b) => new Date(b.processed_at || b.created_at).getTime() - new Date(a.processed_at || a.created_at).getTime())
        .slice(0, 5);

      setProcessedRequests(processed);
    } catch (error) {
      console.error('Error loading processed requests:', error);
    }
  };

  const handleWorkflowRequest = async (action: 'start' | 'stop' | 'modify') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to make requests",
          variant: "destructive",
        });
        return;
      }

      // Insert workflow control request into database
      const { error } = await supabase
        .from('workflow_control_requests')
        .insert({
          user_id: user.id,
          workflow_name: 'AI Website Chatbot',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the AI Website Chatbot workflow`,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating workflow request:', error);
        toast({
          title: "Error",
          description: "Failed to submit request. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Request Submitted",
        description: `Your request to ${action} the workflow has been sent to admin for approval.`,
        variant: "default",
      });

      // Refresh requests
      loadPendingRequests();
      loadProcessedRequests();

    } catch (error) {
      console.error('Error handling workflow request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getActiveSessions = () => {
    return sessions.filter(session => session.status === 'active');
  };

  const getPipelineData = () => {
    const statusCounts = {
      active: sessions.filter(s => s.status === 'active').length,
      resolved: sessions.filter(s => s.status === 'resolved').length,
      escalated: sessions.filter(s => s.status === 'escalated').length,
      abandoned: sessions.filter(s => s.status === 'abandoned').length
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: sessionStatuses[status as keyof typeof sessionStatuses].label,
      count,
      color: sessionStatuses[status as keyof typeof sessionStatuses].color
    }));
  };

  const getTopicDistribution = () => {
    const topics = sessions.reduce((acc, session) => {
      acc[session.topic] = (acc[session.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(topics).map(([topic, count]) => ({
      topic,
      count,
      percentage: (count / sessions.length) * 100
    }));
  };

  useEffect(() => {
    loadSessionData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.workflowName;
      if (name?.startsWith('AI Website Chatbot')) {
        loadSessionData();
        loadPendingRequests();
        loadProcessedRequests();
      }
    };
    window.addEventListener('workflowExecutionUpdate', handler as EventListener);
    return () => window.removeEventListener('workflowExecutionUpdate', handler as EventListener);
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <AdminBannerOverlay workflowName="AI Website Chatbot" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Website Chatbot Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your AI-powered website chatbot interactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </Badge>
          <Button onClick={() => handleAutomationControl('toggle')}>
            <Pause className="w-4 h-4 mr-2" />
            Pause Bot
          </Button>
        </div>
      </div>

        {/* Dashboard Status */}
        {sessions.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-0.5">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
                <p className="text-green-800 text-sm">
                  🎉 Showing real-time AI Website Chatbot metrics from your workflow executions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Control Request */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Control</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your AI Website Chatbot workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleWorkflowRequest('start')}
                  className="h-auto p-4 flex flex-col items-center bg-waselify-500 hover:bg-waselify-600 text-white"
                >
                  <CheckCircle className="w-6 h-6 mb-2" />
                  <span>Request Start</span>
                </Button>
                <Button
                  onClick={() => handleWorkflowRequest('stop')}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
                >
                  <XCircle className="w-6 h-6 mb-2" />
                  <span>Request Stop</span>
                </Button>
                <Button
                  onClick={() => handleWorkflowRequest('modify')}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
                >
                  <Settings className="w-6 h-6 mb-2" />
                  <span>Request Changes</span>
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>• <strong>Start:</strong> Request admin to activate your workflow</p>
                <p>• <strong>Stop:</strong> Request admin to pause your workflow</p>
                <p>• <strong>Changes:</strong> Request modifications to workflow settings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                Your workflow control requests awaiting admin approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        request.request_type === 'start' ? 'bg-green-500' :
                        request.request_type === 'stop' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="font-medium capitalize">{request.request_type} Request</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Processed Requests */}
        {processedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>
                Your recently processed workflow control requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processedRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        request.request_type === 'start' ? 'bg-green-500' :
                        request.request_type === 'stop' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="font-medium capitalize">{request.request_type} Request</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={request.status === 'approved' ? 'default' : 'destructive'}
                      className={
                        request.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                      }
                    >
                      {request.status === 'approved' ? 'Approved' : 'Rejected'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sessions"
          value={automationStats.totalSessions}
          icon={MessageSquare}
          change="+12%"
          changeType="positive"
        />
        <StatCard
          title="Active Sessions"
          value={automationStats.activeSessions}
          icon={Users}
          change="+5%"
          changeType="positive"
        />
        <StatCard
          title="Avg Response Time"
          value={`${automationStats.avgResponseTime}s`}
          icon={Clock}
          change="-0.5s"
          changeType="positive"
        />
        <StatCard
          title="Satisfaction Rate"
          value={`${automationStats.satisfactionRate}%`}
          icon={Star}
          change="+3%"
          changeType="positive"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Session Status Pipeline</CardTitle>
            <CardDescription>
              Distribution of chat sessions by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPipelineData().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                    <Progress
                      value={(item.count / automationStats.totalSessions) * 100}
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Topic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Topics</CardTitle>
            <CardDescription>
              Most common conversation topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTopicDistribution().slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{item.topic}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{item.count}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Chat Sessions</CardTitle>
          <CardDescription>
            Latest visitor interactions with your chatbot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{session.visitorName}</p>
                    <p className="text-sm text-muted-foreground">{session.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.messageCount} messages • {format(session.sessionStart, 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className={statusColors[session.status]}
                  >
                    {sessionStatuses[session.status].label}
                  </Badge>
                  {session.satisfaction && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-sm">{session.satisfaction}/5</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Currently ongoing chat conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getActiveSessions().map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{session.visitorName}</p>
                    <p className="text-sm text-muted-foreground">{session.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      Active for {Math.floor((Date.now() - session.sessionStart.getTime()) / 60000)}m
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Live
                  </Badge>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chatbot Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Chatbot Controls</CardTitle>
          <CardDescription>
            Manage your website chatbot automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleAutomationControl('start')}
              className="h-auto p-4 flex flex-col items-center"
            >
              <Play className="w-6 h-6 mb-2" />
              <span>Start Auto-Response</span>
            </Button>
            <Button
              onClick={() => handleAutomationControl('update')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center"
            >
              <Settings className="w-6 h-6 mb-2" />
              <span>Update Knowledge Base</span>
            </Button>
            <Button
              onClick={() => handleAutomationControl('train')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center"
            >
              <Zap className="w-6 h-6 mb-2" />
              <span>Train AI Model</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>
            Monitor chatbot system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Globe className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Website Integration</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Bot className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">AI Chat Engine</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Knowledge Base</p>
                <p className="text-xs text-muted-foreground">Synced</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Message Queue</p>
                <p className="text-xs text-muted-foreground">Healthy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  </div>
  );
};

export default WebsiteChatbotDashboard;
