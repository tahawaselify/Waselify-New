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
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import UpgradeBanner from '@/components/UpgradeBanner';
import { SampleWorkflowControl, StatusBadge } from '@/components/sample/SampleDashboardParts';
import { workflowSpecificApi, DatabaseChatMetrics } from '@/services/workflowSpecificApi';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { supabase } from '@/lib/supabaseClient';
import { tStatTitle } from '@/lib/dashboardI18n';

const SampleDatabaseChatDashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentExecution, setCurrentExecution] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);

  // Sample data for demonstration
  const [metrics, setMetrics] = useState<DatabaseChatMetrics>({
    databaseQueries: 1247,
    aiConversations: 892,
    successfulQueries: 1189,
    failedQueries: 58,
    averageQueryTime: 2.3,
    memorySessions: 156,
    uniqueUsers: 89,
    queryComplexity: 7.2
  });

  const [selectedDatabase, setSelectedDatabase] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');

  const handleStartAutomation = async () => {
    setIsLoading(true);
    try {
      // Sample automation control logic
      setIsRunning(true);
      toast({
        title: "Sample Workflow Started",
        description: "Database Chat automation is now running",
      });
      loadDashboardData();
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
      // Sample automation control logic
      setIsRunning(false);
      toast({
        title: "Sample Workflow Paused",
        description: "Database Chat automation has been paused",
      });
      loadDashboardData();
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
      toast({
        title: "Sample Data Refreshed",
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
      // Sample data for demonstration
      const sampleMetrics: DatabaseChatMetrics = {
        databaseQueries: 1247,
        aiConversations: 892,
        successfulQueries: 1189,
        failedQueries: 58,
        averageQueryTime: 2.3,
        memorySessions: 156,
        uniqueUsers: 89,
        queryComplexity: 7.2
      };
      setMetrics(sampleMetrics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Talk to Your Database with AI workflow',
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
        details: 'Request to modify Talk to Your Database with AI workflow settings',
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
    loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

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
                This is a sample dashboard showing how your Database Chat workflow dashboard will look when you purchase this workflow. 
                All data shown is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <BackButton to="/marketplace" />
                <h1 className="text-3xl font-bold text-gray-900 mt-4">Database Chat Dashboard</h1>
                <p className="text-gray-600 mt-2">AI-powered database query automation that allows natural language interaction with your databases for instant insights and data analysis.</p>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge label={isRunning ? 'Active' : 'Paused'} color={isRunning ? 'green' : 'red'} />
                <Button
                  onClick={isRunning ? handlePauseAutomation : handleStartAutomation}
                  disabled={isLoading}
                  className={isRunning ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-waselify-500 hover:bg-waselify-600 text-white'}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : isRunning ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      <span>Pause Chatbot</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      <span>Start Automation</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRefreshData}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </div>



          {/* Workflow Control - standardized */}
          <SampleWorkflowControl
            workflowTitle="Talk to Your Database with AI"
            onRequest={handleWorkflowRequest}
          />

          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{t('sections.pendingRequests')}</span>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>{t('sections.recentProcessedRequests')}</span>
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
                      {request.status === 'approved' ? t('badgeStatus.approved') : t('badgeStatus.rejected')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Database Queries"
              value={metrics.databaseQueries.toString()}
              icon={Database}
              change="+12%"
              trend="up"
            />
            <StatCard
              title="AI Conversations"
              value={metrics.aiConversations.toString()}
              icon={Brain}
              change="+8%"
              trend="up"
            />
            <StatCard
              title="Successful Queries"
              value={metrics.successfulQueries.toString()}
              icon={CheckCircle}
              change="+15%"
              trend="up"
            />
            <StatCard
              title="Failed Queries"
              value={metrics.failedQueries.toString()}
              icon={AlertCircle}
              change="-5%"
              trend="down"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Avg Query Time"
              value={`${metrics.averageQueryTime.toFixed(1)}s`}
              icon={Zap}
              change="-0.3s"
              trend="down"
            />
            <StatCard
              title="Memory Sessions"
              value={metrics.memorySessions.toString()}
              icon={Activity}
              change="+6%"
              trend="up"
            />
            <StatCard
              title="Unique Users"
              value={metrics.uniqueUsers.toString()}
              icon={Users}
              change="+3%"
              trend="up"
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

export default SampleDatabaseChatDashboard; 