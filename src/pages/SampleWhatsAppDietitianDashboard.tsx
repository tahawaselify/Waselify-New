import React, { useState, useEffect } from 'react'
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Database,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Star,
  Apple,
  Heart,
  Scale,
  Database
} from 'lucide-react';
import { format } from 'date-fns';
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface DietitianChat {
  id: string;
  clientName: string;
  clientPhone: string;
  sessionStart: Date;
  lastMessage: Date;
  messageCount: number;
  status: 'active' | 'completed' | 'paused' | 'escalated';
  topic: 'meal_plan' | 'weight_loss' | 'nutrition_advice' | 'health_goals' | 'diet_restrictions' | 'general';
  satisfaction?: number;
  aiConfidence: number;
  escalationReason?: string;
  dietitianAssigned?: string;
}

interface AutomationStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  avgResponseTime: number;
  satisfactionRate: number;
  escalationRate: number;
  aiAccuracy: number;
}

const SampleWhatsAppDietitianDashboard: React.FC = () => {
  const [chats, setChats] = useState<DietitianChat[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const [automationStats, setAutomationStats] = useState<AutomationStats>({
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0,
    avgResponseTime: 0,
    satisfactionRate: 0,
    escalationRate: 0,
    aiAccuracy: 0
  });

  const chatStatuses = {
    active: { label: 'Active', color: 'bg-green-500' },
    completed: { label: 'Completed', color: 'bg-blue-500' },
    paused: { label: 'Paused', color: 'bg-yellow-500' },
    escalated: { label: 'Escalated', color: 'bg-red-500' }
  };

  const statusColors = {
    active: 'text-green-600',
    completed: 'text-blue-600',
    paused: 'text-yellow-600',
    escalated: 'text-red-600'
  };

  const topicColors = {
    meal_plan: 'text-blue-600',
    weight_loss: 'text-green-600',
    nutrition_advice: 'text-purple-600',
    health_goals: 'text-orange-600',
    diet_restrictions: 'text-red-600',
    general: 'text-gray-600'
  };

  // Sample data for demonstration
  const sampleChats: DietitianChat[] = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      clientPhone: '+1234567890',
      sessionStart: new Date('2024-01-15T10:00:00'),
      lastMessage: new Date('2024-01-15T14:30:00'),
      messageCount: 24,
      status: 'active',
      topic: 'weight_loss',
      satisfaction: 4,
      aiConfidence: 92
    },
    {
      id: '2',
      clientName: 'Michael Chen',
      clientPhone: '+1234567891',
      sessionStart: new Date('2024-01-14T09:00:00'),
      lastMessage: new Date('2024-01-15T16:00:00'),
      messageCount: 18,
      status: 'completed',
      topic: 'meal_plan',
      satisfaction: 5,
      aiConfidence: 95
    },
    {
      id: '3',
      clientName: 'Emily Rodriguez',
      clientPhone: '+1234567892',
      sessionStart: new Date('2024-01-15T11:00:00'),
      lastMessage: new Date('2024-01-15T13:45:00'),
      messageCount: 15,
      status: 'active',
      topic: 'nutrition_advice',
      satisfaction: 4,
      aiConfidence: 88
    },
    {
      id: '4',
      clientName: 'David Kim',
      clientPhone: '+1234567893',
      sessionStart: new Date('2024-01-13T08:00:00'),
      lastMessage: new Date('2024-01-14T17:00:00'),
      messageCount: 32,
      status: 'escalated',
      topic: 'diet_restrictions',
      satisfaction: 2,
      aiConfidence: 75,
      escalationReason: 'Complex dietary restrictions requiring human consultation',
      dietitianAssigned: 'Dr. Lisa Wang'
    },
    {
      id: '5',
      clientName: 'Lisa Wang',
      clientPhone: '+1234567894',
      sessionStart: new Date('2024-01-15T12:00:00'),
      lastMessage: new Date('2024-01-15T15:20:00'),
      messageCount: 12,
      status: 'active',
      topic: 'health_goals',
      satisfaction: 4,
      aiConfidence: 90
    },
    {
      id: '6',
      clientName: 'James Wilson',
      clientPhone: '+1234567895',
      sessionStart: new Date('2024-01-12T10:00:00'),
      lastMessage: new Date('2024-01-13T14:00:00'),
      messageCount: 28,
      status: 'completed',
      topic: 'weight_loss',
      satisfaction: 5,
      aiConfidence: 93
    },
    {
      id: '7',
      clientName: 'Maria Garcia',
      clientPhone: '+1234567896',
      sessionStart: new Date('2024-01-15T13:00:00'),
      lastMessage: new Date('2024-01-15T16:30:00'),
      messageCount: 8,
      status: 'paused',
      topic: 'general',
      satisfaction: 3,
      aiConfidence: 85
    },
    {
      id: '8',
      clientName: 'Robert Taylor',
      clientPhone: '+1234567897',
      sessionStart: new Date('2024-01-14T14:00:00'),
      lastMessage: new Date('2024-01-15T09:00:00'),
      messageCount: 20,
      status: 'active',
      topic: 'meal_plan',
      satisfaction: 4,
      aiConfidence: 89
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

  const loadChatData = () => {
    // Sample data for demonstration
    setChats(sampleChats);
    calculateStats(sampleChats);
  };

  const calculateStats = (chatData: DietitianChat[]) => {
    const total = chatData.length;
    const active = chatData.filter(c => c.status === 'active').length;
    const completed = chatData.filter(c => c.status === 'completed').length;
    
    const avgResponseTime = 1.8; // Sample average response time in minutes
    const satisfactionRate = 85; // Sample satisfaction rate
    const escalationRate = 20; // Sample escalation rate
    const aiAccuracy = 91.5; // Sample AI accuracy rate

    setAutomationStats({
      totalSessions: total,
      activeSessions: active,
      completedSessions: completed,
      avgResponseTime,
      satisfactionRate,
      escalationRate,
      aiAccuracy
    });
  };

  const handleAutomationControl = (action: string) => {
    console.log(`Sample WhatsApp Dietitian AI Automation ${action} triggered`);
    // Sample automation control logic
  };

  const getActiveChats = () => {
    return chats.filter(chat => chat.status === 'active');
  };

  const getEscalatedChats = () => {
    return chats.filter(chat => chat.status === 'escalated');
  };

  const getPipelineData = () => {
    const statusCounts = {
      active: chats.filter(c => c.status === 'active').length,
      completed: chats.filter(c => c.status === 'completed').length,
      paused: chats.filter(c => c.status === 'paused').length,
      escalated: chats.filter(c => c.status === 'escalated').length
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: chatStatuses[status as keyof typeof chatStatuses].label,
      count,
      color: chatStatuses[status as keyof typeof chatStatuses].color
    }));
  };

  const getTopicDistribution = () => {
    const topics = chats.reduce((acc, chat) => {
      acc[chat.topic] = (acc[chat.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(topics).map(([topic, count]) => ({
      topic: topic.replace('_', ' ').charAt(0).toUpperCase() + topic.replace('_', ' ').slice(1),
      count,
      percentage: (count / chats.length) * 100
    }));
  };

  const getSatisfactionDistribution = () => {
    const satisfied = chats.filter(c => c.satisfaction && c.satisfaction >= 4).length;
    const neutral = chats.filter(c => c.satisfaction && c.satisfaction === 3).length;
    const dissatisfied = chats.filter(c => c.satisfaction && c.satisfaction <= 2).length;

    return [
      { rating: 'Satisfied (4-5)', count: satisfied, percentage: (satisfied / chats.length) * 100 },
      { rating: 'Neutral (3)', count: neutral, percentage: (neutral / chats.length) * 100 },
      { rating: 'Dissatisfied (1-2)', count: dissatisfied, percentage: (dissatisfied / chats.length) * 100 }
    ];
  };

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start WhatsApp Dietitian Assistant workflow',
        created_at: new Date().toISOString(),
        status: 'pending'
      }
    ]);
  };

  const loadProcessedRequests = async () => {
    // Sample data for preview
    setProcessedRequests([
      {
        id: '2',
        action: 'modify',
        details: 'Request to modify WhatsApp Dietitian Assistant workflow settings',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        status: 'approved'
      }
    ]);
  };

  const handleWorkflowRequest = async (action: 'start' | 'stop' | 'modify') => {
    toast({
      title: "Sample Request",
      description: `This is a sample dashboard. In the actual workflow, your ${action} request would be submitted for admin approval.`,
    });
  };

  useEffect(() => {
    loadChatData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        {/* Sample Dashboard Notice */}
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800">Sample Dashboard Notice</h3>
              <p className="text-yellow-700 text-sm">
                This is a sample dashboard showing how your WhatsApp Dietitian workflow dashboard will look when you purchase this workflow. 
                All data shown is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton to="/marketplace" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">WhatsApp Dietitian AI Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage your AI-powered dietitian chatbot system
            </p>
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



        {/* Workflow Control Request */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Workflow Control</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your WhatsApp Dietitian Assistant workflow
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Requests</span>
            </CardTitle>
            <CardDescription>
              Your workflow control requests awaiting admin approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="capitalize">
                      {request.action}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{request.details}</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Processed Requests */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Recent Processed Requests</span>
            </CardTitle>
            <CardDescription>
              Your recently approved or rejected workflow requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="capitalize">
                      {request.action}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{request.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.status === 'approved' ? 'Approved' : 'Rejected'} on {new Date(request.updated_at || request.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                    {request.status === 'approved' ? 'Approved' : 'Rejected'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Sessions"
            value={automationStats.totalSessions}
            icon={MessageSquare}
            change="+5"
            changeType="positive"
          />
          <StatCard
            title="Active Sessions"
            value={automationStats.activeSessions}
            icon={Users}
            change="+2"
            changeType="positive"
          />
          <StatCard
            title="Avg Response Time"
            value={`${automationStats.avgResponseTime}m`}
            icon={Clock}
            change="-0.3m"
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
          {/* Chat Pipeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Chat Session Pipeline</CardTitle>
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
              <CardTitle>Consultation Topics</CardTitle>
              <CardDescription>
                Distribution by consultation topic
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

        {/* Recent Chats */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Chat Sessions</CardTitle>
            <CardDescription>
              Latest dietitian consultation sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chats.slice(0, 5).map((chat) => (
                <div key={chat.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{chat.clientName}</p>
                      <p className="text-sm text-muted-foreground">{chat.topic.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(chat.sessionStart, 'MMM dd, HH:mm')} • {chat.messageCount} messages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={statusColors[chat.status]}
                    >
                      {chatStatuses[chat.status].label}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={topicColors[chat.topic]}
                    >
                      {chat.topic.replace('_', ' ')}
                    </Badge>
                    {chat.satisfaction && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-sm">{chat.satisfaction}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Chats */}
        <Card>
          <CardHeader>
            <CardTitle>Active Chat Sessions</CardTitle>
            <CardDescription>
              Currently ongoing dietitian consultations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getActiveChats().map((chat) => (
                <div key={chat.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{chat.clientName}</p>
                      <p className="text-sm text-muted-foreground">{chat.topic.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        Active for {Math.floor((Date.now() - chat.sessionStart.getTime()) / 60000)}m
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Live
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-bold">{chat.aiConfidence}%</p>
                      <p className="text-xs text-muted-foreground">AI Confidence</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Escalated Chats */}
        <Card>
          <CardHeader>
            <CardTitle>Escalated Sessions</CardTitle>
            <CardDescription>
              Sessions requiring human dietitian intervention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getEscalatedChats().map((chat) => (
                <div key={chat.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{chat.clientName}</p>
                      <p className="text-sm text-muted-foreground">{chat.topic.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {chat.escalationReason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Escalated
                    </Badge>
                    {chat.dietitianAssigned && (
                      <div className="text-right">
                        <p className="text-sm font-bold">{chat.dietitianAssigned}</p>
                        <p className="text-xs text-muted-foreground">Assigned</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Satisfaction and AI Accuracy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Satisfaction Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Client Satisfaction</CardTitle>
              <CardDescription>
                Distribution of client satisfaction ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getSatisfactionDistribution().map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{item.rating}</span>
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

          {/* AI Performance */}
          <Card>
            <CardHeader>
              <CardTitle>AI Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for the AI system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">AI Accuracy</span>
                  </div>
                  <span className="text-sm font-bold">{automationStats.aiAccuracy}%</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Avg Response Time</span>
                  </div>
                  <span className="text-sm font-bold">{automationStats.avgResponseTime}m</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Escalation Rate</span>
                  </div>
                  <span className="text-sm font-bold">{automationStats.escalationRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dietitian Chatbot Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Dietitian Chatbot Controls</CardTitle>
            <CardDescription>
              Manage your WhatsApp dietitian AI chatbot system
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
                <span>Update Knowledge</span>
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
              Monitor dietitian chatbot system components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">WhatsApp API</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Bot className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">AI Dietitian Engine</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Database className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Nutrition Database</p>
                  <p className="text-xs text-muted-foreground">Synced</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Heart className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Health Guidelines</p>
                  <p className="text-xs text-muted-foreground">Updated</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SampleWhatsAppDietitianDashboard; 