import React, { useState, useEffect } from 'react'
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  FileText,
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
  Briefcase,
  GraduationCap,
  MessageSquare,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { workflowSpecificApi, JobApplicationMetrics } from '@/services/workflowSpecificApi';
import { useToast } from "@/hooks/use-toast";
import UpgradeBanner from '@/components/UpgradeBanner';
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import AdminBannerOverlay from '@/components/AdminBannerOverlay';



interface JobApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  position: string;
  department: string;
  status: 'received' | 'screening' | 'shortlisted' | 'interview' | 'hired' | 'rejected';
  aiScore: number;
  experience: number; // years
  skills: string[];
  receivedAt: Date;
  processedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'linkedin' | 'indeed' | 'referral' | 'other';
  resumeUrl?: string;
  coverLetter?: string;
}

const JobApplicationDashboard: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [metrics, setMetrics] = useState<JobApplicationMetrics>({
    applicationsReceived: 0,
    aiScreeningCompleted: 0,
    qualifiedCandidates: 0,
    rejectedApplications: 0,
    averageProcessingTime: 0,
    screeningAccuracy: 0,
    candidateExperience: 0,
    hiringFunnelConversion: 0
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const { isConnected } = useRealtimeMetrics('Handling Job Application Submissions with AI');


  const applicationStatuses = {
    received: { label: 'Received', color: 'bg-blue-500' },
    screening: { label: 'Screening', color: 'bg-yellow-500' },
    shortlisted: { label: 'Shortlisted', color: 'bg-green-500' },
    interview: { label: 'Interview', color: 'bg-purple-500' },
    hired: { label: 'Hired', color: 'bg-emerald-500' },
    rejected: { label: 'Rejected', color: 'bg-red-500' }
  };

  const statusColors = {
    received: 'text-blue-600',
    screening: 'text-yellow-600',
    shortlisted: 'text-green-600',
    interview: 'text-purple-600',
    hired: 'text-emerald-600',
    rejected: 'text-red-600'
  };

  const priorityColors = {
    low: 'text-blue-600',
    medium: 'text-orange-600',
    high: 'text-red-600'
  };

  const sourceColors = {
    website: 'text-blue-600',
    linkedin: 'text-purple-600',
    indeed: 'text-orange-600',
    referral: 'text-green-600',
    other: 'text-gray-600'
  };

  const handleStartAutomation = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual workflow start
      setIsRunning(true);
      toast({
        title: "Workflow Started",
        description: "Job Application automation is now running",
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
        description: "Job Application automation has been paused",
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
      const metricsData = await workflowSpecificApi.getJobApplicationMetrics();
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
        .eq('workflow_name', 'Handling Job Application Submissions with AI')
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
        .eq('workflow_name', 'Handling Job Application Submissions with AI');

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
          workflow_name: 'Handling Job Application Submissions with AI',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the Handling Job Application Submissions with AI workflow`,
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
    console.log(`Handling Job Application Submissions with AI Automation ${action} triggered`);
    // Implement actual automation control logic
  };

  const getPendingApplications = () => {
    return applications.filter(app => app.status === 'received');
  };

  const getScreeningApplications = () => {
    return applications.filter(app => app.status === 'screening');
  };

  const getPipelineData = () => {
    const statusCounts = {
      received: applications.filter(a => a.status === 'received').length,
      screening: applications.filter(a => a.status === 'screening').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      interview: applications.filter(a => a.status === 'interview').length,
      hired: applications.filter(a => a.status === 'hired').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: applicationStatuses[status as keyof typeof applicationStatuses].label,
      count,
      color: applicationStatuses[status as keyof typeof applicationStatuses].color
    }));
  };

  const getDepartmentDistribution = () => {
    const departments = applications.reduce((acc, app) => {
      acc[app.department] = (acc[app.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(departments).map(([department, count]) => ({
      department,
      count,
      percentage: (count / applications.length) * 100
    }));
  };

  const getSourceDistribution = () => {
    const sources = applications.reduce((acc, app) => {
      acc[app.source] = (acc[app.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sources).map(([source, count]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      count,
      percentage: (count / applications.length) * 100
    }));
  };

  const getTopPositions = () => {
    const positions = applications.reduce((acc, app) => {
      acc[app.position] = (acc[app.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(positions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([position, count]) => ({
        position,
        count,
        percentage: (count / applications.length) * 100
      }));
  };

  useEffect(() => {
    loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.workflowName;
      if (name?.startsWith('Handling Job Application Submissions with AI')) {
        loadDashboardData();
        loadPendingRequests();
        loadProcessedRequests();
      }
    };
    window.addEventListener('workflowExecutionUpdate', handler as EventListener);
    return () => window.removeEventListener('workflowExecutionUpdate', handler as EventListener);
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <AdminBannerOverlay workflowName="Handling Job Application Submissions with AI" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold">Job Application AI Dashboard</h1>
          </div>
          <p className="text-muted-foreground ml-7">
            Monitor and manage your AI-powered job application processing system
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
      <UpgradeBanner workflowName="Job Application" />

      {/* Dashboard Status */}
      {metrics.applicationsReceived > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-0.5">
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
              <p className="text-green-800 text-sm">
                🎉 Showing real-time Handling Job Application Submissions with AI metrics from your workflow executions
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
            Request admin to start, stop, or modify your Handling Job Application Submissions with AI workflow
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
          title="Applications Received"
          value={metrics.applicationsReceived}
          icon={Users}
          change="+8"
          changeType="positive"
        />
        <StatCard
          title="AI Screening Completed"
          value={metrics.aiScreeningCompleted}
          icon={FileText}
          change="+5"
          changeType="positive"
        />
        <StatCard
          title="Screening Accuracy"
          value={`${metrics.screeningAccuracy}%`}
          icon={Star}
          change="+3%"
          changeType="positive"
        />
        <StatCard
          title="Avg Processing Time"
          value={`${metrics.averageProcessingTime.toFixed(1)}h`}
          icon={Clock}
          change="-0.5h"
          changeType="positive"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Qualified Candidates"
          value={metrics.qualifiedCandidates}
          icon={CheckCircle}
        />
        <StatCard
          title="Candidate Experience"
          value={`${metrics.candidateExperience}%`}
          icon={GraduationCap}
        />
        <StatCard
          title="Hiring Funnel Conversion"
          value={`${metrics.hiringFunnelConversion}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Job Application Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Job Application Activity Summary</span>
          </CardTitle>
          <CardDescription>Key metrics from your automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{metrics.aiScreeningCompleted}</div>
              <div className="text-sm text-gray-600">AI Screening Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.averageProcessingTime.toFixed(1)}h</div>
              <div className="text-sm text-gray-600">Avg Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{metrics.hiringFunnelConversion}%</div>
              <div className="text-sm text-gray-600">Hiring Funnel Conversion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Processing Pipeline</CardTitle>
            <CardDescription>
              Distribution of applications by processing status
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
                      value={(item.count / Math.max(metrics.applicationsReceived, 1)) * 100}
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Department</CardTitle>
            <CardDescription>
              Distribution by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getDepartmentDistribution().slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{item.department}</span>
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

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Screening Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Screening Accuracy</span>
                  <span>{metrics.screeningAccuracy}%</span>
                </div>
                <Progress value={metrics.screeningAccuracy} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Qualified Candidates</span>
                  <span>{metrics.qualifiedCandidates}</span>
                </div>
                <Progress value={Math.min((metrics.qualifiedCandidates / Math.max(metrics.applicationsReceived, 1)) * 100, 100)} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Rejected Applications</span>
                  <span>{metrics.rejectedApplications}</span>
                </div>
                <Progress value={Math.min((metrics.rejectedApplications / Math.max(metrics.applicationsReceived, 1)) * 100, 100)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Job Application Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Applications Received</span>
                <span className="text-sm font-medium">{metrics.applicationsReceived}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Screening Completed</span>
                <span className="text-sm font-medium">{metrics.aiScreeningCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Candidate Experience</span>
                <span className="text-sm font-medium">{metrics.candidateExperience}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hiring Funnel Conversion</span>
                <span className="text-sm font-medium">{metrics.hiringFunnelConversion}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Processing Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Application Processing Controls</CardTitle>
          <CardDescription>
            Manage your job application AI processing system
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
              <span>Update Criteria</span>
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
            Monitor job application AI processing system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Application Portal</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Bot className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">AI Screening Engine</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Candidate Database</p>
                <p className="text-xs text-muted-foreground">Synced</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Notification System</p>
                <p className="text-xs text-muted-foreground">Active</p>
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

export default JobApplicationDashboard;
