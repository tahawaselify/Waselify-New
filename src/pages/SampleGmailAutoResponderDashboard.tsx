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
  Database,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import UpgradeBanner from '@/components/UpgradeBanner';
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

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

const SampleGmailAutoResponderDashboard = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  
  // Sample data for demonstration
  const metrics = {
    emailsProcessed: 234,
    autoRepliesGenerated: 189,
    draftEmailsCreated: 45,
    responseAccuracy: 94.2,
    averageProcessingTime: 1.8,
    skippedEmails: 23,
    userSatisfaction: 4.6,
    followUpRate: 78.5
  };
  
  const { toast } = useToast();

  const recentEmails: Email[] = [
    {
      id: '1',
      sender: 'john.doe@company.com',
      subject: 'Product Inquiry - Pricing Information',
      received_at: '2024-01-20T10:30:00Z',
      auto_replied: true,
      response_time: 2.3,
      ai_confidence: 95,
      sentiment: 'positive',
      category: 'inquiry',
      status: 'processed'
    },
    {
      id: '2',
      sender: 'support@client.com',
      subject: 'Technical Issue with Integration',
      received_at: '2024-01-20T11:15:00Z',
      auto_replied: true,
      response_time: 1.8,
      ai_confidence: 87,
      sentiment: 'negative',
      category: 'support',
      status: 'processed'
    },
    {
      id: '3',
      sender: 'sales@prospect.com',
      subject: 'Partnership Opportunity Discussion',
      received_at: '2024-01-20T14:20:00Z',
      auto_replied: false,
      response_time: 0,
      ai_confidence: 92,
      sentiment: 'positive',
      category: 'sales',
      status: 'skipped'
    },
    {
      id: '4',
      sender: 'info@vendor.com',
      subject: 'Monthly Newsletter - Industry Updates',
      received_at: '2024-01-20T16:45:00Z',
      auto_replied: true,
      response_time: 1.2,
      ai_confidence: 89,
      sentiment: 'neutral',
      category: 'general',
      status: 'processed'
    }
  ];

  const systemHealth = {
    status: 'healthy',
    lastCheck: new Date().toISOString(),
    components: [
      { name: 'Email Processing', status: 'healthy', uptime: 99.9 },
      { name: 'AI Response Generation', status: 'healthy', uptime: 99.7 },
      { name: 'Sentiment Analysis', status: 'healthy', uptime: 99.8 },
      { name: 'Email Categorization', status: 'healthy', uptime: 99.6 }
    ]
  };

  const responseTemplates = [
    {
      id: '1',
      name: 'Product Inquiry Response',
      category: 'inquiry',
      usage_count: 45,
      success_rate: 96.2,
      last_updated: '2024-01-15'
    },
    {
      id: '2',
      name: 'Support Ticket Acknowledgment',
      category: 'support',
      usage_count: 32,
      success_rate: 94.8,
      last_updated: '2024-01-18'
    },
    {
      id: '3',
      name: 'Sales Follow-up',
      category: 'sales',
      usage_count: 28,
      success_rate: 91.5,
      last_updated: '2024-01-12'
    },
    {
      id: '4',
      name: 'General Inquiry',
      category: 'general',
      usage_count: 67,
      success_rate: 97.1,
      last_updated: '2024-01-20'
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
        description: "Gmail Auto Responder automation has been paused",
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
      case 'support': return 'bg-orange-100 text-orange-800';
      case 'sales': return 'bg-purple-100 text-purple-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Gmail Auto Responder with AI workflow',
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
        details: 'Request to modify Gmail Auto Responder with AI workflow settings',
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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      case 'negative': return 'bg-red-100 text-red-800';
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
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800">Sample Dashboard Notice</h3>
            <p className="text-yellow-700 text-sm">
              This is a sample dashboard showing how your Gmail AI Auto-Responder dashboard will look when you purchase this workflow. 
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
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Gmail AI Auto Responder</h1>
              <p className="text-gray-600 mt-2">Intelligent email automation with AI-powered responses</p>
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
                  <Play className="h-4 h-4" />
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
        </div>



        {/* Workflow Control Request */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Workflow Control</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your Gmail Auto Responder with AI workflow
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
            title="Emails Processed"
            value={metrics.emailsProcessed.toLocaleString()}
            change="+12.5%"
            icon={Mail}
            trend="up"
          />
          <StatCard
            title="Auto Replies Generated"
            value={metrics.autoRepliesGenerated.toLocaleString()}
            change="+8.3%"
            icon={Reply}
            trend="up"
          />
          <StatCard
            title="Response Accuracy"
            value={`${metrics.responseAccuracy}%`}
            change="+2.1%"
            icon={CheckCircle}
            trend="up"
          />
          <StatCard
            title="Avg Processing Time"
            value={`${metrics.averageProcessingTime}m`}
            change="-15.2%"
            icon={Clock}
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Emails */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Recent Emails</span>
                </CardTitle>
                <CardDescription>Latest emails processed by the AI auto responder</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEmails.map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{email.sender}</h4>
                          <p className="text-sm text-gray-600">{email.subject}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(email.received_at).toLocaleString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(email.status)}>
                              {email.status}
                            </Badge>
                            <Badge className={getCategoryColor(email.category)}>
                              {email.category}
                            </Badge>
                            <Badge className={getSentimentColor(email.sentiment)}>
                              {email.sentiment}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{email.ai_confidence}% confidence</p>
                        <p className="text-sm text-gray-600">
                          {email.auto_replied ? 'Auto replied' : 'Skipped'}
                        </p>
                        {email.auto_replied && (
                          <p className="text-sm text-green-600">
                            {email.response_time}m response time
                          </p>
                        )}
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

            {/* Response Templates */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Response Templates</span>
                </CardTitle>
                <CardDescription>AI-generated response templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {responseTemplates.map((template) => (
                    <div key={template.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-600">Usage</p>
                          <p className="font-medium">{template.usage_count}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Success Rate</p>
                          <p className="font-medium">{template.success_rate}%</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Updated: {template.last_updated}
                      </p>
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

export default SampleGmailAutoResponderDashboard; 