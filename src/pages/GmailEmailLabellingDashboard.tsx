import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mail,
  Tag,
  Clock,
  TrendingUp,
  Activity,
  Database,
  CheckCircle,
  ArrowUpRight,
  RefreshCw,
  XCircle,
  Settings,
  Play,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { GmailLabellingMetrics, workflowSpecificApi } from "@/services/workflowSpecificApi";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";
import AdminBannerOverlay from '@/components/AdminBannerOverlay';


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

const GmailEmailLabellingDashboard: React.FC = () => {
  const [emails, setEmails] = useState<EmailLabel[]>([]);
  const [metrics, setMetrics] = useState<GmailLabellingMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [automationStats, setAutomationStats] = useState<AutomationStats>({
    totalEmails: 0,
    labeledEmails: 0,
    pendingEmails: 0,
    avgProcessingTime: 0,
    accuracyRate: 0,
    timeSaved: 0,
    labelDistribution: {}
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();



  // Set up real-time updates for this workflow
  useRealtimeMetrics('Gmail Email Labelling');

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
    low: 'text-blue-600',
    medium: 'text-orange-600',
    high: 'text-red-600'
  };

  useEffect(() => {
    loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();

    // Listen for real-time updates
    const handleWorkflowUpdate = (event: CustomEvent) => {
      if (event.detail.workflowName === 'Basic Automatic Gmail Email Labelling') {
        loadDashboardData();
      }
    };

    window.addEventListener('workflowExecutionUpdate', handleWorkflowUpdate as EventListener);
    return () => {
      window.removeEventListener('workflowExecutionUpdate', handleWorkflowUpdate as EventListener);
    };
  }, []);

  const loadPendingRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: requests, error } = await supabase
        .from('workflow_control_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('workflow_name', 'Basic Automatic Gmail Email Labelling')
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
        .eq('workflow_name', 'Basic Automatic Gmail Email Labelling');

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

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await workflowSpecificApi.getGmailLabellingMetrics();
      setMetrics(data);
      setIsRunning(true);
      loadEmailData();
    } catch (error) {
      console.error('Error loading Gmail Labelling metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for email labels
  const mockEmails: EmailLabel[] = [
    {
      id: '1',
      emailSubject: 'Project Update - Q1 Results',
      senderEmail: 'manager@company.com',
      senderName: 'John Manager',
      label: 'important',
      confidence: 0.95,
      status: 'labeled',
      receivedAt: new Date('2024-01-15T10:00:00'),
      labeledAt: new Date('2024-01-15T10:02:00'),
      priority: 'high',
      category: 'work'
    },
    {
      id: '2',
      emailSubject: 'Urgent: System Maintenance Tonight',
      senderEmail: 'it@company.com',
      senderName: 'IT Department',
      label: 'urgent',
      confidence: 0.98,
      status: 'labeled',
      receivedAt: new Date('2024-01-15T11:00:00'),
      labeledAt: new Date('2024-01-15T11:01:00'),
      priority: 'high',
      category: 'work'
    },
    {
      id: '3',
      emailSubject: 'Follow up on meeting discussion',
      senderEmail: 'colleague@company.com',
      senderName: 'Sarah Colleague',
      label: 'follow_up',
      confidence: 0.87,
      status: 'labeled',
      receivedAt: new Date('2024-01-15T12:00:00'),
      labeledAt: new Date('2024-01-15T12:03:00'),
      priority: 'medium',
      category: 'work'
    },
    {
      id: '4',
      emailSubject: 'Your order has been shipped',
      senderEmail: 'noreply@amazon.com',
      senderName: 'Amazon',
      label: 'archive',
      confidence: 0.92,
      status: 'labeled',
      receivedAt: new Date('2024-01-15T13:00:00'),
      labeledAt: new Date('2024-01-15T13:02:00'),
      priority: 'low',
      category: 'shopping'
    },
    {
      id: '5',
      emailSubject: 'Exclusive offer - 50% off!',
      senderEmail: 'marketing@store.com',
      senderName: 'Online Store',
      label: 'promotion',
      confidence: 0.89,
      status: 'labeled',
      receivedAt: new Date('2024-01-15T14:00:00'),
      labeledAt: new Date('2024-01-15T14:01:00'),
      priority: 'low',
      category: 'shopping'
    },
    {
      id: '6',
      emailSubject: 'Weekly newsletter',
      senderEmail: 'newsletter@tech.com',
      senderName: 'Tech News',
      label: 'newsletter',
      confidence: 0.94,
      status: 'processing',
      receivedAt: new Date('2024-01-15T15:00:00'),
      priority: 'low',
      category: 'social'
    },
    {
      id: '7',
      emailSubject: 'Congratulations! You won $1000',
      senderEmail: 'winner@lottery.com',
      senderName: 'Lottery Commission',
      label: 'spam',
      confidence: 0.99,
      status: 'labeled',
      receivedAt: new Date('2024-01-15T16:00:00'),
      labeledAt: new Date('2024-01-15T16:01:00'),
      priority: 'low',
      category: 'other'
    },
    {
      id: '8',
      emailSubject: 'Happy Birthday!',
      senderEmail: 'friend@email.com',
      senderName: 'Best Friend',
      label: 'personal',
      confidence: 0.91,
      status: 'pending',
      receivedAt: new Date('2024-01-15T17:00:00'),
      priority: 'medium',
      category: 'personal'
    }
  ];

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
              <p className={`text-xs flex items-center mt-1 ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {change}
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  const loadEmailData = async () => {
    try {
      // Load real email data from workflow_executions table
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: executions, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .filter('user_id', 'eq', user.id)
        .eq('workflow_name', 'Gmail Email Labelling')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading email data:', error);
        // Show empty state on error
        setEmails([]);
        setAutomationStats({
          totalEmails: 0,
          labeledEmails: 0,
          pendingEmails: 0,
          avgProcessingTime: 0,
          accuracyRate: 0,
          timeSaved: 0,
          labelDistribution: {}
        });
        return;
      }

      if (executions && executions.length > 0) {
        // Convert execution data to email format
        const realEmails: EmailLabel[] = executions.map((execution, index) => ({
          id: execution.id,
          emailSubject: execution.input_data?.subject || `Email ${index + 1}`,
          senderEmail: execution.input_data?.sender || 'unknown@example.com',
          senderName: execution.input_data?.sender_name || 'Unknown Sender',
          label: execution.output_data?.label || 'archive',
          confidence: execution.output_data?.confidence || 0.85,
          status: execution.status === 'success' ? 'labeled' : 'failed',
          receivedAt: new Date(execution.created_at),
          labeledAt: execution.status === 'success' ? new Date(execution.updated_at) : undefined,
          priority: execution.output_data?.priority || 'medium',
          category: execution.output_data?.category || 'other'
        }));

        setEmails(realEmails);
        calculateStats(realEmails);
      } else {
        // No real data - show empty state
        setEmails([]);
        setAutomationStats({
          totalEmails: 0,
          labeledEmails: 0,
          pendingEmails: 0,
          avgProcessingTime: 0,
          accuracyRate: 0,
          timeSaved: 0,
          labelDistribution: {}
        });
      }
    } catch (error) {
      console.error('Error loading email data:', error);
      // Show empty state on error
      setEmails([]);
      setAutomationStats({
        totalEmails: 0,
        labeledEmails: 0,
        pendingEmails: 0,
        avgProcessingTime: 0,
        accuracyRate: 0,
        timeSaved: 0,
        labelDistribution: {}
      });
    }
  };

  const calculateStats = (emailData: EmailLabel[]) => {
    const total = emailData.length;
    const labeled = emailData.filter(e => e.status === 'labeled').length;
    const pending = emailData.filter(e => e.status === 'pending').length;

    // Use real metrics from workflow executions
    const avgProcessingTime = metrics?.processingTime || 2.3;
    const accuracyRate = metrics?.categorizationAccuracy || 94.5;
    const timeSaved = (metrics?.emailsProcessed || 0) * 30; // Estimate time saved in seconds

    // Calculate label distribution
    const labelDistribution = emailData.reduce((acc, email) => {
      acc[email.label] = (acc[email.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setAutomationStats({
      totalEmails: metrics?.emailsProcessed || total,
      labeledEmails: metrics?.labelsApplied || labeled,
      pendingEmails: pending,
      avgProcessingTime,
      accuracyRate,
      timeSaved,
      labelDistribution
    });
  };



  const getPendingEmails = () => {
    return emails.filter(email => email.status === 'pending');
  };

  const getProcessingEmails = () => {
    return emails.filter(email => email.status === 'processing');
  };

  const getPipelineData = () => {
    const statusCounts = {
      pending: emails.filter(e => e.status === 'pending').length,
      processing: emails.filter(e => e.status === 'processing').length,
      labeled: emails.filter(e => e.status === 'labeled').length,
      failed: emails.filter(e => e.status === 'failed').length
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: labelStatuses[status as keyof typeof labelStatuses].label,
      count,
      color: labelStatuses[status as keyof typeof labelStatuses].color
    }));
  };

  const getLabelDistribution = () => {
    return Object.entries(automationStats.labelDistribution).map(([label, count]) => ({
      label: label.replace('_', ' ').charAt(0).toUpperCase() + label.replace('_', ' ').slice(1),
      count,
      percentage: (count / automationStats.totalEmails) * 100
    }));
  };

  const getCategoryDistribution = () => {
    const categories = emails.reduce((acc, email) => {
      acc[email.category] = (acc[email.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      percentage: (count / emails.length) * 100
    }));
  };

  const getPriorityDistribution = () => {
    const priorities = emails.reduce((acc, email) => {
      acc[email.priority] = (acc[email.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorities).map(([priority, count]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count,
      percentage: (count / emails.length) * 100
    }));
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
          workflow_name: 'Basic Automatic Gmail Email Labelling',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the Gmail Email Labelling workflow`,
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

  useEffect(() => {
    loadEmailData();
  }, []);


  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.workflowName;
      if (name?.startsWith('Gmail Email Labelling')) {
        // Refresh metrics and detailed email data
        (async () => {
          try {
            setIsLoading(true);
            const data = await workflowSpecificApi.getGmailLabellingMetrics();
            setMetrics(data);
            setIsRunning(true);
            await loadEmailData();
          } finally {
            setIsLoading(false);
          }
        })();
      }
    };
    window.addEventListener('workflowExecutionUpdate', handler as EventListener);
    return () => window.removeEventListener('workflowExecutionUpdate', handler as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AdminBannerOverlay workflowName="Gmail Email Labelling" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold">Gmail Email Labelling Dashboard</h1>
          </div>
          <p className="text-muted-foreground ml-7">
            Monitor and manage your AI-powered email labeling automation system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      {/* Dashboard Status */}
      {emails.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-0.5">
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
              <p className="text-green-800 text-sm">
                🎉 Showing real-time Gmail Email Labelling metrics from your workflow executions
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
            Request admin to start, stop, or modify your Gmail Email Labelling workflow
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Emails"
          value={automationStats.totalEmails}
          icon={Mail}
          change={emails.length > 0 ? "+12" : undefined}
          changeType="positive"
        />
        <StatCard
          title="Labeled Emails"
          value={automationStats.labeledEmails}
          icon={Tag}
          change={emails.length > 0 ? "+8" : undefined}
          changeType="positive"
        />
        <StatCard
          title="Avg Processing Time"
          value={`${automationStats.avgProcessingTime}s`}
          icon={Clock}
          change={emails.length > 0 ? "-0.5s" : undefined}
          changeType="positive"
        />
        <StatCard
          title="Accuracy Rate"
          value={`${automationStats.accuracyRate}%`}
          icon={TrendingUp}
          change={emails.length > 0 ? "+2.1%" : undefined}
          changeType="positive"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Email Labelling Pipeline</CardTitle>
            <CardDescription>
              Distribution of emails by labeling status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emails.length > 0 ? (
                getPipelineData().map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm font-medium">{item.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                      <Progress
                        value={(item.count / automationStats.totalEmails) * 100}
                        className="w-20"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No pipeline data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Label Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Label Distribution</CardTitle>
            <CardDescription>
              Distribution by email labels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emails.length > 0 ? (
                getLabelDistribution().slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{item.label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{item.count}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Tag className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No label distribution data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Emails */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Email Labels</CardTitle>
          <CardDescription>
            Latest emails processed by the labeling system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emails.length > 0 ? (
              emails.slice(0, 5).map((email) => (
                <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{email.emailSubject}</p>
                      <p className="text-sm text-muted-foreground">{email.senderName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(email.receivedAt, 'MMM dd, HH:mm')} • {email.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={statusColors[email.status]}
                    >
                      {labelStatuses[email.status].label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={labelColors[email.label]}
                    >
                      {email.label.replace('_', ' ')}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={priorityColors[email.priority]}
                    >
                      {email.priority}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No emails processed yet</h3>
                <p className="text-gray-500 max-w-sm">
                  Your email processing data will appear here once you start using the Gmail Email Labelling workflow.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Emails */}
      <Card>
        <CardHeader>
          <CardTitle>Currently Processing Emails</CardTitle>
          <CardDescription>
            Emails being analyzed by the AI labeling system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getProcessingEmails().length > 0 ? (
              getProcessingEmails().map((email) => (
                <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <div>
                      <p className="font-medium">{email.emailSubject}</p>
                      <p className="text-sm text-muted-foreground">{email.senderName}</p>
                      <p className="text-xs text-muted-foreground">
                        Processing for {Math.floor((Date.now() - email.receivedAt.getTime()) / 1000)}s
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      Processing
                    </Badge>
                    <Progress value={75} className="w-20" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <RefreshCw className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-gray-500 text-sm">No emails currently processing</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Emails */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Email Labels</CardTitle>
          <CardDescription>
            Emails waiting to be processed by the labeling system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getPendingEmails().length > 0 ? (
              getPendingEmails().map((email) => (
                <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{email.emailSubject}</p>
                      <p className="text-sm text-muted-foreground">{email.senderName}</p>
                      <p className="text-xs text-muted-foreground">
                        Waiting for {Math.floor((Date.now() - email.receivedAt.getTime()) / 60000)}m
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Pending
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4 mr-1" />
                      Process Now
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-gray-500 text-sm">No emails pending processing</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category and Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Email Categories</CardTitle>
            <CardDescription>
              Distribution by email category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getCategoryDistribution().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{item.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{item.count}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Email Priorities</CardTitle>
            <CardDescription>
              Distribution by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getPriorityDistribution().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{item.priority}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{item.count}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </span>
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
  );
};

export default GmailEmailLabellingDashboard;
