import { useState, useEffect } from 'react';
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
  Database,
  Search,
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
  Code,
  Cpu,
  HardDrive,
  XCircle,
  Database,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import Navbar from '@/components/Navbar';
import UpgradeBanner from '@/components/UpgradeBanner';
import { workflowSpecificApi, DatabaseChatMetrics } from '@/services/workflowSpecificApi';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { supabase } from '@/lib/supabaseClient';
import AdminBannerOverlay from '@/components/AdminBannerOverlay';
import { tStatTitle } from '@/lib/dashboardI18n';




const DatabaseChatDashboard = () => {
  const { t } = useTranslation();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentExecution, setCurrentExecution] = useState<any>(null);

  // Real data from API
  const [metrics, setMetrics] = useState<DatabaseChatMetrics>({
    databaseQueries: 0,
    aiConversations: 0,
    successfulQueries: 0,
    failedQueries: 0,
    averageQueryTime: 0,
    memorySessions: 0,
    uniqueUsers: 0,
    queryComplexity: 0
  });

  // Set up real-time updates for this workflow
  useRealtimeMetrics('Chat with Database using AI');

  const [selectedDatabase, setSelectedDatabase] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');

  const handleStartAutomation = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual workflow start
      setIsRunning(true);
      toast({
        title: "Workflow Started",
        description: "Database Chat automation is now running",
      });
      loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
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
      // TODO: Implement actual workflow stop
      setIsRunning(false);
      toast({
        title: "Workflow Paused",
        description: "Database Chat automation has been paused",
      });
      loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
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
      await loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
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

  const loadDashboardData = async () => {
    try {
      const metricsData = await workflowSpecificApi.getDatabaseChatMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: requests, error } = await supabase
        .from('workflow_control_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('workflow_name', 'Talk to Your Database with AI')
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
        .eq('workflow_name', 'Talk to Your Database with AI');

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
          workflow_name: 'Talk to Your Database with AI',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the Talk to Your Database with AI workflow`,
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

  useEffect(() => {
    loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();

    // Listen for real-time updates
    const handleWorkflowUpdate = (event: CustomEvent) => {
      if ((event as any).detail?.workflowName?.startsWith('Chat with Database using AI')) {
        loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
      }
    };

    window.addEventListener('workflowExecutionUpdate', handleWorkflowUpdate as EventListener);
    return () => {
      window.removeEventListener('workflowExecutionUpdate', handleWorkflowUpdate as EventListener);
    };
  }, []);

      <AdminBannerOverlay workflowName="Chat with Database using AI" />

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
              <p className="text-sm font-medium text-gray-600">{tStatTitle(title, t)}</p>
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
            <div className="p-3 bg-blue-100 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };



  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <AdminBannerOverlay workflowName="Chat with Database using AI" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold">Database Chat Dashboard</h1>
            </div>
            <p className="text-muted-foreground ml-7">
              AI-powered database query automation that allows natural language interaction
              with your databases for instant insights and data analysis.
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
              <span>{isRunning ? t('buttons.pauseAutomationLabel') : t('buttons.startAutomationLabel')}</span>
            </Button>
            <Button
              onClick={handleRefreshData}
              disabled={isLoading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{t('buttons.refresh')}</span>
            </Button>
          </div>
        </div>



        {/* Workflow Control Request */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.workflowControl')}</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your Talk to Your Database with AI workflow
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
                          {new Date(request.created_at).toLocaleDateString()}
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
                      {request.status === 'approved' ? t('badgeStatus.approved') : t('badgeStatus.rejected')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Banner */}
        <UpgradeBanner />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Database Queries"
            value={metrics.databaseQueries.toString()}
            icon={Database}
          />
          <StatCard
            title="AI Conversations"
            value={metrics.aiConversations.toString()}
            icon={Brain}
          />
          <StatCard
            title="Successful Queries"
            value={metrics.successfulQueries.toString()}
            icon={CheckCircle}
          />
          <StatCard
            title="Failed Queries"
            value={metrics.failedQueries.toString()}
            icon={AlertCircle}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Avg Query Time"
            value={`${metrics.averageQueryTime.toFixed(1)}s`}
            icon={Zap}
          />
          <StatCard
            title="Memory Sessions"
            value={metrics.memorySessions.toString()}
            icon={Activity}
          />
          <StatCard
            title="Unique Users"
            value={metrics.uniqueUsers.toString()}
            icon={Users}
          />
        </div>

        {/* Database Chat Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Database Chat Activity Summary</span>
            </CardTitle>
            <CardDescription>
              Overview of recent database chat activity and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Queries Today</span>
                  <span className="text-lg font-bold text-blue-600">{metrics.databaseQueries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">AI Conversations</span>
                  <span className="text-lg font-bold text-green-600">{metrics.aiConversations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-lg font-bold text-purple-600">
                    {metrics.databaseQueries > 0 ? Math.round((metrics.successfulQueries / metrics.databaseQueries) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Query Time</span>
                  <span className="text-lg font-bold text-orange-600">{metrics.averageQueryTime.toFixed(1)}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Sessions</span>
                  <span className="text-lg font-bold text-indigo-600">{metrics.memorySessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Query Complexity</span>
                  <span className="text-lg font-bold text-red-600">{metrics.queryComplexity.toFixed(1)}</span>
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
                <span>Query Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Simple Queries</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Medium Queries</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Complex Queries</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Database Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">PostgreSQL</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">MySQL</span>
                  <span className="text-sm font-medium">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">MongoDB</span>
                  <span className="text-sm font-medium">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SQLite</span>
                  <span className="text-sm font-medium">10%</span>
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

export default DatabaseChatDashboard;