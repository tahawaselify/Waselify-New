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
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
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

const SampleLocalChatbotDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const [automationStats, setAutomationStats] = useState<AutomationStats>({
    totalSessions: 0,
    resolvedQueries: 0,
    avgResponseTime: 0,
    accuracyRate: 0,
    activeSessions: 0,
    documentsIndexed: 0
  });

  const { t } = useTranslation();


  const sampleSessions: ChatSession[] = [
    {
      id: '1',
      user: 'John Smith',
      query: 'What are the company policies regarding remote work?',
      response: 'Based on our employee handbook, remote work is allowed up to 3 days per week...',
      status: 'resolved',
      confidence: 94,
      created_at: '2024-01-15T10:30:00Z',
      response_time: 1.2,
      documents_used: ['Employee Handbook', 'HR Policies'],
      ai_model: 'Local GPT-4'
    },
    {
      id: '2',
      user: 'Sarah Johnson',
      query: 'How do I submit an expense report?',
      response: 'To submit an expense report, please use the expense management system...',
      status: 'resolved',
      confidence: 89,
      created_at: '2024-01-15T09:15:00Z',
      response_time: 0.8,
      documents_used: ['Expense Policy', 'Finance Guidelines'],
      ai_model: 'Local GPT-4'
    },
    {
      id: '3',
      user: 'Mike Chen',
      query: 'What is the process for requesting time off?',
      response: 'Time off requests should be submitted through the HR portal at least...',
      status: 'active',
      confidence: 92,
      created_at: '2024-01-15T08:45:00Z',
      response_time: 1.5,
      documents_used: ['Time Off Policy', 'HR Procedures'],
      ai_model: 'Local GPT-4'
    },
    {
      id: '4',
      user: 'Lisa Wang',
      query: 'Where can I find the project templates?',
      response: 'Project templates are available in the shared drive under Templates folder...',
      status: 'resolved',
      confidence: 87,
      created_at: '2024-01-15T08:20:00Z',
      response_time: 0.9,
      documents_used: ['Project Guidelines', 'Template Library'],
      ai_model: 'Local GPT-4'
    },
    {
      id: '5',
      user: 'David Brown',
      query: 'What are the security protocols for data access?',
      response: 'Data access requires proper authentication and follows the principle of...',
      status: 'pending',
      confidence: 91,
      created_at: '2024-01-15T07:55:00Z',
      response_time: 2.1,
      documents_used: ['Security Policy', 'Data Protection Guidelines'],
      ai_model: 'Local GPT-4'
    }
  ];

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
    setSessions(sampleSessions);
    calculateStats(sampleSessions);
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

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Local Chatbot workflow',
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
        details: 'Request to modify Local Chatbot workflow settings',
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

  const handleAutomationControl = (action: string) => {
    console.log(`Sample Local Chatbot Automation: ${action}`);
    // Sample automation control
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
        {/* Sample Dashboard Notice */}
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800">{t('sample.noticeTitle')}</h3>
              <p className="text-yellow-700 text-sm">
                {t('sample.noticeBody')}
              </p>
            </div>
          </div>
        </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <BackButton to="/dashboard" />
                <div>
                  <h1 className="text-3xl font-bold">{t('pages.localChatbot.title')}</h1>
                  <p className="text-muted-foreground">{t('pages.localChatbot.subtitle')}</p>
                </div>
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
          </div>



          {/* Workflow Control Request */}
          <Card>
            <CardHeader>
              <CardTitle>{t('sections.workflowControl')}</CardTitle>
              <CardDescription>
                {t('labels.workflowControlDesc')}
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
                  <p>• <strong>{t('labels.start')}:</strong> {t('labels.startDesc')}</p>
                  <p>• <strong>{t('labels.stop')}:</strong> {t('labels.stopDesc')}</p>
                  <p>• <strong>{t('labels.changes')}:</strong> {t('labels.changesDesc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{t('sections.pendingRequests')}</span>
              </CardTitle>
              <CardDescription>
                {t('labels.requestsAwaitingApproval')}
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
                          {t('labels.submittedOn')} {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{t('badgeStatus.pending')}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Processed Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>{t('sections.recentProcessedRequests')}</span>
              </CardTitle>
              <CardDescription>
                {t('labels.recentlyApprovedOrRejected')}
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
                          {request.status === 'approved' ? t('badgeStatus.approved') : t('badgeStatus.rejected')} {t('labels.on')} {new Date(request.updated_at || request.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                      {request.status === 'approved' ? t('badgeStatus.approved') : t('badgeStatus.rejected')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                {t('sections.recentChatSessions')}
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
                {t('sections.localAiControls')}
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
                  <span className="text-sm">{t('buttons.trainAiModel')}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center"
                  onClick={() => handleAutomationControl('update_knowledge')}
                >
                  <Database className="w-6 h-6 mb-2" />
                  <span className="text-sm">{t('buttons.updateKnowledgeBase')}</span>
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
    </div>
  );
};

export default SampleLocalChatbotDashboard;