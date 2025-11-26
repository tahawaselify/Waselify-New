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
  Settings
} from 'lucide-react';
import { formatQAR } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import UpgradeBanner from '@/components/UpgradeBanner';
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

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

const SampleAutomatedLeadGenerationDashboard = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  
  // Sample data for demonstration
  const metrics = {
    leadsIdentified: 1247,
    emailsEnriched: 892,
    competitorsAnalyzed: 45,
    successfulEnrichments: 856,
    failedEnrichments: 36,
    averageProcessingTime: 2.3,
    uniqueCompanies: 234,
    contactAccuracy: 94.2
  };
  
  const { toast } = useToast();

  const recentLeads: Lead[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      company: 'TechCorp Solutions',
      email: 'sarah.johnson@techcorp.com',
      position: 'VP of Sales',
      industry: 'Technology',
      status: 'qualified',
      source: 'linkedin',
      campaign: 'Q4 Enterprise Outreach',
      email_sent: true,
      email_opened: true,
      email_replied: true,
      reply_rate: 85,
      created_at: '2024-01-15T10:30:00Z',
      last_contact: '2024-01-20T14:15:00Z',
      next_follow_up: '2024-01-25T09:00:00Z',
      estimated_value: 25000
    },
    {
      id: '2',
      name: 'Michael Chen',
      company: 'InnovateLabs',
      email: 'mchen@innovatelabs.io',
      position: 'CTO',
      industry: 'SaaS',
      status: 'contacted',
      source: 'cold_email',
      campaign: 'Q4 Enterprise Outreach',
      email_sent: true,
      email_opened: true,
      email_replied: false,
      reply_rate: 0,
      created_at: '2024-01-14T08:45:00Z',
      last_contact: '2024-01-19T11:20:00Z',
      next_follow_up: '2024-01-24T10:30:00Z',
      estimated_value: 18000
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      company: 'DataFlow Systems',
      email: 'emily.rodriguez@dataflow.com',
      position: 'Director of Operations',
      industry: 'Data Analytics',
      status: 'prospected',
      source: 'website',
      campaign: 'Q4 Enterprise Outreach',
      email_sent: false,
      email_opened: false,
      email_replied: false,
      reply_rate: 0,
      created_at: '2024-01-13T16:20:00Z',
      last_contact: '2024-01-13T16:20:00Z',
      next_follow_up: '2024-01-18T14:00:00Z',
      estimated_value: 12000
    }
  ];

  const systemHealth = {
    status: 'healthy',
    lastCheck: new Date().toISOString(),
    components: [
      { name: 'Email Enrichment', status: 'healthy', uptime: 99.8 },
      { name: 'Competitor Analysis', status: 'healthy', uptime: 99.5 },
      { name: 'Lead Scoring', status: 'healthy', uptime: 99.9 },
      { name: 'Data Validation', status: 'healthy', uptime: 99.7 }
    ]
  };

  const campaigns = [
    {
      id: '1',
      name: 'Q4 Enterprise Outreach',
      status: 'active',
      leads_generated: 456,
      conversion_rate: 12.3,
      total_value: 1250000,
      start_date: '2024-01-01',
      end_date: '2024-03-31'
    },
    {
      id: '2',
      name: 'SaaS Industry Focus',
      status: 'active',
      leads_generated: 234,
      conversion_rate: 8.7,
      total_value: 567000,
      start_date: '2024-01-15',
      end_date: '2024-02-28'
    },
    {
      id: '3',
      name: 'Tech Startup Outreach',
      status: 'paused',
      leads_generated: 189,
      conversion_rate: 15.2,
      total_value: 890000,
      start_date: '2023-12-01',
      end_date: '2024-01-31'
    }
  ];

  const handleStartAutomation = async () => {
    setIsLoading(true);
    try {
      // Sample dashboard - no actual automation
      setIsRunning(true);
      toast({
        title: "Sample Dashboard",
        description: "This is a sample dashboard showing how the automation would work",
      });
    } catch (error) {
      console.error('Error starting automation:', error);
      toast({
        title: "Error",
        description: "Failed to start automation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseAutomation = async () => {
    setIsLoading(true);
    try {
      // Sample dashboard - no actual automation
      setIsRunning(false);
      toast({
        title: "Automation Paused",
        description: "Automated Lead Generation automation has been paused",
      });
    } catch (error) {
      console.error('Error pausing automation:', error);
      toast({
        title: "Error",
        description: "Failed to pause automation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      // Sample dashboard - simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
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
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'prospected': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Automated Lead Generation with AI workflow',
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
        details: 'Request to modify Automated Lead Generation with AI workflow settings',
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

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'linkedin': return 'bg-blue-100 text-blue-800';
      case 'cold_email': return 'bg-green-100 text-green-800';
      case 'website': return 'bg-purple-100 text-purple-800';
      case 'referral': return 'bg-orange-100 text-orange-800';
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
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800">Sample Dashboard Notice</h3>
            <p className="text-yellow-700 text-sm">
              This is a sample dashboard showing how your Automated Lead Generation dashboard will look when you purchase this workflow. 
              All data shown is for demonstration purposes only.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <BackButton to="/marketplace" />
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Automated Lead Generation</h1>
            <p className="text-gray-600 mt-2">AI-powered lead identification and enrichment system</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleRefreshData}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            {!isRunning ? (
                              <Button
                  onClick={handleStartAutomation}
                  disabled={isLoading}
                  className="bg-waselify-500 hover:bg-waselify-600 flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Automation</span>
                </Button>
            ) : (
              <Button
                onClick={handlePauseAutomation}
                disabled={isLoading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Pause className="h-4 w-4" />
                <span>Pause Automation</span>
              </Button>
            )}
          </div>
        </div>

        
        {/* Workflow Control Request */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Workflow Control</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your Automated Lead Generation with AI workflow
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Leads Identified"
            value={metrics.leadsIdentified.toLocaleString()}
            change="+12.5%"
            icon={Users}
            trend="up"
          />
          <StatCard
            title="Emails Enriched"
            value={metrics.emailsEnriched.toLocaleString()}
            change="+8.3%"
            icon={Mail}
            trend="up"
          />
          <StatCard
            title="Contact Accuracy"
            value={`${metrics.contactAccuracy}%`}
            change="+2.1%"
            icon={Target}
            trend="up"
          />
          <StatCard
            title="Unique Companies"
            value={metrics.uniqueCompanies.toLocaleString()}
            change="+15.7%"
            icon={Building}
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Leads */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Recent Leads</span>
                </CardTitle>
                <CardDescription>Latest leads identified and enriched by the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{lead.name}</h4>
                          <p className="text-sm text-gray-600">{lead.position} at {lead.company}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status}
                            </Badge>
                            <Badge className={getSourceColor(lead.source)}>
                              {lead.source}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatQAR(lead.estimated_value)}</p>
                        <p className="text-sm text-gray-600">{lead.reply_rate}% reply rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Health</span>
                </CardTitle>
                <CardDescription>Current system performance and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      {systemHealth.status}
                    </Badge>
                  </div>
                  {systemHealth.components.map((component) => (
                    <div key={component.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{component.name}</span>
                        <span className="text-sm text-gray-600">{component.uptime}%</span>
                      </div>
                      <Progress value={component.uptime} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Campaigns */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Active Campaigns</span>
                </CardTitle>
                <CardDescription>Current lead generation campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{campaign.name}</h4>
                        <Badge className={campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-600">Leads</p>
                          <p className="font-medium">{campaign.leads_generated}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Conversion</p>
                          <p className="font-medium">{campaign.conversion_rate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Value</p>
                          <p className="font-medium">{formatQAR(campaign.total_value)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SampleAutomatedLeadGenerationDashboard; 