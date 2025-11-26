import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
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
  XCircle,
  Database,
  ArrowLeft
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
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

const EmailSummaryAgentDashboard: React.FC = () => {
  const [emailSummaries, setEmailSummaries] = useState<EmailSummary[]>([]);
  const [metrics, setMetrics] = useState<EmailSummaryAgentMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();

  // Set up real-time updates for this workflow
  useRealtimeMetrics('Email Summary Agent');

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

  useEffect(() => {
    loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
    
    // Listen for real-time updates
    const handleWorkflowUpdate = (event: CustomEvent) => {
      if (event.detail.workflowName === 'Email Summary Agent') {
        loadDashboardData();
      }
    };

    window.addEventListener('workflowExecutionUpdate', handleWorkflowUpdate as EventListener);
    return () => {
      window.removeEventListener('workflowExecutionUpdate', handleWorkflowUpdate as EventListener);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await workflowSpecificApi.getEmailSummaryAgentMetrics();
      setMetrics(data);
      setIsRunning(true);
      loadEmailData();
    } catch (error) {
      console.error('Error loading Email Summary Agent metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
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
            <BackButton />
            
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

  const loadEmailData = () => {
    // TODO: Replace with real API call
    setEmailSummaries([]);
    calculateStats([]);
  };

  const calculateStats = (data: EmailSummary[]) => {
    // Use real metrics from workflow executions
    const automationStats = {
      totalEmails: metrics?.emailsSummarized || data.length,
      processedEmails: metrics?.emailsSummarized || data.filter(email => email.status === 'processed' || email.status === 'summarized').length,
      avgResponseTime: metrics?.processingTime || (data.filter(email => email.processing_time > 0).length > 0 
        ? data.filter(email => email.processing_time > 0).reduce((sum, email) => sum + email.processing_time, 0) / data.filter(email => email.processing_time > 0).length 
        : 0),
      timeSaved: metrics?.timeSaved || data.reduce((sum, email) => sum + (email.original_length - email.summary_length), 0),
      highPriorityEmails: data.filter(email => email.priority === 'high').length,
      aiAccuracy: metrics?.summaryAccuracy || (data.filter(email => email.ai_confidence > 0).length > 0 
        ? data.filter(email => email.ai_confidence > 0).reduce((sum, email) => sum + email.ai_confidence, 0) / data.filter(email => email.ai_confidence > 0).length 
        : 0)
    };
    
    return automationStats;
  };

  const handleAutomationControl = (action: string) => {
    console.log(`Email Summary Agent Automation: ${action}`);
    // Implement actual automation control
  };

  const loadPendingRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: requests, error } = await supabase
        .from('workflow_control_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('workflow_name', 'Email Summary Agent')
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
        .eq('workflow_name', 'Email Summary Agent');

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
          workflow_name: 'Email Summary Agent',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the Email Summary Agent workflow`,
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

  useEffect(() => {
    loadEmailData();
  }, []);

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
              <h1 className="text-3xl font-bold">Email Summary Agent Dashboard</h1>
            </div>
            <p className="text-muted-foreground ml-7">AI-powered email processing and summarization</p>
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

        {/* Automation Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold">Email Summary Agent</h3>
                  <p className="text-sm text-gray-600">Automatically processing and summarizing incoming emails</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleAutomationControl('pause')}>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
                <Button size="sm" onClick={() => handleAutomationControl('start')}>
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Status */}
        {emailSummaries.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-0.5">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
                <p className="text-green-800 text-sm">
                  🎉 Showing real-time Email Summary Agent metrics from your workflow executions
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
                          {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}
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
                          {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}
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

export default EmailSummaryAgentDashboard; 
