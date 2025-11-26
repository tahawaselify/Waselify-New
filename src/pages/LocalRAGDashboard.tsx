import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import BackButton from '@/components/BackButton';
import Navbar from '@/components/Navbar';
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
  Database,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Star,
  HardDrive,
  Cpu,
  MemoryStick,
  ArrowLeft
} from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

import AdminBannerOverlay from '@/components/AdminBannerOverlay';


interface RAGSession {
  id: string;
  userQuery: string;
  response: string;
  status: 'processing' | 'completed' | 'failed' | 'timeout';
  sessionStart: Date;
  responseTime: number; // in seconds
  confidence: number;
  sourceDocuments: number;
  modelUsed: string;
  tokensUsed: number;
  userSatisfaction?: number;
  category: 'technical' | 'general' | 'specific' | 'creative' | 'analytical';
}

interface AutomationStats {
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  avgResponseTime: number;
  satisfactionRate: number;
  accuracyRate: number;
  modelPerformance: number;
}

const LocalRAGDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<RAGSession[]>([]);
  const [automationStats, setAutomationStats] = useState<AutomationStats>({
    totalSessions: 0,
    completedSessions: 0,
    failedSessions: 0,
    avgResponseTime: 0,
    satisfactionRate: 0,
    accuracyRate: 0,
    modelPerformance: 0
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const { isConnected } = useRealtimeMetrics('Local Chatbot with Retrieval Augmented Generation (RAG)');


  const sessionStatuses = {
    processing: { label: 'Processing', color: 'bg-yellow-500' },
    completed: { label: 'Completed', color: 'bg-green-500' },
    failed: { label: 'Failed', color: 'bg-red-500' },
    timeout: { label: 'Timeout', color: 'bg-orange-500' }
  };

  const statusColors = {
    processing: 'text-yellow-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
    timeout: 'text-orange-600'
  };

  const categoryColors = {
    technical: 'text-blue-600',
    general: 'text-green-600',
    specific: 'text-purple-600',
    creative: 'text-orange-600',
    analytical: 'text-red-600'
  };

  // Mock data for RAG sessions
  const mockSessions: RAGSession[] = [
    {
      id: '1',
      userQuery: 'What are the latest features in our product?',
      response: 'Based on our documentation, the latest features include...',
      status: 'completed',
      sessionStart: new Date('2024-01-15T10:00:00'),
      responseTime: 2.1,
      confidence: 0.92,
      sourceDocuments: 3,
      modelUsed: 'gpt-4',
      tokensUsed: 450,
      userSatisfaction: 4,
      category: 'technical'
    },
    {
      id: '2',
      userQuery: 'How do I configure the system settings?',
      response: 'To configure system settings, you need to...',
      status: 'completed',
      sessionStart: new Date('2024-01-15T11:00:00'),
      responseTime: 1.8,
      confidence: 0.88,
      sourceDocuments: 2,
      modelUsed: 'gpt-4',
      tokensUsed: 320,
      userSatisfaction: 5,
      category: 'technical'
    },
    {
      id: '3',
      userQuery: 'What is the company policy on remote work?',
      response: 'According to our HR policies, remote work is...',
      status: 'processing',
      sessionStart: new Date('2024-01-15T12:00:00'),
      responseTime: 0,
      confidence: 0,
      sourceDocuments: 0,
      modelUsed: 'gpt-4',
      tokensUsed: 0,
      category: 'general'
    },
    {
      id: '4',
      userQuery: 'Generate a creative marketing slogan',
      response: 'Here are some creative marketing slogans...',
      status: 'completed',
      sessionStart: new Date('2024-01-15T09:00:00'),
      responseTime: 3.2,
      confidence: 0.85,
      sourceDocuments: 1,
      modelUsed: 'gpt-4',
      tokensUsed: 280,
      userSatisfaction: 4,
      category: 'creative'
    },
    {
      id: '5',
      userQuery: 'Analyze the quarterly sales data',
      response: 'Based on the quarterly sales data analysis...',
      status: 'failed',
      sessionStart: new Date('2024-01-15T08:00:00'),
      responseTime: 5.0,
      confidence: 0.45,
      sourceDocuments: 0,
      modelUsed: 'gpt-4',
      tokensUsed: 150,
      userSatisfaction: 2,
      category: 'analytical'
    },
    {
      id: '6',
      userQuery: 'What are the specific requirements for project X?',
      response: 'The specific requirements for project X include...',
      status: 'completed',
      sessionStart: new Date('2024-01-15T13:00:00'),
      responseTime: 2.5,
      confidence: 0.94,
      sourceDocuments: 4,
      modelUsed: 'gpt-4',
      tokensUsed: 520,
      userSatisfaction: 5,
      category: 'specific'
    },
    {
      id: '7',
      userQuery: 'How to troubleshoot network connectivity issues?',
      response: 'To troubleshoot network connectivity issues...',
      status: 'timeout',
      sessionStart: new Date('2024-01-15T14:00:00'),
      responseTime: 10.0,
      confidence: 0.0,
      sourceDocuments: 0,
      modelUsed: 'gpt-4',
      tokensUsed: 0,
      category: 'technical'
    },
    {
      id: '8',
      userQuery: 'What are the best practices for data security?',
      response: 'The best practices for data security include...',
      status: 'completed',
      sessionStart: new Date('2024-01-15T15:00:00'),
      responseTime: 2.8,
      confidence: 0.91,
      sourceDocuments: 3,
      modelUsed: 'gpt-4',
      tokensUsed: 380,
      userSatisfaction: 4,
      category: 'technical'
    }
  ];

  const StatCard = ({ title, value, icon: Icon, change, changeType }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    changeType?: 'positive' | 'negative';
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
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

  const loadSessionData = () => {
    // TODO: Replace with real API call
    setSessions(mockSessions);
    calculateStats(mockSessions);
  };

  const calculateStats = (sessionData: RAGSession[]) => {
    const total = sessionData.length;
    const completed = sessionData.filter(s => s.status === 'completed').length;
    const failed = sessionData.filter(s => s.status === 'failed').length;

    const avgResponseTime = 2.4; // Mock average response time in seconds
    const satisfactionRate = 92; // Mock satisfaction rate
    const accuracyRate = 94.5; // Mock accuracy rate
    const modelPerformance = 89.2; // Mock model performance

    setAutomationStats({
      totalSessions: total,
      completedSessions: completed,
      failedSessions: failed,
      avgResponseTime,
      satisfactionRate,
      accuracyRate,
      modelPerformance
    });
  };

  const handleAutomationControl = (action: string) => {
    console.log(`Local AI Chatbot for Documents (Powered by RAG) Automation: ${action}`);
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
        .eq('workflow_name', 'Local AI Chatbot for Documents (Powered by RAG)')
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
        .eq('workflow_name', 'Local AI Chatbot for Documents (Powered by RAG)');

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
          workflow_name: 'Local AI Chatbot for Documents (Powered by RAG)',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the Local AI Chatbot for Documents (Powered by RAG) workflow`,
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

  const getProcessingSessions = () => {
    return sessions.filter(session => session.status === 'processing');
  };

  const getFailedSessions = () => {
    return sessions.filter(session => session.status === 'failed');
  };

  const getPipelineData = () => {
    const statusCounts = {
      processing: sessions.filter(s => s.status === 'processing').length,
      completed: sessions.filter(s => s.status === 'completed').length,
      failed: sessions.filter(s => s.status === 'failed').length,
      timeout: sessions.filter(s => s.status === 'timeout').length
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: sessionStatuses[status as keyof typeof sessionStatuses].label,
      count,
      color: sessionStatuses[status as keyof typeof sessionStatuses].color
    }));
  };

  const getCategoryDistribution = () => {
    const categories = sessions.reduce((acc, session) => {
      acc[session.category] = (acc[session.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      percentage: (count / sessions.length) * 100
    }));
  };

  const getModelPerformanceData = () => {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const avgConfidence = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.confidence, 0) / completedSessions.length
      : 0;
    const avgTokens = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.tokensUsed, 0) / completedSessions.length
      : 0;
    const avgSources = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.sourceDocuments, 0) / completedSessions.length
      : 0;

    return [
      { metric: 'Avg Confidence', value: `${avgConfidence.toFixed(1)}%`, icon: Star },
      { metric: 'Avg Tokens Used', value: Math.round(avgTokens), icon: Cpu },
      { metric: 'Avg Sources', value: avgSources.toFixed(1), icon: Database }
    ];
  };

  useEffect(() => {
    loadSessionData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.workflowName;
      if (name?.startsWith('Local Chatbot with Retrieval Augmented Generation (RAG)')) {
        loadSessionData();
        loadPendingRequests();
        loadProcessedRequests();
      }
    };
    window.addEventListener('workflowExecutionUpdate', handler as EventListener);
    return () => window.removeEventListener('workflowExecutionUpdate', handler as EventListener);
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      <AdminBannerOverlay workflowName="Local Chatbot with Retrieval Augmented Generation (RAG)" />

      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">Local RAG Chatbot Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage your local RAG-powered chatbot system
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </Badge>
          <Button onClick={() => handleAutomationControl('toggle')}>
            <Pause className="w-4 h-4 mr-2" />
            Pause Chatbot
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
                  🎉 Showing real-time Local AI Chatbot for Documents (Powered by RAG) metrics from your workflow executions
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
              Request admin to start, stop, or modify your Local AI Chatbot for Documents (Powered by RAG) workflow
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
          change="+8"
          changeType="positive"
        />
        <StatCard
          title="Completed"
          value={automationStats.completedSessions}
          icon={CheckCircle}
          change="+6"
          changeType="positive"
        />
        <StatCard
          title="Avg Response Time"
          value={`${automationStats.avgResponseTime}s`}
          icon={Clock}
          change="-0.3s"
          changeType="positive"
        />
        <StatCard
          title="Accuracy Rate"
          value={`${automationStats.accuracyRate}%`}
          icon={TrendingUp}
          change="+2.1%"
          changeType="positive"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Session Processing Pipeline</CardTitle>
            <CardDescription>
              Distribution of chat sessions by processing status
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

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Query Categories</CardTitle>
            <CardDescription>
              Distribution by query category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getCategoryDistribution().slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{item.category}</span>
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
            Latest RAG-powered chat interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="max-w-md">
                    <p className="font-medium truncate">{session.userQuery}</p>
                    <p className="text-sm text-muted-foreground">{session.modelUsed}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(session.sessionStart, 'MMM dd, HH:mm')} • {session.category}
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
                  <Badge
                    variant="outline"
                    className={categoryColors[session.category]}
                  >
                    {session.category}
                  </Badge>
                  {session.status === 'completed' && (
                    <div className="text-right">
                      <p className="text-sm font-bold">{session.confidence}%</p>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processing Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Currently Processing Sessions</CardTitle>
          <CardDescription>
            Sessions being processed by the local RAG model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getProcessingSessions().map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="max-w-md">
                    <p className="font-medium truncate">{session.userQuery}</p>
                    <p className="text-sm text-muted-foreground">{session.modelUsed}</p>
                    <p className="text-xs text-muted-foreground">
                      Processing for {Math.floor((Date.now() - session.sessionStart.getTime()) / 1000)}s
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    Processing
                  </Badge>
                  <Progress value={65} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Failed Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Failed Sessions</CardTitle>
          <CardDescription>
            Sessions that encountered errors or timeouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getFailedSessions().map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="max-w-md">
                    <p className="font-medium truncate">{session.userQuery}</p>
                    <p className="text-sm text-muted-foreground">{session.modelUsed}</p>
                    <p className="text-xs text-muted-foreground">
                      Failed at {format(session.sessionStart, 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Failed
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Zap className="w-4 h-4 mr-1" />
                    Retry
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Metrics</CardTitle>
          <CardDescription>
            Key performance indicators for the local RAG model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getModelPerformanceData().map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <item.icon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">{item.metric}</span>
                </div>
                <span className="text-sm font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Local RAG Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Local RAG Controls</CardTitle>
          <CardDescription>
            Manage your local RAG chatbot system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleAutomationControl('start')}
              className="h-auto p-4 flex flex-col items-center"
            >
              <Play className="w-6 h-6 mb-2" />
              <span>Start Chatbot</span>
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
              <span>Retrain Model</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>
            Monitor local RAG chatbot system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Cpu className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Local Model</p>
                <p className="text-xs text-muted-foreground">Running</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Vector Database</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <HardDrive className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Knowledge Base</p>
                <p className="text-xs text-muted-foreground">Synced</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Memory className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Memory Usage</p>
                <p className="text-xs text-muted-foreground">Optimal</p>
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

export default LocalRAGDashboard;
