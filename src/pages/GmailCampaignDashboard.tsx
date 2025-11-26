import React, { useState, useEffect } from "react"
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Mail,
  TrendingUp,
  Users,
  Zap,
  Clock,
  Send,
  Eye,
  MousePointer,
  ArrowRight,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3,
  ArrowLeft,
  XCircle,
  Settings
} from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { GmailCampaignMetrics, workflowSpecificApi } from "@/services/workflowSpecificApi";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";
import AdminBannerOverlay from '@/components/AdminBannerOverlay';


// Gmail Campaign specific statuses
const campaignStatuses = {
  draft: "Draft",
  scheduled: "Scheduled",
  sending: "Sending",
  sent: "Sent",
  paused: "Paused",
  completed: "Completed"
};

const statusColors = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  sending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  sent: "bg-purple-100 text-purple-700 border-purple-200",
  paused: "bg-orange-100 text-orange-700 border-orange-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200"
};

const StatCard = ({ title, value, icon: Icon, color, trend, isLoading }) => (
  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between pb-3">
      <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
          {trend && (
            <p className="text-sm text-slate-500">{trend}</p>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

export default function GmailCampaignDashboard() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [workflowStatus, setWorkflowStatus] = useState('active');
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<GmailCampaignMetrics | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Calculate automation stats from metrics
  const automationStats = {
    totalCampaigns: metrics?.campaignsSent || 0,
    totalSent: metrics?.emailsDelivered || 0,
    totalOpened: Math.round((metrics?.openRate || 0) * (metrics?.emailsDelivered || 0) / 100),
    totalClicked: Math.round((metrics?.clickRate || 0) * (metrics?.emailsDelivered || 0) / 100),
    openRate: metrics?.openRate || 0,
    clickRate: metrics?.clickRate || 0,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000)
  };





  // Set up real-time updates for this workflow
  useRealtimeMetrics('Gmail Campaign Sender');

  useEffect(() => {
    loadCampaignData();
    loadPendingRequests();
    loadProcessedRequests();

    // Listen for real-time updates
    const handleWorkflowUpdate = (event: CustomEvent) => {
      if ((event as any).detail?.workflowName?.startsWith('Gmail Campaign Sender')) {
        loadCampaignData();
      }
    };

    window.addEventListener('workflowExecutionUpdate', handleWorkflowUpdate as EventListener);
    return () => {
      window.removeEventListener('workflowExecutionUpdate', handleWorkflowUpdate as EventListener);
    };
  }, []);

  const loadCampaignData = async () => {
    setIsLoading(true);
    try {
      // Load real metrics from workflow executions
      const data = await workflowSpecificApi.getGmailCampaignMetrics();
      setMetrics(data);
      setIsRunning(true);

      // Simulate loading Gmail campaign data
      const mockCampaigns = [
        {
          id: 1,
          campaign_name: "Q1 Product Launch",
          status: "draft",
          recipients: 5000,
          sent: 0,
          opened: 0,
          clicked: 0,
          scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          subject_line: "Introducing Our New Product Line"
        },
        {
          id: 2,
          campaign_name: "Weekly Newsletter",
          status: "scheduled",
          recipients: 2500,
          sent: 0,
          opened: 0,
          clicked: 0,
          scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          subject_line: "This Week's Industry Insights"
        },
        {
          id: 3,
          campaign_name: "Customer Feedback",
          status: "sending",
          recipients: 1500,
          sent: 750,
          opened: 225,
          clicked: 45,
          scheduled_date: new Date(Date.now()),
          created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          subject_line: "We Value Your Opinion"
        },
        {
          id: 4,
          campaign_name: "Holiday Promotion",
          status: "sent",
          recipients: 3000,
          sent: 3000,
          opened: 900,
          clicked: 180,
          scheduled_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          subject_line: "Special Holiday Offers Inside"
        },
        {
          id: 5,
          campaign_name: "Annual Report",
          status: "completed",
          recipients: 1000,
          sent: 1000,
          opened: 400,
          clicked: 120,
          scheduled_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          subject_line: "Your 2024 Annual Report"
        }
      ];

      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load workflow data",
        variant: "destructive"
      });
      toast({
        title: "Error",
        description: "Failed to load Gmail campaign data",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };



  const handleAutomationControl = (action) => {
    toast({
      title: "Automation Control",
      description: `${action} command sent to Gmail campaign system`,
    });

    if (action === 'start') {
      setWorkflowStatus('active');
    } else if (action === 'pause') {
      setWorkflowStatus('paused');
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
        .eq('workflow_name', 'Gmail Outreach with Auto Follow-Up')
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
        .eq('workflow_name', 'Gmail Outreach with Auto Follow-Up');

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
          workflow_name: 'Gmail Outreach with Auto Follow-Up',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the Gmail Outreach with Auto Follow-Up workflow`,
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

  const getUpcomingCampaigns = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    return campaigns.filter(campaign => {
      if (!campaign.scheduled_date) return false;
      const scheduledDate = new Date(campaign.scheduled_date);
      return isAfter(scheduledDate, today) && isBefore(scheduledDate, nextWeek);
    }).sort((a, b) => {
      const aDate = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0;
      const bDate = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0;
      return aDate - bDate;
    });
  };

  const getPipelineData = () => {
    const statusCounts = {
      draft: 0,
      scheduled: 0,
      sending: 0,
      sent: 0,
      paused: 0,
      completed: 0
    };

    campaigns.forEach(campaign => {
      if (statusCounts.hasOwnProperty(campaign.status)) {
        statusCounts[campaign.status]++;
      }
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: campaignStatuses[status],
      count,
      fill: status === 'completed' ? '#10b981' :
            status === 'paused' ? '#f97316' :
            status === 'sent' ? '#8b5cf6' :
            status === 'sending' ? '#f59e0b' :
            status === 'scheduled' ? '#3b82f6' : '#64748b'
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-4xl font-bold text-slate-800">Gmail Campaign Sender</h1>
            </div>
            <p className="text-slate-600 text-lg ml-7">Automated email campaign management and analytics</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => handleAutomationControl('start')}
              disabled={workflowStatus === 'active'}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Sending
            </Button>
            <Button
              onClick={() => handleAutomationControl('pause')}
              disabled={workflowStatus === 'paused'}
              variant="outline"
              className="px-4 py-2 rounded-xl"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button
              onClick={() => handleAutomationControl('refresh')}
              variant="outline"
              className="px-4 py-2 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Dashboard Status */}
        {campaigns.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-0.5">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
                <p className="text-green-800 text-sm">
                  🎉 Showing real-time Gmail Outreach with Auto Follow-Up metrics from your workflow executions
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
              Request admin to start, stop, or modify your Gmail Outreach with Auto Follow-Up workflow
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

        {/* Automation Status */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${workflowStatus === 'active' ? 'bg-red-500' : 'bg-red-500'}`}></div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Campaign Status: {workflowStatus === 'active' ? 'Running' : 'Paused'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Last run: {automationStats.lastRun ? format(automationStats.lastRun, "MMM d, h:mm a") : 'Never'} |
                    Next run: {automationStats.nextRun ? format(automationStats.nextRun, "MMM d, h:mm a") : 'Not scheduled'}
                  </p>
                </div>
              </div>
              <Badge className={`${workflowStatus === 'active' ? 'bg-red-100 text-red-700' : 'bg-red-100 text-red-700'}`}>
                {workflowStatus === 'active' ? 'Active' : 'Paused'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Status */}
        {emailSummaries && emailSummaries.length > 0 ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-0.5">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
                <p className="text-green-800 text-sm">
                  🎉 Showing real-time ${workflow_name} metrics from your workflow executions
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">
                <Database size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Ready for Data</h3>
                <p className="text-blue-800 text-sm">
                  Your dashboard is ready to display real-time data once you start using the ${workflow_name} workflow
                </p>
              </div>
            </div>
          </div>
        )}
      <AdminBannerOverlay workflowName="Gmail Campaign Sender" />


        {/* Workflow Control Request */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Control</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your ${workflow_name} workflow
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
            title="Total Campaigns"
            value={automationStats.totalCampaigns}
            icon={Mail}
            color="bg-gradient-to-r from-red-500 to-red-600"
            trend="Active campaigns"
            isLoading={isLoading}
          />
          <StatCard
            title="Emails Sent"
            value={automationStats.totalSent.toLocaleString()}
            icon={Send}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            trend="Total delivered"
            isLoading={isLoading}
          />
          <StatCard
            title="Open Rate"
            value={`${automationStats.openRate}%`}
            icon={Eye}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            trend={`${automationStats.totalOpened.toLocaleString()} opened`}
            isLoading={isLoading}
          />
          <StatCard
            title="Click Rate"
            value={`${automationStats.clickRate}%`}
            icon={MousePointer}
            color="bg-gradient-to-r from-emerald-500 to-emerald-600"
            trend={`${automationStats.totalClicked.toLocaleString()} clicks`}
            isLoading={isLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pipeline Visualization */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pipeline Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <BarChart3 className="w-5 h-5 text-red-600" />
                  Campaign Pipeline Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(campaignStatuses).map(([status, label]) => {
                      const count = campaigns.filter(camp => camp.status === status).length;
                      return (
                        <Badge
                          key={status}
                          variant="secondary"
                          className={`${statusColors[status]} px-3 py-1 font-medium`}
                        >
                          {label}: {count}
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Simple Bar Chart */}
                  <div className="h-64 flex items-end justify-between gap-2">
                    {getPipelineData().map((item, index) => {
                      const maxCount = Math.max(...getPipelineData().map(d => d.count));
                      const height = maxCount > 0 ? Math.max((item.count / maxCount) * 200, 20) : 20;

                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                            style={{
                              height: `${height}px`,
                              backgroundColor: item.fill
                            }}
                          ></div>
                          <p className="text-xs text-slate-600 mt-2 text-center">{item.status}</p>
                          <p className="text-sm font-semibold text-slate-800">{item.count}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Campaigns */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Mail className="w-5 h-5 text-red-600" />
                  Recent Campaigns
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-semibold text-sm">
                          {campaign.campaign_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {campaign.campaign_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>"{campaign.subject_line}"</span>
                          <span>•</span>
                          <span>{campaign.recipients.toLocaleString()} recipients</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                          <span>Sent: {campaign.sent.toLocaleString()}</span>
                          <span>Opened: {campaign.opened.toLocaleString()}</span>
                          <span>Clicks: {campaign.clicked.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusColors[campaign.status]} text-xs font-medium border`}>
                        {campaignStatuses[campaign.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Campaigns */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Clock className="w-5 h-5 text-red-600" />
                  Upcoming Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getUpcomingCampaigns().length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    <Clock className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No campaigns scheduled</p>
                  </div>
                ) : (
                  getUpcomingCampaigns().slice(0, 3).map((campaign) => {
                    const scheduledDate = new Date(campaign.scheduled_date);
                    const isToday = format(scheduledDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    const isTomorrow = format(scheduledDate, 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd');

                    return (
                      <div
                        key={campaign.id}
                        className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-800">
                              {campaign.campaign_name}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              isToday ? 'bg-red-50 text-red-600 border-red-200' :
                              isTomorrow ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                              'bg-blue-50 text-blue-600 border-blue-200'
                            }`}
                          >
                            {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : format(scheduledDate, "MMM d")}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <span>{campaign.recipients.toLocaleString()} recipients</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{format(scheduledDate, "h:mm a")}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-600" />
                  Campaign Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-red-50 hover:border-red-200 transition-colors duration-200"
                  onClick={() => handleAutomationControl('start')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Send Campaigns
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-orange-50 hover:border-orange-200 transition-colors duration-200"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Schedule Campaigns
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-purple-50 hover:border-purple-200 transition-colors duration-200"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            {/* Automation Health */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-red-600" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Gmail API</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">SMTP Service</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Database</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Rate Limits</span>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
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
