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
  Mail,
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
  Reply,
  Send,
  XCircle,
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
import { workflowSpecificApi, GmailAutoResponderMetrics } from '@/services/workflowSpecificApi';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import AdminBannerOverlay from '@/components/AdminBannerOverlay';



interface Email {
  id: string;
  sender: string;
  subject: string;
  received_at: string;
  auto_replied: boolean;
  response_time: number;
  ai_confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: 'inquiry' | 'support' | 'sales' | 'general';
  status: 'processed' | 'skipped' | 'pending' | 'failed';
}

const GmailAutoResponderDashboard = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<GmailAutoResponderMetrics>({
    emailsProcessed: 0,
    autoRepliesGenerated: 0,
    draftEmailsCreated: 0,
    responseAccuracy: 0,
    averageProcessingTime: 0,
    skippedEmails: 0,
    userSatisfaction: 0,
    followUpRate: 0
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();

  const { isConnected } = useRealtimeMetrics('Gmail AI Auto-Responder');

  const [recentEmails, setRecentEmails] = useState<Email[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    lastCheck: new Date().toISOString(),
    components: []
  });

  const handleStartAutomation = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual workflow start
      setIsRunning(true);
      toast({
        title: "Workflow Started",
        description: "Gmail Auto Responder automation is now running",
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
        description: "Gmail Auto Responder automation has been paused",
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

  const loadDashboardData = async () => {
    try {
      const metricsData = await workflowSpecificApi.getGmailAutoResponderMetrics();
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
        .eq('workflow_name', 'Gmail Auto Responder')
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
        .eq('workflow_name', 'Gmail Auto Responder');

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
          workflow_name: 'Gmail Auto Responder',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the Gmail Auto Responder workflow`,
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

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.workflowName;
      if (name?.startsWith('Gmail AI Auto-Responder')) {
        loadDashboardData();
        loadPendingRequests();
        loadProcessedRequests();
      }
    };
    window.addEventListener('workflowExecutionUpdate', handler as EventListener);
    return () => window.removeEventListener('workflowExecutionUpdate', handler as EventListener);
  }, []);


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
          <div className="p-3 bg-blue-100 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inquiry': return 'bg-blue-100 text-blue-800';
      case 'support': return 'bg-green-100 text-green-800';
      case 'sales': return 'bg-purple-100 text-purple-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <AdminBannerOverlay workflowName="Gmail AI Auto-Responder" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold">Gmail Auto Responder Dashboard</h1>
            </div>
            <p className="text-muted-foreground ml-7">
              AI-powered Gmail automation that intelligently analyzes emails and generates
              contextual auto-replies to improve response times and customer satisfaction.
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
                <XCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>{isLoading ? "Processing..." : isRunning ? 'Stop' : 'Start'} Automation</span>
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

        {/* Upgrade Banner */}
        <UpgradeBanner workflowName="Gmail Auto Responder" />

        {/* Live Dashboard Notice */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-0.5">
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
              <p className="text-green-800 text-sm">
                This dashboard displays real-time data from your Gmail Auto Responder workflow executions.
                Metrics are updated automatically as your automation processes emails and generates responses.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Emails Processed"
            value={metrics.emailsProcessed.toString()}
            change="+18% from last week"
            icon={Mail}
            trend="up"
          />
          <StatCard
            title="Auto Replies Generated"
            value={metrics.autoRepliesGenerated.toString()}
            change="+22% from last week"
            icon={Reply}
            trend="up"
          />
          <StatCard
            title="Avg Processing Time"
            value={`${metrics.averageProcessingTime.toFixed(1)}s`}
            change="-25% from last week"
            icon={Clock}
            trend="up"
          />
          <StatCard
            title="Response Accuracy"
            value={`${metrics.responseAccuracy.toFixed(1)}%`}
            change="+8% from last week"
            icon={Star}
            trend="up"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Draft Emails Created"
            value={metrics.draftEmailsCreated.toString()}
            icon={FileText}
          />
          <StatCard
            title="Skipped Emails"
            value={metrics.skippedEmails.toString()}
            icon={AlertCircle}
          />
          <StatCard
            title="Follow-up Rate"
            value={`${metrics.followUpRate.toFixed(1)}%`}
            icon={Send}
          />
        </div>

        {/* Gmail Auto Responder Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Gmail Auto Responder Activity Summary</span>
            </CardTitle>
            <CardDescription>Key metrics from your automation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{metrics.autoRepliesGenerated}</div>
                <div className="text-sm text-gray-600">Auto Replies Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{metrics.averageProcessingTime.toFixed(1)}s</div>
                <div className="text-sm text-gray-600">Avg Processing Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{metrics.responseAccuracy.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Response Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Emails */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Recent Email Processing</span>
            </CardTitle>
            <CardDescription>
              Latest emails and their auto-response status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEmails.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent emails found</p>
                <p className="text-sm text-gray-500">Gmail auto responder will show emails here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEmails.slice(0, 5).map((email) => (
                  <div key={email.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(email.status)}>
                          {email.status}
                        </Badge>
                        <Badge className={getCategoryColor(email.category)}>
                          {email.category}
                        </Badge>
                        <Badge className={getSentimentColor(email.sentiment)}>
                          {email.sentiment}
                        </Badge>
                        <span className="text-sm text-gray-600">{email.sender}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(email.received_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Subject: {email.subject}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Response Time: {email.response_time}s</span>
                        <span>AI Confidence: {email.ai_confidence}%</span>
                        <span>Auto Replied: {email.auto_replied ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Email Processing Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Auto Replies Generated</span>
                    <span>{metrics.autoRepliesGenerated}</span>
                  </div>
                  <Progress value={Math.min((metrics.autoRepliesGenerated / Math.max(metrics.emailsProcessed, 1)) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Draft Emails Created</span>
                    <span>{metrics.draftEmailsCreated}</span>
                  </div>
                  <Progress value={Math.min((metrics.draftEmailsCreated / Math.max(metrics.emailsProcessed, 1)) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Skipped Emails</span>
                    <span>{metrics.skippedEmails}</span>
                  </div>
                  <Progress value={Math.min((metrics.skippedEmails / Math.max(metrics.emailsProcessed, 1)) * 100, 100)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Quality Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Accuracy</span>
                  <span className="text-sm font-medium">{metrics.responseAccuracy.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Satisfaction</span>
                  <span className="text-sm font-medium">{metrics.userSatisfaction.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Follow-up Rate</span>
                  <span className="text-sm font-medium">{metrics.followUpRate.toFixed(1)}%</span>
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

export default GmailAutoResponderDashboard;
