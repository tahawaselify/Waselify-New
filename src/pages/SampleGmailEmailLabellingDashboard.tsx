import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, 
  Tag, 
  Clock, 
  TrendingUp, 
  Play, 
  Pause, 
  Settings, 
  Activity,
  Bot,
  Database,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabaseClient";

interface EmailLabel {
  id: string;
  emailSubject: string;
  senderEmail: string;
  senderName: string;
  label: 'important' | 'urgent' | 'follow_up' | 'archive' | 'spam' | 'newsletter' | 'promotion' | 'personal';
  confidence: number;
  status: 'pending' | 'processing' | 'labeled' | 'failed';
  receivedAt: Date;
  labeledAt?: Date;
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'finance' | 'shopping' | 'social' | 'other';
}

interface AutomationStats {
  totalEmails: number;
  labeledEmails: number;
  pendingEmails: number;
  avgProcessingTime: number;
  accuracyRate: number;
  timeSaved: number;
  labelDistribution: Record<string, number>;
}

const SampleGmailEmailLabellingDashboard: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Sample data for demonstration
  const metrics = {
    emailsProcessed: 456,
    emailsLabeled: 423,
    accuracyRate: 94.2,
    avgProcessingTime: 1.8,
    timeSaved: 12.5,
    pendingEmails: 33,
    failedEmails: 8,
    labelDistribution: {
      important: 45,
      urgent: 23,
      follow_up: 67,
      archive: 89,
      spam: 34,
      newsletter: 56,
      promotion: 78,
      personal: 64
    }
  };
  
  const emails: EmailLabel[] = [
    {
      id: '1',
      emailSubject: 'Urgent: Project Deadline Extension Request',
      senderEmail: 'manager@company.com',
      senderName: 'John Manager',
      label: 'urgent',
      confidence: 95,
      status: 'labeled',
      receivedAt: new Date('2024-01-20T10:30:00Z'),
      labeledAt: new Date('2024-01-20T10:31:00Z'),
      priority: 'high',
      category: 'work'
    },
    {
      id: '2',
      emailSubject: 'Weekly Newsletter - Tech Updates',
      senderEmail: 'newsletter@techdaily.com',
      senderName: 'Tech Daily',
      label: 'newsletter',
      confidence: 92,
      status: 'labeled',
      receivedAt: new Date('2024-01-20T11:15:00Z'),
      labeledAt: new Date('2024-01-20T11:16:00Z'),
      priority: 'low',
      category: 'personal'
    },
    {
      id: '3',
      emailSubject: 'Follow-up: Client Meeting Discussion',
      senderEmail: 'client@business.com',
      senderName: 'Sarah Client',
      label: 'follow_up',
      confidence: 88,
      status: 'processing',
      receivedAt: new Date('2024-01-20T14:20:00Z'),
      priority: 'medium',
      category: 'work'
    },
    {
      id: '4',
      emailSubject: 'Special Offer - 50% Off Everything!',
      senderEmail: 'promotions@store.com',
      senderName: 'Online Store',
      label: 'promotion',
      confidence: 96,
      status: 'labeled',
      receivedAt: new Date('2024-01-20T16:45:00Z'),
      labeledAt: new Date('2024-01-20T16:46:00Z'),
      priority: 'low',
      category: 'shopping'
    }
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const labelStatuses = {
    pending: { label: 'Pending', color: 'bg-yellow-500' },
    processing: { label: 'Processing', color: 'bg-blue-500' },
    labeled: { label: 'Labeled', color: 'bg-green-500' },
    failed: { label: 'Failed', color: 'bg-red-500' }
  };

  const statusColors = {
    pending: 'text-yellow-600',
    processing: 'text-blue-600',
    labeled: 'text-green-600',
    failed: 'text-red-600'
  };

  const labelColors = {
    important: 'text-red-600',
    urgent: 'text-orange-600',
    follow_up: 'text-blue-600',
    archive: 'text-gray-600',
    spam: 'text-red-600',
    newsletter: 'text-green-600',
    promotion: 'text-purple-600',
    personal: 'text-pink-600'
  };

  const priorityColors = {
    low: 'text-gray-600',
    medium: 'text-orange-600',
    high: 'text-red-600'
  };

  const categoryColors = {
    work: 'text-blue-600',
    personal: 'text-green-600',
    finance: 'text-purple-600',
    shopping: 'text-pink-600',
    social: 'text-yellow-600',
    other: 'text-gray-600'
  };

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
        description: "Gmail Email Labelling automation has been paused",
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

  const StatCard = ({ title, value, icon: Icon, change, changeType }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    changeType?: 'positive' | 'negative';
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center mt-1">
                <ArrowUpRight className={`h-4 w-4 ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm ml-1 ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
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

  const getPendingEmails = () => emails.filter(email => email.status === 'pending').length;
  const getProcessingEmails = () => emails.filter(email => email.status === 'processing').length;

  const getPipelineData = () => [
    { name: 'Pending', value: getPendingEmails(), color: '#F59E0B' },
    { name: 'Processing', value: getProcessingEmails(), color: '#3B82F6' },
    { name: 'Labeled', value: emails.filter(email => email.status === 'labeled').length, color: '#10B981' },
    { name: 'Failed', value: emails.filter(email => email.status === 'failed').length, color: '#EF4444' }
  ];

  const getLabelDistribution = () => [
    { name: 'Important', value: metrics.labelDistribution.important, color: '#EF4444' },
    { name: 'Urgent', value: metrics.labelDistribution.urgent, color: '#F97316' },
    { name: 'Follow-up', value: metrics.labelDistribution.follow_up, color: '#3B82F6' },
    { name: 'Archive', value: metrics.labelDistribution.archive, color: '#6B7280' },
    { name: 'Newsletter', value: metrics.labelDistribution.newsletter, color: '#10B981' },
    { name: 'Promotion', value: metrics.labelDistribution.promotion, color: '#8B5CF6' }
  ];

  const getCategoryDistribution = () => [
    { name: 'Work', value: emails.filter(email => email.category === 'work').length },
    { name: 'Personal', value: emails.filter(email => email.category === 'personal').length },
    { name: 'Finance', value: emails.filter(email => email.category === 'finance').length },
    { name: 'Shopping', value: emails.filter(email => email.category === 'shopping').length },
    { name: 'Social', value: emails.filter(email => email.category === 'social').length }
  ];

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Gmail Email Labelling with AI workflow',
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
        details: 'Request to modify Gmail Email Labelling with AI workflow settings',
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

  const getPriorityDistribution = () => [
    { name: 'High', value: emails.filter(email => email.priority === 'high').length },
    { name: 'Medium', value: emails.filter(email => email.priority === 'medium').length },
    { name: 'Low', value: emails.filter(email => email.priority === 'low').length }
  ];

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
              <h3 className="font-semibold text-yellow-800">Sample Dashboard Notice</h3>
              <p className="text-yellow-700 text-sm">
                This is a sample dashboard showing how your Gmail Email Labelling workflow dashboard will look when you purchase this workflow. 
                All data shown is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <BackButton to="/marketplace" />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Gmail Email Labelling</h1>
              <p className="text-gray-600 mt-2">AI-powered email categorization and labeling automation</p>
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
                Request admin to start, stop, or modify your Gmail Email Labelling with AI workflow
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
              value={metrics.emailsProcessed}
              icon={Mail}
              change="+12.5%"
              changeType="positive"
            />
            <StatCard
              title="Accuracy Rate"
              value={`${metrics.accuracyRate}%`}
              icon={CheckCircle}
              change="+2.1%"
              changeType="positive"
            />
            <StatCard
              title="Avg Processing Time"
              value={`${metrics.avgProcessingTime}s`}
              icon={Clock}
              change="-15.2%"
              changeType="positive"
            />
            <StatCard
              title="Time Saved"
              value={`${metrics.timeSaved}h`}
              icon={TrendingUp}
              change="+8.7%"
              changeType="positive"
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
                  <CardDescription>Latest emails processed and labeled by AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emails.map((email) => (
                      <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Mail className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{email.emailSubject}</h4>
                            <p className="text-sm text-gray-600">{email.senderName} • {email.senderEmail}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={`${labelStatuses[email.status].color} text-white`}>
                                {labelStatuses[email.status].label}
                              </Badge>
                              <Badge variant="outline" className={labelColors[email.label]}>
                                {email.label.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className={priorityColors[email.priority]}>
                                {email.priority}
                              </Badge>
                              <Badge variant="outline" className={categoryColors[email.category]}>
                                {email.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{email.confidence}% confidence</p>
                          <p className="text-sm text-gray-600">
                            {format(email.receivedAt, 'MMM dd, HH:mm')}
                          </p>
                          {email.labeledAt && (
                            <p className="text-sm text-green-600">
                              Labeled in {Math.round((email.labeledAt.getTime() - email.receivedAt.getTime()) / 1000)}s
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics */}
            <div className="space-y-6">
              {/* Processing Pipeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Processing Pipeline</span>
                  </CardTitle>
                  <CardDescription>Email processing status distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getPipelineData().map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Label Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Tag className="h-5 w-5" />
                    <span>Label Distribution</span>
                  </CardTitle>
                  <CardDescription>Emails by AI-assigned labels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getLabelDistribution().map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>By Category</span>
                  </CardTitle>
                  <CardDescription>Email categorization breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getCategoryDistribution().map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>By Priority</span>
                  </CardTitle>
                  <CardDescription>Email priority levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getPriorityDistribution().map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium">{item.value}</span>
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

export default SampleGmailEmailLabellingDashboard; 