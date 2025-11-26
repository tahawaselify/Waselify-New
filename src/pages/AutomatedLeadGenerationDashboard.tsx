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
  Target,
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
  Search,
  Building,
  DollarSign,
  Send,
  Reply,
  XCircle,
  Database,
  Settings,
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
import { workflowSpecificApi, LeadGenerationMetrics } from '@/services/workflowSpecificApi';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabaseClient';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  position: string;
  industry: string;
  status: 'prospected' | 'contacted' | 'responded' | 'qualified' | 'converted' | 'lost';
  source: 'cold_email' | 'linkedin' | 'website' | 'referral';
  campaign: string;
  email_sent: boolean;
  email_opened: boolean;
  email_replied: boolean;
  reply_rate: number;
  created_at: string;
  last_contact: string;
  next_follow_up: string;
  estimated_value: number;
}

const AutomatedLeadGenerationDashboard = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<LeadGenerationMetrics>({
    leadsIdentified: 0,
    emailsEnriched: 0,
    competitorsAnalyzed: 0,
    successfulEnrichments: 0,
    failedEnrichments: 0,
    averageProcessingTime: 0,
    uniqueCompanies: 0,
    contactAccuracy: 0
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  // Realtime subscription for Automated Lead Generation
  const { isConnected } = useRealtimeMetrics('Automated Lead Generation');

  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.workflowName as string | undefined;
      if (name && name.startsWith('Automated Lead Generation')) {
        loadDashboardData();
        loadPendingRequests();
        loadProcessedRequests();
      }
    };
    window.addEventListener('workflowExecutionUpdate', handler as EventListener);
    return () => window.removeEventListener('workflowExecutionUpdate', handler as EventListener);
  }, []);

  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
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
        description: "Automated Lead Generation automation is now running",
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
        description: "Automated Lead Generation automation has been paused",
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
      const metricsData = await workflowSpecificApi.getLeadGenerationMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('workflow_control_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('workflow_name', 'Automated Lead Generation')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading pending requests:', error);
        return;
      }

      setPendingRequests(data || []);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const loadProcessedRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('workflow_control_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('workflow_name', 'Automated Lead Generation')
        .in('status', ['approved', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error loading processed requests:', error);
        return;
      }

      setProcessedRequests(data || []);
    } catch (error) {
      console.error('Error loading processed requests:', error);
    }
  };

  const handleWorkflowRequest = async (action: 'start' | 'stop' | 'modify') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to submit workflow requests",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('workflow_control_requests')
        .insert({
          user_id: user.id,
          workflow_name: 'Automated Lead Generation',
          action: action,
          status: 'pending',
          details: `Request to ${action} Automated Lead Generation workflow`
        });

      if (error) {
        console.error('Error submitting request:', error);
        toast({
          title: "Error",
          description: "Failed to submit workflow request",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Request Submitted",
        description: `Your request to ${action} the workflow has been submitted for admin approval`,
      });

      loadPendingRequests();
    } catch (error) {
      console.error('Error submitting workflow request:', error);
      toast({
        title: "Error",
        description: "Failed to submit workflow request",
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
      case 'prospected': return 'bg-gray-100 text-gray-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'cold_email': return 'bg-blue-100 text-blue-800';
      case 'linkedin': return 'bg-indigo-100 text-indigo-800';
      case 'website': return 'bg-green-100 text-green-800';
      case 'referral': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold">Automated Lead Generation Dashboard</h1>
            </div>
            <p className="text-muted-foreground ml-7">
              AI-powered lead generation automation that identifies, enriches, and qualifies prospects
              using advanced data analysis and email outreach strategies.
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
        <UpgradeBanner workflowName="Automated Lead Generation" />

        {/* Dashboard Status */}
        {recentLeads.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-0.5">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
                <p className="text-green-800 text-sm">
                  🎉 Showing real-time Automated Lead Generation metrics from your workflow executions
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
              Request admin to start, stop, or modify your Automated Lead Generation workflow
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
        )}

        {/* Recent Processed Requests */}
        {processedRequests.length > 0 && (
          <Card>
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
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Leads Identified"
            value={metrics.leadsIdentified.toString()}
            change="+22% from last week"
            icon={Target}
            trend="up"
          />
          <StatCard
            title="Emails Enriched"
            value={metrics.emailsEnriched.toString()}
            change="+15% from last week"
            icon={Mail}
            trend="up"
          />
          <StatCard
            title="Avg Processing Time"
            value={`${metrics.averageProcessingTime.toFixed(1)}s`}
            change="-30% from last week"
            icon={Clock}
            trend="up"
          />
          <StatCard
            title="Contact Accuracy"
            value={`${metrics.contactAccuracy.toFixed(1)}%`}
            change="+5% from last week"
            icon={Star}
            trend="up"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Successful Enrichments"
            value={metrics.successfulEnrichments.toString()}
            icon={CheckCircle}
          />
          <StatCard
            title="Unique Companies"
            value={metrics.uniqueCompanies.toString()}
            icon={Building}
          />
          <StatCard
            title="Competitors Analyzed"
            value={metrics.competitorsAnalyzed.toString()}
            icon={Search}
          />
        </div>

        {/* Lead Generation Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Lead Generation Activity Summary</span>
            </CardTitle>
            <CardDescription>Key metrics from your automation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{metrics.successfulEnrichments}</div>
                <div className="text-sm text-gray-600">Successful Enrichments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{metrics.averageProcessingTime.toFixed(1)}s</div>
                <div className="text-sm text-gray-600">Avg Processing Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{metrics.contactAccuracy.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Contact Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Recent Leads</span>
            </CardTitle>
            <CardDescription>
              Latest leads and their enrichment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent leads found</p>
                <p className="text-sm text-gray-500">Lead generation automation will show leads here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLeads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        <Badge className={getSourceColor(lead.source)}>
                          {lead.source.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-600">{lead.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(lead.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lead.company}</p>
                        <p className="text-sm text-gray-600">{lead.position} • {lead.industry}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email: {lead.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">Campaign: {lead.campaign}</span>
                          <span className="text-sm text-gray-600">Value: ${lead.estimated_value.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                      <span>Reply Rate: {lead.reply_rate}%</span>
                      <span>Last Contact: {new Date(lead.last_contact).toLocaleDateString()}</span>
                      <span>Next Follow-up: {new Date(lead.next_follow_up).toLocaleDateString()}</span>
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
                <span>Enrichment Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Successful Enrichments</span>
                    <span>{metrics.successfulEnrichments}</span>
                  </div>
                  <Progress value={Math.min((metrics.successfulEnrichments / Math.max(metrics.emailsEnriched, 1)) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Failed Enrichments</span>
                    <span>{metrics.failedEnrichments}</span>
                  </div>
                  <Progress value={Math.min((metrics.failedEnrichments / Math.max(metrics.emailsEnriched, 1)) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Unique Companies</span>
                    <span>{metrics.uniqueCompanies}</span>
                  </div>
                  <Progress value={Math.min((metrics.uniqueCompanies / Math.max(metrics.leadsIdentified, 1)) * 100, 100)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Lead Generation Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contact Accuracy</span>
                  <span className="text-sm font-medium">{metrics.contactAccuracy.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Competitors Analyzed</span>
                  <span className="text-sm font-medium">{metrics.competitorsAnalyzed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Processing Time</span>
                  <span className="text-sm font-medium">{metrics.averageProcessingTime.toFixed(1)}s</span>
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

export default AutomatedLeadGenerationDashboard;