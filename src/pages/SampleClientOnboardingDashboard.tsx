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
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import UpgradeBanner from '@/components/UpgradeBanner';
import Navbar from '@/components/Navbar';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

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

const SampleClientOnboardingDashboard = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  
  // Sample data for demonstration
  const metrics = {
    onboardingProcesses: 156,
    documentsProcessed: 892,
    welcomeEmails: 145,
    setupCompletion: 94.2,
    averageOnboardingTime: 3.2,
    clientSatisfaction: 4.8,
    dropOffRate: 5.3,
    successRate: 94.7
  };
  
  const { toast } = useToast();

  const recentClients: OnboardingClient[] = [
    {
      id: '1',
      client_name: 'Alex Thompson',
      company: 'TechStart Inc.',
      email: 'alex@techstart.com',
      phone: '+1-555-0123',
      status: 'training',
      package: 'enterprise',
      onboarding_started: '2024-01-15T09:00:00Z',
      estimated_completion: '2024-01-25T17:00:00Z',
      current_step: 'System Training',
      steps_completed: 8,
      total_steps: 12,
      time_saved: 12,
      satisfaction_score: 5,
      integration_status: 'completed'
    },
    {
      id: '2',
      client_name: 'Maria Garcia',
      company: 'DataFlow Solutions',
      email: 'maria@dataflow.com',
      phone: '+1-555-0456',
      status: 'integration',
      package: 'professional',
      onboarding_started: '2024-01-18T10:30:00Z',
      estimated_completion: '2024-01-28T16:00:00Z',
      current_step: 'API Integration',
      steps_completed: 6,
      total_steps: 10,
      time_saved: 8,
      satisfaction_score: 4,
      integration_status: 'in_progress'
    },
    {
      id: '3',
      client_name: 'David Chen',
      company: 'InnovateLabs',
      email: 'david@innovatelabs.io',
      phone: '+1-555-0789',
      status: 'welcome',
      package: 'basic',
      onboarding_started: '2024-01-20T14:15:00Z',
      estimated_completion: '2024-01-30T15:00:00Z',
      current_step: 'Welcome Call',
      steps_completed: 2,
      total_steps: 8,
      time_saved: 3,
      satisfaction_score: 5,
      integration_status: 'pending'
    }
  ];

  const systemHealth = {
    status: 'healthy',
    lastCheck: new Date().toISOString(),
    components: [
      { name: 'Document Processing', status: 'healthy', uptime: 99.9 },
      { name: 'Email Automation', status: 'healthy', uptime: 99.8 },
      { name: 'Integration Engine', status: 'healthy', uptime: 99.7 },
      { name: 'Progress Tracking', status: 'healthy', uptime: 99.9 }
    ]
  };

  const onboardingSteps = [
    {
      id: '1',
      name: 'Account Setup',
      description: 'Initial account creation and configuration',
      average_time: 30,
      completion_rate: 98.5,
      status: 'active'
    },
    {
      id: '2',
      name: 'Welcome Email',
      description: 'Automated welcome email with next steps',
      average_time: 5,
      completion_rate: 99.2,
      status: 'active'
    },
    {
      id: '3',
      name: 'Document Collection',
      description: 'Automated document processing and validation',
      average_time: 45,
      completion_rate: 96.8,
      status: 'active'
    },
    {
      id: '4',
      name: 'Integration Setup',
      description: 'API integration and system connection',
      average_time: 120,
      completion_rate: 92.3,
      status: 'active'
    },
    {
      id: '5',
      name: 'Training Session',
      description: 'Automated training and knowledge transfer',
      average_time: 90,
      completion_rate: 89.7,
      status: 'active'
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
        description: "Client Onboarding automation has been paused",
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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-purple-100 text-purple-800';
      case 'integration': return 'bg-yellow-100 text-yellow-800';
      case 'welcome': return 'bg-orange-100 text-orange-800';
      case 'signup': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPackageColor = (package_type: string) => {
    switch (package_type) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Client Onboarding with AI workflow',
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
        details: 'Request to modify Client Onboarding with AI workflow settings',
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

  const getIntegrationColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
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
                This is a sample dashboard showing how your Client Onboarding Automation dashboard will look when you purchase this workflow. 
                All data shown is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <BackButton to="/marketplace" />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Client Onboarding Automation</h1>
              <p className="text-gray-600 mt-2">Streamlined client onboarding with AI-powered automation</p>
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
                Request admin to start, stop, or modify your Client Onboarding with AI workflow
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
              title="Onboarding Processes"
              value={metrics.onboardingProcesses.toLocaleString()}
              change="+8.2%"
              icon={UserPlus}
              trend="up"
            />
            <StatCard
              title="Setup Completion"
              value={`${metrics.setupCompletion}%`}
              change="+2.1%"
              icon={CheckSquare}
              trend="up"
            />
            <StatCard
              title="Client Satisfaction"
              value={`${metrics.clientSatisfaction}/5`}
              change="+0.3"
              icon={Star}
              trend="up"
            />
            <StatCard
              title="Success Rate"
              value={`${metrics.successRate}%`}
              change="+1.5%"
              icon={TrendingUp}
              trend="up"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Clients */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Recent Clients</span>
                  </CardTitle>
                  <CardDescription>Latest clients in the onboarding process</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentClients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserPlus className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{client.client_name}</h4>
                            <p className="text-sm text-gray-600">{client.company}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(client.status)}>
                                {client.status}
                              </Badge>
                              <Badge className={getPackageColor(client.package)}>
                                {client.package}
                              </Badge>
                              <Badge className={getIntegrationColor(client.integration_status)}>
                                {client.integration_status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{client.current_step}</p>
                          <p className="text-sm text-gray-600">
                            {client.steps_completed}/{client.total_steps} steps
                          </p>
                          <Progress 
                            value={(client.steps_completed / client.total_steps) * 100} 
                            className="w-20 h-2 mt-1" 
                          />
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

              {/* Onboarding Steps */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Onboarding Steps</span>
                  </CardTitle>
                  <CardDescription>Automated onboarding process steps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {onboardingSteps.map((step) => (
                      <div key={step.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{step.name}</h4>
                          <Badge className={step.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {step.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-600">Avg Time</p>
                            <p className="font-medium">{step.average_time} min</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Completion</p>
                            <p className="font-medium">{step.completion_rate}%</p>
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

export default SampleClientOnboardingDashboard; 