import { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Brain, 
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Phone,
  MessageCircle,
  Zap,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText,
  AlertTriangle,
  Filter,
  Archive,
  Star,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  UserX,
  ShoppingCart,
  Package,
  Tag,
  DollarSign,
  Search,
  Database,
  XCircle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { supabase } from '@/lib/supabaseClient';

const SampleWhatsAppChatbotDashboard = () => {
  const { t, i18n } = useTranslation();
  const nf = useMemo(() => new Intl.NumberFormat(i18n.language || undefined), [i18n.language]);
  const fmt = (n: number | string) => {
    const num = typeof n === 'string' ? Number(n) : n;
    return Number.isFinite(num as number) ? nf.format(num as number) : String(n);
  };
  const tActionLabel = (action: string) => t(`labels.${{ start: 'start', stop: 'stop', modify: 'changes' }[action] || action}`);
  const tActionDesc = (action: string) => t(`labels.${{ start: 'startDesc', stop: 'stopDesc', modify: 'changesDesc' }[action] || action}`);
  const tStatus = (status: string) => {
    // Translate known statuses or pass-through if already a translation key like 'badgeStatus.*'
    if (status?.startsWith('badgeStatus.')) return t(status);
    const map: Record<string, string> = { approved: 'approved', rejected: 'rejected', pending: 'pending', active: 'active', paused: 'paused', live: 'live', resolved: 'resolved', escalated: 'escalated', abandoned: 'abandoned' };
    return t(`badgeStatus.${map[status] || status}`);
  };
  const INTENT_KEY: Record<string, string> = {
    'Product Inquiries': 'productInformation',
    'Pricing Questions': 'pricing',
    'Support Requests': 'technicalSupport',
    'Order Status': 'orderStatus'
  };
  const tIntent = (label: string) => INTENT_KEY[label] ? t(`topics.${INTENT_KEY[label]}`) : label;
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  
  // Sample metrics data
  const [metrics, setMetrics] = useState({
    messagesProcessed: 1247,
    aiResponsesGenerated: 1189,
    vectorStoreQueries: 856,
    activeUserSessions: 23,
    averageResponseTime: 1.2,
    fileProcessingCount: 45,
    embeddingOperations: 234,
    conversationSatisfaction: 89.5,
    memorySessions: 156,
    nonTextMessages: 67
  });

  const handleStartAutomation = async () => {
    setIsLoading(true);
    try {
      // Sample automation control
      setIsRunning(true);
      toast({
        title: "Workflow Started",
        description: "WhatsApp ChatBot automation is now running",
      });
    } catch (error) {
      console.error('Error starting automation:', error);
      toast({
        title: "Error",
        description: "Failed to start workflow automation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseAutomation = async () => {
    setIsLoading(true);
    try {
      // Sample automation control
      setIsRunning(false);
      toast({
        title: "Workflow Paused",
        description: "WhatsApp ChatBot automation has been paused",
      });
    } catch (error) {
      console.error('Error pausing automation:', error);
      toast({
        title: "Error",
        description: "Failed to pause workflow automation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      // Sample data refresh
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, trend = 'up' }: {
    title: string;
    value: string;
    change?: string;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center mt-1">
                {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
                {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500" />}
                {trend === 'neutral' && <Minus className="h-4 w-4 text-gray-500" />}
                <span className={`text-sm ml-1 ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <Icon className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-yellow-100 text-yellow-800';
      case 'read': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Automated WhatsApp Chat Assistant workflow',
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
        details: 'Request to modify Automated WhatsApp Chat Assistant workflow settings',
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

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'product_inquiry': return 'bg-purple-100 text-purple-800';
      case 'pricing': return 'bg-orange-100 text-orange-800';
      case 'support': return 'bg-blue-100 text-blue-800';
      case 'order_status': return 'bg-green-100 text-green-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Load sample data on component mount
  useEffect(() => {
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
          <div className="flex items-center justify-between">
            <div>
              <BackButton to="/marketplace" />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">WhatsApp ChatBot Dashboard</h1>
              <p className="text-gray-600 mt-2">
                AI-powered WhatsApp chatbot acting as a Sales Agent with product catalog integration 
                to answer customer questions and drive sales conversations.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={isRunning ? handlePauseAutomation : handleStartAutomation}
                disabled={isLoading}
                variant={isRunning ? "destructive" : "default"}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : isRunning ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{isRunning ? t('labels.stop') : t('labels.start')} {t('pages?.automation' as any) || 'Automation'}</span>
              </Button>
              <Button
                onClick={handleRefreshData}
                disabled={isLoading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{t('common.refresh', { defaultValue: 'Refresh' })}</span>
              </Button>
            </div>
          </div>

          

          {/* Workflow Control Request */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('sections.chatbotControls')}</CardTitle>
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
                    <span>{t('labels.start')}</span>
                  </Button>
                  <Button
                    onClick={() => handleWorkflowRequest('stop')}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
                  >
                    <XCircle className="w-6 h-6 mb-2" />
                    <span>{t('labels.stop')}</span>
                  </Button>
                  <Button
                    onClick={() => handleWorkflowRequest('modify')}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
                  >
                    <Settings className="w-6 h-6 mb-2" />
                    <span>{t('labels.changes')}</span>
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{t('labels.requestsAwaitingApproval')}</span>
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
                          {t('labels.submittedOn')} {new Date(request.created_at).toLocaleString(i18n.language || undefined)}
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>{t('labels.recentlyApprovedOrRejected')}</span>
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
                          {request.status === 'approved' ? t('badgeStatus.approved') : t('badgeStatus.rejected')} {t('labels.on')} {new Date(request.updated_at || request.created_at).toLocaleString(i18n.language || undefined)}
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

          {/* WhatsApp Chatbot Specific Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title={t('stats.messagesProcessed', { defaultValue: 'Messages Processed' })}
              value={fmt(metrics.messagesProcessed)}
              change={t('stats.changeFromLastWeek', { val: '+18%', defaultValue: '+18% from last week' })}
              icon={MessageSquare}
              trend="up"
            />
            <StatCard
              title={t('stats.aiResponses', { defaultValue: 'AI Responses' })}
              value={fmt(metrics.aiResponsesGenerated)}
              change={t('stats.changeFromLastWeek', { val: '+12%', defaultValue: '+12% from last week' })}
              icon={Brain}
              trend="up"
            />
            <StatCard
              title={t('stats.vectorQueries', { defaultValue: 'Vector Queries' })}
              value={fmt(metrics.vectorStoreQueries)}
              change={t('stats.changeFromLastWeek', { val: '+25%', defaultValue: '+25% from last week' })}
              icon={Search}
              trend="up"
            />
            <StatCard
              title={t('stats.activeSessions', { defaultValue: 'Active Sessions' })}
              value={fmt(metrics.activeUserSessions)}
              change="+8% from last week"
              icon={Users}
              trend="up"
            />
          </div>

          {/* Additional WhatsApp Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title={t('stats.avgResponseTime', { defaultValue: 'Avg Response Time' })}
              value={`${fmt(Number(metrics.averageResponseTime.toFixed(1)))}s`}
              icon={Zap}
            />
            <StatCard
              title={t('stats.fileProcessing', { defaultValue: 'File Processing' })}
              value={fmt(metrics.fileProcessingCount)}
              icon={FileText}
            />
            <StatCard
              title={t('stats.embeddingOps', { defaultValue: 'Embedding Ops' })}
              value={fmt(metrics.embeddingOperations)}
              icon={Package}
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title={t('stats.memorySessions', { defaultValue: 'Memory Sessions' })}
              value={fmt(metrics.memorySessions)}
              icon={Activity}
            />
            <StatCard
              title={t('stats.satisfactionRate', { defaultValue: 'Satisfaction Rate' })}
              value={`${fmt(Number(metrics.conversationSatisfaction.toFixed(1)))}%`}
              icon={Star}
            />
            <StatCard
              title={t('stats.nonTextMessages', { defaultValue: 'Non-Text Messages' })}
              value={fmt(metrics.nonTextMessages)}
              icon={Phone}
            />
            <StatCard
              title={t('stats.successRate', { defaultValue: 'Success Rate' })}
              value={`${fmt(Number((((metrics.aiResponsesGenerated / Math.max(metrics.messagesProcessed, 1)) * 100)).toFixed(1)))}%`}
              icon={CheckCircle}
            />
          </div>

          {/* WhatsApp Workflow Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Workflow Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Badge variant={isRunning ? 'default' : 'secondary'}>
                  {isRunning ? t('badgeStatus.active') : t('badgeStatus.paused')}
                </Badge>
                <span className="text-sm text-gray-600">
                  {t('labels.lastUpdated')} {new Date().toLocaleString(i18n.language || undefined)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>{t('sections.activitySummary', { defaultValue: 'WhatsApp Activity Summary' })}</span>
              </CardTitle>
              <CardDescription>
                {t('labels.activityOverview', { defaultValue: 'Overview of recent chatbot activity and performance' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('stats.messagesProcessedToday', { defaultValue: 'Messages Processed Today' })}</span>
                    <span className="text-lg font-bold text-green-600">{fmt(metrics.messagesProcessed)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('stats.aiResponsesGenerated', { defaultValue: 'AI Responses Generated' })}</span>
                    <span className="text-lg font-bold text-blue-600">{fmt(metrics.aiResponsesGenerated)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('stats.vectorStoreQueries', { defaultValue: 'Vector Store Queries' })}</span>
                    <span className="text-lg font-bold text-purple-600">{fmt(metrics.vectorStoreQueries)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('stats.activeUserSessions', { defaultValue: 'Active User Sessions' })}</span>
                    <span className="text-lg font-bold text-orange-600">{fmt(metrics.activeUserSessions)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('stats.averageResponseTime', { defaultValue: 'Average Response Time' })}</span>
                    <span className="text-lg font-bold text-indigo-600">{fmt(Number(metrics.averageResponseTime.toFixed(1)))}s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('stats.fileProcessingCount', { defaultValue: 'File Processing Count' })}</span>
                    <span className="text-lg font-bold text-teal-600">{fmt(metrics.fileProcessingCount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('stats.embeddingOperations', { defaultValue: 'Embedding Operations' })}</span>
                    <span className="text-lg font-bold text-pink-600">{fmt(metrics.embeddingOperations)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('stats.conversationSatisfaction', { defaultValue: 'Conversation Satisfaction' })}</span>
                    <span className="text-lg font-bold text-yellow-600">{fmt(Number(metrics.conversationSatisfaction.toFixed(1)))}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Message Intent Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{tIntent('Product Inquiries')}</span>
                      <span>{fmt(45)}%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{tIntent('Pricing Questions')}</span>
                      <span>{fmt(25)}%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{tIntent('Support Requests')}</span>
                      <span>{fmt(20)}%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{tIntent('Order Status')}</span>
                      <span>{fmt(10)}%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Catalog Query Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Product Searches</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Price Checks</span>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Availability</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Specifications</span>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{fmt(96)}%</div>
                  <div className="text-sm text-gray-600">{t('stats.aiResponseAccuracy', { defaultValue: 'AI Response Accuracy' })}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{fmt(1.2)}s</div>
                  <div className="text-sm text-gray-600">{t('stats.avgResponseTime', { defaultValue: 'Avg Response Time' })}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{fmt(89)}%</div>
                  <div className="text-sm text-gray-600">{t('stats.customerSatisfaction', { defaultValue: 'Customer Satisfaction' })}</div>
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

export default SampleWhatsAppChatbotDashboard; 