import React, { useState, useEffect } from 'react'
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  MessageSquare,
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
  Star,
  FileText,
  Building,
  Phone,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { workflowSpecificApi, HRServiceMetrics } from '@/services/workflowSpecificApi';
import { useToast } from "@/hooks/use-toast";
import UpgradeBanner from '@/components/UpgradeBanner';
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

interface HRRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  requestType: 'leave_request' | 'attendance' | 'payroll' | 'benefits' | 'policy' | 'general';
  status: 'received' | 'processing' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: Date;
  processedAt?: Date;
  aiConfidence: number;
  department: string;
  description: string;
  assignedTo?: string;
  resolutionTime?: number; // in minutes
}

const HRServiceDashboard: React.FC = () => {
  const [requests, setRequests] = useState<HRRequest[]>([]);
  const [metrics, setMetrics] = useState<HRServiceMetrics>({
    hrInquiries: 0,
    automatedResponses: 0,
    policyQueries: 0,
    leaveRequests: 0,
    employeeOnboarding: 0,
    averageResponseTime: 0,
    satisfactionScore: 0,
    escalationRate: 0
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  // Realtime subscription for HR Service
  const { isConnected } = useRealtimeMetrics('Automated HR Service System');

  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.workflowName as string | undefined;
      if (name && name.startsWith('Automated HR Service System')) {
        loadDashboardData();
        loadPendingRequests();
        loadProcessedRequests();
      }
    };
    window.addEventListener('workflowExecutionUpdate', handler as EventListener);
    return () => window.removeEventListener('workflowExecutionUpdate', handler as EventListener);
  }, []);

  const requestStatuses = {
    received: { label: 'Received', color: 'bg-blue-500' },
    processing: { label: 'Processing', color: 'bg-yellow-500' },
    approved: { label: 'Approved', color: 'bg-green-500' },
    rejected: { label: 'Rejected', color: 'bg-red-500' },
    escalated: { label: 'Escalated', color: 'bg-orange-500' }
  };

  const statusColors = {
    received: 'text-blue-600',
    processing: 'text-yellow-600',
    approved: 'text-green-600',
    rejected: 'text-red-600',
    escalated: 'text-orange-600'
  };

  const priorityColors = {
    low: 'text-blue-600',
    medium: 'text-orange-600',
    high: 'text-red-600',
    urgent: 'text-purple-600'
  };

  const requestTypeColors = {
  leave_request: 'text-blue-600',
  attendance: 'text-green-600',
  payroll: 'text-purple-600',
  benefits: 'text-orange-600',
  policy: 'text-red-600',
  general: 'text-gray-600'
};

  const handleStartAutomation = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual workflow start
      setIsRunning(true);
      toast({
        title: "Workflow Started",
        description: "HR Service automation is now running",
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
        description: "HR Service automation has been paused",
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
      const metricsData = await workflowSpecificApi.getHRServiceMetrics();
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
        .eq('workflow_name', 'Automated HR Service System')
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
        .eq('workflow_name', 'Automated HR Service System');

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
          workflow_name: 'Automated HR Service System',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the HR Service Assistant workflow`,
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

    const handleAutomationControl = (action: string) => {
    console.log(`HR Service Assistant Automation ${action} triggered`);
    // Implement actual automation control logic
  };

  const getPendingRequests = () => {
    return requests.filter(request => request.status === 'received');
  };

  const getProcessingRequests = () => {
    return requests.filter(request => request.status === 'processing');
  };

  const getEscalatedRequests = () => {
    return requests.filter(request => request.status === 'escalated');
  };

  const getPipelineData = () => {
    const statusCounts = {
      received: requests.filter(r => r.status === 'received').length,
      processing: requests.filter(r => r.status === 'processing').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      escalated: requests.filter(r => r.status === 'escalated').length
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: requestStatuses[status as keyof typeof requestStatuses].label,
      count,
      color: requestStatuses[status as keyof typeof requestStatuses].color
    }));
  };

  const getRequestTypeDistribution = () => {
    const types = requests.reduce((acc, request) => {
      acc[request.requestType] = (acc[request.requestType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(types).map(([type, count]) => ({
      type: type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1),
      count,
      percentage: (count / requests.length) * 100
    }));
  };

  const getDepartmentDistribution = () => {
    const departments = requests.reduce((acc, request) => {
      acc[request.department] = (acc[request.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(departments).map(([department, count]) => ({
      department,
      count,
      percentage: (count / requests.length) * 100
    }));
  };

  useEffect(() => {
    loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
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
            <h1 className="text-3xl font-bold">HR Service Automation Dashboard</h1>
          </div>
          <p className="text-muted-foreground ml-7">
            Monitor and manage your AI-powered HR service automation system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </Badge>
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
      <UpgradeBanner workflowName="Automated HR Service System" />

      {/* Dashboard Status */}
      {metrics.hrInquiries > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-0.5">
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
              <p className="text-green-800 text-sm">
                🎉 Showing real-time HR Service Assistant metrics from your workflow executions
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
            Request admin to start, stop, or modify your HR Service Assistant workflow
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="HR Inquiries"
          value={metrics.hrInquiries}
          icon={Users}
          change="+12"
          changeType="positive"
        />
        <StatCard
          title="Automated Responses"
          value={metrics.automatedResponses}
          icon={CheckCircle}
          change="+8"
          changeType="positive"
        />
        <StatCard
          title="Avg Response Time"
          value={`${metrics.averageResponseTime.toFixed(1)}s`}
          icon={Clock}
          change="-5s"
          changeType="positive"
        />
        <StatCard
          title="Satisfaction Score"
          value={`${metrics.satisfactionScore}%`}
          icon={Star}
          change="+3%"
          changeType="positive"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Policy Queries"
          value={metrics.policyQueries}
          icon={FileText}
        />
        <StatCard
          title="Leave Requests"
          value={metrics.leaveRequests}
          icon={Calendar}
        />
        <StatCard
          title="Employee Onboarding"
          value={metrics.employeeOnboarding}
          icon={Building}
        />
      </div>

      {/* HR Service Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>HR Service Activity Summary</span>
          </CardTitle>
          <CardDescription>Key metrics from your automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{metrics.automatedResponses}</div>
              <div className="text-sm text-gray-600">Automated Responses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.averageResponseTime.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{metrics.escalationRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Escalation Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>HR Request Pipeline</CardTitle>
            <CardDescription>
              Distribution of HR requests by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPipelineData().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                    <Progress
                      value={(item.count / Math.max(metrics.hrInquiries, 1)) * 100}
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Request Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Request Types</CardTitle>
            <CardDescription>
              Distribution by request type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">Policy Queries</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics.policyQueries}</span>
                  <span className="text-xs text-muted-foreground">
                    {metrics.hrInquiries > 0 ? ((metrics.policyQueries / metrics.hrInquiries) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">Leave Requests</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics.leaveRequests}</span>
                  <span className="text-xs text-muted-foreground">
                    {metrics.hrInquiries > 0 ? ((metrics.leaveRequests / metrics.hrInquiries) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">Employee Onboarding</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics.employeeOnboarding}</span>
                  <span className="text-xs text-muted-foreground">
                    {metrics.hrInquiries > 0 ? ((metrics.employeeOnboarding / metrics.hrInquiries) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Response Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Automated Responses</span>
                  <span>{metrics.automatedResponses}</span>
                </div>
                <Progress value={Math.min((metrics.automatedResponses / Math.max(metrics.hrInquiries, 1)) * 100, 100)} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Escalation Rate</span>
                  <span>{metrics.escalationRate.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.escalationRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Satisfaction Score</span>
                  <span>{metrics.satisfactionScore}%</span>
                </div>
                <Progress value={metrics.satisfactionScore} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>HR Service Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Policy Queries</span>
                <span className="text-sm font-medium">{metrics.policyQueries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Leave Requests</span>
                <span className="text-sm font-medium">{metrics.leaveRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Employee Onboarding</span>
                <span className="text-sm font-medium">{metrics.employeeOnboarding}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Response Time</span>
                <span className="text-sm font-medium">{metrics.averageResponseTime.toFixed(1)}s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HR Service Controls */}
      <Card>
        <CardHeader>
          <CardTitle>HR Service Controls</CardTitle>
          <CardDescription>
            Manage your HR service automation system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleAutomationControl('start')}
              className="h-auto p-4 flex flex-col items-center"
            >
              <Play className="w-6 h-6 mb-2" />
              <span>Start Processing</span>
            </Button>
            <Button
              onClick={() => handleAutomationControl('update')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center"
            >
              <Settings className="w-6 h-6 mb-2" />
              <span>Update Policies</span>
            </Button>
            <Button
              onClick={() => handleAutomationControl('train')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center"
            >
              <Zap className="w-6 h-6 mb-2" />
              <span>Train AI Model</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>
            Monitor HR service automation system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Communication Channels</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Bot className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">AI HR Engine</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Employee Database</p>
                <p className="text-xs text-muted-foreground">Synced</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Building className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Policy Database</p>
                <p className="text-xs text-muted-foreground">Updated</p>
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

export default HRServiceDashboard;
