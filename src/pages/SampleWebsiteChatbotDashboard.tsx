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
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from 'react-i18next';
import { tStatTitle } from '@/lib/dashboardI18n';

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

const SampleWebsiteChatbotDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const [automationStats, setAutomationStats] = useState<AutomationStats>({
    totalSessions: 0,
    activeSessions: 0,
    resolvedSessions: 0,
    avgResponseTime: 0,
    satisfactionRate: 0,
    escalationRate: 0,
    conversionRate: 0
  });

  const { t } = useTranslation();


  const sessionStatuses = {
    active: { label: t('badgeStatus.active'), color: 'bg-blue-500' },
    resolved: { label: t('badgeStatus.resolved'), color: 'bg-green-500' },
    escalated: { label: t('badgeStatus.escalated'), color: 'bg-orange-500' },
    abandoned: { label: t('badgeStatus.abandoned'), color: 'bg-red-500' }
  };

  const TOPIC_KEY: Record<string, string> = {
    'Product Information': 'productInformation',
    'Pricing': 'pricing',
    'Technical Support': 'technicalSupport',
    'General Inquiry': 'generalInquiry',
    'Order Status': 'orderStatus'
  };
  const tTopic = (topic: string) => {
    const key = TOPIC_KEY[topic];
    return key ? t(`topics.${key}`) : topic;
  };

  const ACTION_LABEL_KEY: Record<string, string> = {
    start: 'start',
    stop: 'stop',
    modify: 'changes'
  };
  const ACTION_DESC_KEY: Record<string, string> = {
    start: 'startDesc',
    stop: 'stopDesc',
    modify: 'changesDesc'
  };
  const tActionLabel = (action: string) => {
    const key = ACTION_LABEL_KEY[action];
    return key ? t(`labels.${key}`) : action;
  };
  const tActionDesc = (action: string) => {
    const key = ACTION_DESC_KEY[action];
    return key ? t(`labels.${key}`) : '';
  };

  // Sample data for demonstration
  const sampleSessions: ChatSession[] = [
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
    // Sample data for demonstration
    setSessions(sampleSessions);
    calculateStats(sampleSessions);
  };

  const calculateStats = (sessionData: ChatSession[]) => {
    const total = sessionData.length;
    const active = sessionData.filter(s => s.status === 'active').length;
    const resolved = sessionData.filter(s => s.status === 'resolved').length;
    const escalated = sessionData.filter(s => s.status === 'escalated').length;

    const avgResponseTime = 2.5; // Sample average response time in seconds
    const satisfactionRate = 85; // Sample satisfaction rate
    const escalationRate = (escalated / total) * 100;
    const conversionRate = 12; // Sample conversion rate

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

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start AI Website Chatbot workflow',
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
        details: 'Request to modify AI Website Chatbot workflow settings',
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
    console.log(`Sample Website Chatbot ${action} triggered`);
    // Sample automation control logic
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

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <BackButton to="/marketplace" />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">{t('pages.websiteChatbot.title')}</h1>
              <p className="text-gray-600 mt-2">{t('pages.websiteChatbot.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Activity className="w-3 h-3 mr-1" />
                {t('badgeStatus.active')}
              </Badge>
              <Button onClick={() => handleAutomationControl('toggle')}>
                <Pause className="w-4 h-4 mr-2" />
                {t('buttons.pauseBot')}
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
                      {tActionLabel(request.action)}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{tActionDesc(request.action)}</p>
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
                      {tActionLabel(request.action)}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{tActionDesc(request.action)}</p>
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
              <CardTitle>{t('sections.sessionStatusPipeline')}</CardTitle>
              <CardDescription>
                {t('labels.distributionByStatus')}
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
              <CardTitle>{t('sections.popularTopics')}</CardTitle>
              <CardDescription>
                {t('labels.commonTopicsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getTopicDistribution().slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{tTopic(item.topic)}</span>
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
            <CardTitle>{t('sections.recentChatSessions')}</CardTitle>
            <CardDescription>
              {t('labels.latestVisitorInteractions')}
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
                      <p className="text-sm text-muted-foreground">{tTopic(session.topic)}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.messageCount} {t('labels.messages')} • {format(session.sessionStart, 'MMM dd, HH:mm')}
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
            <CardTitle>{t('statTitles.activeSessions')}</CardTitle>
            <CardDescription>
              {t('labels.currentlyOngoingChats')}
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
                      <p className="text-sm text-muted-foreground">{tTopic(session.topic)}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('labels.activeForMinutes', { minutes: Math.floor((Date.now() - session.sessionStart.getTime()) / 60000) })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      {t('badgeStatus.live')}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {t('buttons.join')}
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
            <CardTitle>{t('sections.chatbotControls')}</CardTitle>
            <CardDescription>
              {t('labels.manageWebsiteChatbotAutomation')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleAutomationControl('start')}
                className="h-auto p-4 flex flex-col items-center"
              >
                <Play className="w-6 h-6 mb-2" />
                <span>{t('buttons.startAutoResponse')}</span>
              </Button>
              <Button
                onClick={() => handleAutomationControl('update')}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center"
              >
                <Settings className="w-6 h-6 mb-2" />
                <span>{t('buttons.updateKnowledgeBase')}</span>
              </Button>
              <Button
                onClick={() => handleAutomationControl('train')}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center"
              >
                <Zap className="w-6 h-6 mb-2" />
                <span>{t('buttons.trainAiModel')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.systemHealth')}</CardTitle>
            <CardDescription>
              {t('labels.systemHealthDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Globe className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{t('labels.websiteIntegration')}</p>
                  <p className="text-xs text-muted-foreground">{t('labels.connected')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Bot className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{t('labels.aiChatEngine')}</p>
                  <p className="text-xs text-muted-foreground">{t('labels.online')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Database className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{t('labels.documentIndex')}</p>
                  <p className="text-xs text-muted-foreground">{t('labels.connected')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{t('labels.messageQueue')}</p>
                  <p className="text-xs text-muted-foreground">{t('labels.healthy')}</p>
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

export default SampleWebsiteChatbotDashboard;