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
  UserPlus,
  FileText,
  Zap,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  Filter,
  Archive,
  Star,
  Settings,
  Building,
  DollarSign,
  Send,
  CheckSquare,
  Mail,
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
import AdminBannerOverlay from '@/components/AdminBannerOverlay';

import { workflowSpecificApi, ClientOnboardingMetrics } from '@/services/workflowSpecificApi';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';


interface OnboardingClient {
  id: string;
  client_name: string;
  company: string;
  email: string;
  phone: string;
  status: 'signup' | 'welcome' | 'integration' | 'training' | 'active' | 'completed';
  package: 'basic' | 'professional' | 'enterprise';
  onboarding_started: string;
  estimated_completion: string;
  current_step: string;
  steps_completed: number;
  total_steps: number;
  time_saved: number;
  satisfaction_score: number;
  integration_status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

const ClientOnboardingDashboard = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<ClientOnboardingMetrics>({
    onboardingProcesses: 0,
    documentsProcessed: 0,
    welcomeEmails: 0,
    setupCompletion: 0,
    averageOnboardingTime: 0,
    clientSatisfaction: 0,
    dropOffRate: 0,
    successRate: 0
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const { isConnected } = useRealtimeMetrics('Client Onboarding Automation');


  const [recentClients, setRecentClients] = useState<OnboardingClient[]>([]);
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
        description: "Client Onboarding automation is now running",
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
        description: "Client Onboarding automation has been paused",
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
      const metricsData = await workflowSpecificApi.getClientOnboardingMetrics();
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
        .eq('workflow_name', 'Client Onboarding')
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
        .eq('workflow_name', 'Client Onboarding');

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
          workflow_name: 'Client Onboarding',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the Client Onboarding workflow`,
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
      <AdminBannerOverlay workflowName="Client Onboarding Automation" />

  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.workflowName;
      if (name?.startsWith('Client Onboarding Automation')) {
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
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Icon className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signup': return 'bg-gray-100 text-gray-800';
      case 'welcome': return 'bg-blue-100 text-blue-800';
      case 'integration': return 'bg-yellow-100 text-yellow-800';
      case 'training': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPackageColor = (package_type: string) => {
    switch (package_type) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntegrationColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <AdminBannerOverlay workflowName="Client Onboarding Automation" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold">Client Onboarding Automation Dashboard</h1>
            </div>
            <p className="text-muted-foreground ml-7">
              AI-powered client onboarding automation that streamlines the journey from signup to integration,
              eliminating manual tasks and delivering seamless experiences.
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
        <UpgradeBanner workflowName="Client Onboarding Automation" />

        {/* Dashboard Status */}
        {metrics.onboardingProcesses > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-0.5">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
                <p className="text-green-800 text-sm">
                  🎉 Showing real-time Client Onboarding metrics from your workflow executions
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
              Request admin to start, stop, or modify your Client Onboarding workflow
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Onboarding Processes"
            value={metrics.onboardingProcesses.toString()}
            change="+15% from last week"
            icon={Users}
            trend="up"
          />
          <StatCard
            title="Documents Processed"
            value={metrics.documentsProcessed.toString()}
            change="+8% from last week"
            icon={FileText}
            trend="up"
          />
          <StatCard
            title="Avg Onboarding Time"
            value={`${metrics.averageOnboardingTime.toFixed(1)}h`}
            change="-40% from last week"
            icon={Clock}
            trend="up"
          />
          <StatCard
            title="Success Rate"
            value={`${metrics.successRate.toFixed(1)}%`}
            change="+25% from last week"
            icon={CheckSquare}
            trend="up"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Client Satisfaction"
            value={`${metrics.clientSatisfaction}%`}
            icon={Star}
          />
          <StatCard
            title="Setup Completion"
            value={metrics.setupCompletion.toString()}
            icon={CheckSquare}
          />
          <StatCard
            title="Welcome Emails"
            value={metrics.welcomeEmails.toString()}
            icon={Mail}
          />
        </div>

        {/* Client Onboarding Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Client Onboarding Activity Summary</span>
            </CardTitle>
            <CardDescription>Key metrics from your automation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{metrics.successRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{metrics.averageOnboardingTime.toFixed(1)}h</div>
                <div className="text-sm text-gray-600">Avg Onboarding Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{metrics.clientSatisfaction}%</div>
                <div className="text-sm text-gray-600">Client Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Recent Onboarding Clients</span>
            </CardTitle>
            <CardDescription>
              Latest clients and their onboarding progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentClients.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent clients found</p>
                <p className="text-sm text-gray-500">Client onboarding automation will show clients here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentClients.slice(0, 5).map((client) => (
                  <div key={client.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                        <Badge className={getPackageColor(client.package)}>
                          {client.package}
                        </Badge>
                        <Badge className={getIntegrationColor(client.integration_status)}>
                          {client.integration_status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-600">{client.client_name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(client.onboarding_started).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Company: {client.company}</p>
                        <p className="text-sm text-gray-600">{client.email} • {client.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Current Step: {client.current_step}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress value={(client.steps_completed / client.total_steps) * 100} className="flex-1 h-2" />
                          <span className="text-sm text-gray-500">{client.steps_completed}/{client.total_steps}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                      <span>Time Saved: {client.time_saved}h</span>
                      <span>Satisfaction: {client.satisfaction_score}/5</span>
                      <span>Est. Completion: {new Date(client.estimated_completion).toLocaleDateString()}</span>
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
                <span>Onboarding Status Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completed Setups</span>
                    <span>{metrics.setupCompletion}</span>
                  </div>
                  <Progress value={Math.min((metrics.setupCompletion / Math.max(metrics.onboardingProcesses, 1)) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Documents Processed</span>
                    <span>{metrics.documentsProcessed}</span>
                  </div>
                  <Progress value={Math.min((metrics.documentsProcessed / Math.max(metrics.onboardingProcesses * 5, 1)) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Welcome Emails</span>
                    <span>{metrics.welcomeEmails}</span>
                  </div>
                  <Progress value={Math.min((metrics.welcomeEmails / Math.max(metrics.onboardingProcesses, 1)) * 100, 100)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="text-sm font-medium">{metrics.successRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Drop-off Rate</span>
                  <span className="text-sm font-medium">{metrics.dropOffRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Client Satisfaction</span>
                  <span className="text-sm font-medium">{metrics.clientSatisfaction}%</span>
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

export default ClientOnboardingDashboard;