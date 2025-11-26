import React, { useState, useEffect } from 'react'
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Play, 
  Pause, 
  Settings, 
  RefreshCw,
  Mail,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Zap,
  Activity,
  BarChart,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText,
  AlertTriangle,
  Filter,
  Archive,
  Database,
  XCircle
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { supabase as supabaseClient } from "@/lib/supabaseClient";
import { EmailSummaryAgentMetrics, workflowSpecificApi } from "@/services/workflowSpecificApi";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";

interface EmailSummary {
  id: string;
  sender: string;
  subject: string;
  priority: 'high' | 'medium' | 'low';
  category: 'sales' | 'support' | 'marketing' | 'internal' | 'other';
  status: 'pending' | 'processed' | 'summarized' | 'archived';
  summary: string;
  original_length: number;
  summary_length: number;
  processing_time: number;
  created_at: string;
  processed_at: string;
  ai_confidence: number;
  action_required: boolean;
}

interface AutomationStats {
  totalEmails: number;
  processedEmails: number;
  avgResponseTime: number;
  timeSaved: number;
  highPriorityEmails: number;
  aiAccuracy: number;
}

const SampleEmailSummaryAgentDashboard: React.FC = () => {
  const [emailSummaries, setEmailSummaries] = useState<EmailSummary[]>([]);
  const [metrics, setMetrics] = useState<EmailSummaryAgentMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();

  const emailStatuses = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    processed: { label: 'Processed', color: 'bg-blue-100 text-blue-800' },
    summarized: { label: 'Summarized', color: 'bg-green-100 text-green-800' },
    archived: { label: 'Archived', color: 'bg-gray-100 text-gray-800' }
  };

  const priorityColors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981'
  };

  const categoryIcons = {
    sales: '💼',
    support: '🛠️',
    marketing: '📢',
    internal: '🏢',
    other: '📧'
  };

  const statusColors = {
    pending: '#F59E0B',
    processed: '#3B82F6',
    summarized: '#10B981',
    archived: '#6B7280'
  };

  // Sample data for demonstration
  const sampleEmailSummaries: EmailSummary[] = [
    {
      id: '1',
      sender: 'john.doe@company.com',
      subject: 'Q4 Sales Report and Strategy Discussion',
      priority: 'high',
      category: 'sales',
      status: 'summarized',
      summary: 'Q4 sales exceeded targets by 15%. Key highlights: New product launch successful, customer retention improved, and expansion into European market planned for Q1.',
      original_length: 1250,
      summary_length: 180,
      processing_time: 2.3,
      created_at: '2024-01-15T10:00:00Z',
      processed_at: '2024-01-15T10:02:30Z',
      ai_confidence: 94,
      action_required: true
    },
    {
      id: '2',
      sender: 'support@techcorp.com',
      subject: 'Technical Issue Resolution - Ticket #12345',
      priority: 'medium',
      category: 'support',
      status: 'processed',
      summary: 'Customer reported login issues with new authentication system. Issue identified as session timeout configuration. Resolution provided and monitoring in place.',
      original_length: 890,
      summary_length: 145,
      processing_time: 1.8,
      created_at: '2024-01-15T11:00:00Z',
      processed_at: '2024-01-15T11:01:48Z',
      ai_confidence: 91,
      action_required: false
    },
    {
      id: '3',
      sender: 'marketing@brand.com',
      subject: 'New Marketing Campaign Launch - Spring Collection',
      priority: 'medium',
      category: 'marketing',
      status: 'summarized',
      summary: 'Spring marketing campaign launching next week. Focus on social media, influencer partnerships, and email marketing. Budget allocated and creative assets ready.',
      original_length: 1100,
      summary_length: 165,
      processing_time: 2.1,
      created_at: '2024-01-15T12:00:00Z',
      processed_at: '2024-01-15T12:02:06Z',
      ai_confidence: 89,
      action_required: true
    },
    {
      id: '4',
      sender: 'hr@company.com',
      subject: 'Team Meeting Schedule - All Hands This Friday',
      priority: 'low',
      category: 'internal',
      status: 'processed',
      summary: 'All-hands meeting scheduled for Friday 3 PM. Agenda includes company updates, Q4 results, and Q1 planning. Virtual attendance option available.',
      original_length: 650,
      summary_length: 120,
      processing_time: 1.5,
      created_at: '2024-01-15T13:00:00Z',
      processed_at: '2024-01-15T13:01:30Z',
      ai_confidence: 96,
      action_required: false
    },
    {
      id: '5',
      sender: 'client@bigcorp.com',
      subject: 'Contract Renewal Discussion - Urgent',
      priority: 'high',
      category: 'sales',
      status: 'pending',
      summary: '',
      original_length: 950,
      summary_length: 0,
      processing_time: 0,
      created_at: '2024-01-15T14:00:00Z',
      processed_at: '',
      ai_confidence: 0,
      action_required: true
    }
  ];

  const automationStats: AutomationStats = {
    totalEmails: 1247,
    processedEmails: 1189,
    avgResponseTime: 2.1,
    timeSaved: 156000,
    highPriorityEmails: 89,
    aiAccuracy: 92.5
  };

  useEffect(() => {
    console.log('SampleEmailSummaryAgentDashboard: Component mounted');
    loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('SampleEmailSummaryAgentDashboard: Loading dashboard data');
      setIsLoading(true);
      // Sample data for demonstration
      setEmailSummaries(sampleEmailSummaries);
      setIsRunning(true);
      console.log('SampleEmailSummaryAgentDashboard: Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading Email Summary Agent metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('SampleEmailSummaryAgentDashboard: Loading completed');
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

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Email Summary Agent workflow',
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
        details: 'Request to modify Email Summary Agent workflow settings',
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

  const handleAutomationControl = (action: string) => {
    console.log(`Sample Email Summary Agent Automation: ${action}`);
    // Sample automation control logic
  };

  const getRecentEmails = () => {
    return emailSummaries
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  const getPipelineData = () => {
    const statusCounts = emailSummaries.reduce((acc, email) => {
      acc[email.status] = (acc[email.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status as keyof typeof statusColors]
    }));
  };

  const getPriorityBreakdown = () => {
    const priorityCounts = emailSummaries.reduce((acc, email) => {
      acc[email.priority] = (acc[email.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count,
      color: priorityColors[priority as keyof typeof priorityColors]
    }));
  };

  console.log('SampleEmailSummaryAgentDashboard: Rendering component, isLoading:', isLoading);
  
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
                This is a sample dashboard showing how your Email Summary Agent dashboard will look when you purchase this workflow. 
                All data shown is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <BackButton to="/marketplace" />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Email Summary Agent Dashboard</h1>
              <p className="text-gray-600 mt-1">AI-powered email processing and summarization</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Activity className="w-4 h-4 mr-1" />
                Active
              </Badge>
              <Button onClick={() => handleAutomationControl('refresh')}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>


          {/* Workflow Control Request */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Control</CardTitle>
              <CardDescription>
                Request admin to start, stop, or modify your Email Summary Agent workflow
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

          {/* Recent Processed Requests */}
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

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Emails"
              value={automationStats.totalEmails.toString()}
              change="+15% from last week"
              icon={Mail}
              trend="up"
            />
            <StatCard
              title="Processed Emails"
              value={automationStats.processedEmails.toString()}
              change="+12% from last week"
              icon={CheckCircle}
              trend="up"
            />
            <StatCard
              title="Avg Response Time"
              value={`${automationStats.avgResponseTime.toFixed(1)}s`}
              change="-8% from last week"
              icon={Clock}
              trend="up"
            />
            <StatCard
              title="Time Saved"
              value={`${automationStats.timeSaved.toLocaleString()} chars`}
              change="+20% from last week"
              icon={TrendingUp}
              trend="up"
            />
          </div>

          {/* Pipeline and Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Processing Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Email Processing Pipeline
                </CardTitle>
                <CardDescription>Email status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getPipelineData().map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="font-medium capitalize">{item.status}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{item.count} emails</span>
                        <span className="text-sm font-medium">
                          {((item.count / automationStats.totalEmails) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Priority Breakdown
                </CardTitle>
                <CardDescription>Emails by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getPriorityBreakdown().map((item) => (
                    <div key={item.priority} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="font-medium capitalize">{item.priority} Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{item.count} emails</span>
                        <span className="text-sm font-medium">
                          {((item.count / automationStats.totalEmails) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Email Summaries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Recent Email Summaries
              </CardTitle>
              <CardDescription>Latest processed and summarized emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getRecentEmails().map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">{categoryIcons[email.category]}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{email.subject}</h4>
                        <p className="text-sm text-gray-600">{email.sender}</p>
                        <p className="text-xs text-gray-500 mt-1">{email.summary}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {email.original_length} → {email.summary_length} chars
                          </span>
                          {email.action_required && (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                              Action Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">{email.processing_time > 0 ? `${email.processing_time}s` : 'Pending'}</p>
                        <p className="text-sm text-gray-600">{email.ai_confidence > 0 ? `${email.ai_confidence}%` : 'Processing'}</p>
                      </div>
                      <Badge className={emailStatuses[email.status].color}>
                        {emailStatuses[email.status].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Email Processing Controls
              </CardTitle>
              <CardDescription>Manage email summary automation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center"
                  onClick={() => handleAutomationControl('process_emails')}
                >
                  <Mail className="w-6 h-6 mb-2" />
                  <span className="text-sm">Process Emails</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center"
                  onClick={() => handleAutomationControl('generate_summaries')}
                >
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="text-sm">Generate Summaries</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center"
                  onClick={() => handleAutomationControl('archive_old')}
                >
                  <Archive className="w-6 h-6 mb-2" />
                  <span className="text-sm">Archive Old</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                System Health
              </CardTitle>
              <CardDescription>Email Summary Agent system components status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Email Server</p>
                    <p className="text-xs text-gray-600">Connected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">AI Processor</p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Database</p>
                    <p className="text-xs text-gray-600">Synced</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Notification</p>
                    <p className="text-xs text-gray-600">Online</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SampleEmailSummaryAgentDashboard; 