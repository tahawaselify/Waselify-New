import React, { useState, useEffect } from 'react'
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Play, 
  Pause, 
  Settings, 
  RefreshCw,
  Brain,
  Database,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Activity,
  BarChart,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText,
  Search,
  Cpu,
  HardDrive,
  XCircle, 
  Database,
  ArrowLeft
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { tStatTitle } from '@/lib/dashboardI18n';

interface ChatSession {
  id: string;
  user: string;
  query: string;
  response: string;
  status: 'active' | 'resolved' | 'escalated' | 'pending';
  confidence: number;
  created_at: string;
  response_time: number;
  documents_used: string[];
  ai_model: string;
}

interface AutomationStats {
  totalSessions: number;
  resolvedQueries: number;
  avgResponseTime: number;
  accuracyRate: number;
  activeSessions: number;
  documentsIndexed: number;
}

const LocalChatbotDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [automationStats, setAutomationStats] = useState<AutomationStats>({
    totalSessions: 0,
    resolvedQueries: 0,
    avgResponseTime: 0,
    accuracyRate: 0,
    activeSessions: 0,
    documentsIndexed: 0
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();

  const sessionStatuses = {
    active: { label: 'Active', color: 'bg-blue-100 text-blue-800' },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
    escalated: { label: 'Escalated', color: 'bg-orange-100 text-orange-800' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
  };

  const statusColors = {
    active: '#3B82F6',
    resolved: '#10B981',
    escalated: '#F97316',
    pending: '#F59E0B'
  };

  const StatCard = ({ title, value, change, icon: Icon, trend = 'up' }: {
    title: string;
    value: string;
    change?: string;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
  }) => {
    const { t } = useTranslation();
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <BackButton />
              <p className="text-sm font-medium text-muted-foreground">{tStatTitle(title, t)}</p>
              <p className="text-2xl font-bold">{value}</p>
              {change && (
                <div className="flex items-center mt-1">
                  {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
                  {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500" />}
                  {trend === 'neutral' && <Minus className="h-4 w-4 text-gray-500" />}
                  <span className={`text-sm ml-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                    {change}
                  </span>
                </div>
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
    setSessions([]);
    calculateStats([]);
  };

  const calculateStats = (data: ChatSession[]) => {
    const totalSessions = data.length;
    const resolvedQueries = data.filter(session => session.status === 'resolved').length;
    const activeSessions = data.filter(session => session.status === 'active').length;
    const avgResponseTime = data.length > 0 ? data.reduce((sum, session) => sum + session.response_time, 0) / data.length : 0;
    const accuracyRate = data.length > 0 ? data.reduce((sum, session) => sum + session.confidence, 0) / data.length : 0;
    const documentsIndexed = 1250; // Mock value

    setAutomationStats({
      totalSessions,
      resolvedQueries,
      avgResponseTime,
      accuracyRate,
      activeSessions,
      documentsIndexed
    });
  };

  const handleAutomationControl = (action: string) => {
    console.log(`${workflow_name} Automation: ${action}`);
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
        .eq('workflow_name', '${workflow_name}')
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
        .eq('workflow_name', '${workflow_name}');

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
          workflow_name: 'Local Chatbot',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the Local Chatbot workflow`,
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

  const getRecentSessions = () => {
    return sessions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  const getPipelineData = () => {
    const statusCounts = sessions.reduce((acc, session) => {
      acc[session.status] = (acc[session.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status as keyof typeof statusColors]
    }));
  };

  const getResponseTimeData = () => {
    const timeRanges = {
      '0-1s': 0,
      '1-2s': 0,
      '2-3s': 0,
      '3-5s': 0,
      '5s+': 0
    };

    sessions.forEach(session => {
      if (session.response_time < 1) timeRanges['0-1s']++;
      else if (session.response_time < 2) timeRanges['1-2s']++;
      else if (session.response_time < 3) timeRanges['2-3s']++;
      else if (session.response_time < 5) timeRanges['3-5s']++;
      else timeRanges['5s+']++;
    });

    return Object.entries(timeRanges).map(([range, count]) => ({
      range,
      count,
      color: count > 0 ? '#3B82F6' : '#E5E7EB'
    }));
  };

  useEffect(() => {
    loadSessionData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Local RAG Chatbot Dashboard</h1>
            <p className="text-gray-600 mt-1">AI-powered local document search and conversation system</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="w-4 h-4 mr-1" />
              {t('badgeStatus.active')}
            </Badge>
            <Button onClick={() => handleAutomationControl('refresh')}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('buttons.refresh')}
            </Button>
          </div>
        </div>

        {/* Automation Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold">Local RAG Chatbot</h3>
                  <p className="text-sm text-gray-600">Processing queries using local AI model and document knowledge base</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleAutomationControl('pause')}>
                  <Pause className="w-4 h-4 mr-1" />
                  {t('buttons.pauseAutomationLabel')}
                </Button>
                <Button size="sm" onClick={() => handleAutomationControl('start')}>
                  <Play className="w-4 h-4 mr-1" />
                  {t('buttons.startAutomationLabel')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  🎉 Showing real-time Local Chatbot metrics from your workflow executions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Control Request */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.workflowControl')}</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your ${workflow_name} workflow
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
                  <span>{t('buttons.requestStart')}</span>
                </Button>
                <Button 
                  onClick={() => handleWorkflowRequest('stop')}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
                >
                  <XCircle className="w-6 h-6 mb-2" />
                  <span>{t('buttons.requestStop')}</span>
                </Button>
                <Button 
                  onClick={() => handleWorkflowRequest('modify')}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
                >
                  <Settings className="w-6 h-6 mb-2" />
                  <span>{t('buttons.requestChanges')}</span>
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
              <CardTitle>{t('sections.pendingRequests')}</CardTitle>
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
                          {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      {t('badgeStatus.pending')}
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
              <CardTitle>{t('sections.recentProcessedRequests')}</CardTitle>
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
                          {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={request.status === 'approved' ? 'default' : 'destructive'}
                      className={
                        request.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                      }
                    >
                      {request.status === 'approved' ? t('badgeStatus.approved') : t('badgeStatus.rejected')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Sessions"
            value={automationStats.totalSessions.toString()}
            change="+18% from last week"
            icon={MessageSquare}
            trend="up"
          />
          <StatCard
            title="Resolved Queries"
            value={automationStats.resolvedQueries.toString()}
            change="+12% from last week"
            icon={CheckCircle}
            trend="up"
          />
          <StatCard
            title="Avg Response Time"
            value={`${automationStats.avgResponseTime.toFixed(1)}s`}
            change="-8% from last week"
            icon={Clock}
            trend="up"
          />
          <StatCard
            title="Accuracy Rate"
            value={`${automationStats.accuracyRate.toFixed(1)}%`}
            change="+5% from last week"
            icon={Target}
            trend="up"
          />
        </div>

        {/* Pipeline and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Status Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Session Status
              </CardTitle>
              <CardDescription>Query resolution status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getPipelineData().map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium capitalize">{item.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{item.count} sessions</span>
                      <span className="text-sm font-medium">
                        {((item.count / automationStats.totalSessions) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Response Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Response Time Distribution
              </CardTitle>
              <CardDescription>Query response time breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getResponseTimeData().map((item) => (
                  <div key={item.range} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium">{item.range}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{item.count} queries</span>
                      <span className="text-sm font-medium">
                        {automationStats.totalSessions > 0 ? ((item.count / automationStats.totalSessions) * 100).toFixed(1) : '0'}%
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
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Recent Chat Sessions
            </CardTitle>
            <CardDescription>Latest user interactions with the local chatbot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecentSessions().map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{session.user}</h4>
                      <p className="text-sm text-gray-600 truncate max-w-md">{session.query}</p>
                      <p className="text-xs text-gray-500">
                        Documents: {session.documents_used.join(', ')} | 
                        Model: {session.ai_model}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{session.response_time}s</p>
                      <p className="text-sm text-gray-600">{session.confidence}% confidence</p>
                    </div>
                    <Badge className={sessionStatuses[session.status].color}>
                      {sessionStatuses[session.status].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Local AI Controls
            </CardTitle>
            <CardDescription>Manage local RAG chatbot automation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center"
                onClick={() => handleAutomationControl('index_documents')}
              >
                <Search className="w-6 h-6 mb-2" />
                <span className="text-sm">Index Documents</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center"
                onClick={() => handleAutomationControl('train_model')}
              >
                <Cpu className="w-6 h-6 mb-2" />
                <span className="text-sm">Train AI Model</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center"
                onClick={() => handleAutomationControl('update_knowledge')}
              >
                <Database className="w-6 h-6 mb-2" />
                <span className="text-sm">Update Knowledge Base</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Health
            </CardTitle>
            <CardDescription>Local RAG chatbot system components status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">Local AI Model</p>
                  <p className="text-xs text-gray-600">Running</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">Vector Database</p>
                  <p className="text-xs text-gray-600">Connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">Document Index</p>
                  <p className="text-xs text-gray-600">{automationStats.documentsIndexed} docs</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">Memory Usage</p>
                  <p className="text-xs text-gray-600">2.1GB / 8GB</p>
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

export default LocalChatbotDashboard; 
