import React, { useState, useEffect } from 'react'
import BackButton from "@/components/BackButton";
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
  Share2,
  Heart,
  Eye,
  Target,
  CheckCircle,
  Clock,
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
  Image,
  Video,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  XCircle,
  Star,
  ArrowLeft
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { workflowSpecificApi, SocialMediaContentMetrics } from '@/services/workflowSpecificApi';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import AdminBannerOverlay from '@/components/AdminBannerOverlay';


interface Content {
  id: string;
  title: string;
  type: 'image' | 'video' | 'text' | 'carousel';
  platform: 'instagram' | 'twitter' | 'facebook' | 'linkedin';
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: number;
  likes: number;
  shares: number;
  comments: number;
  created_at: string;
  scheduled_for: string;
  published_at: string;
  ai_generated: boolean;
  content_url: string;
}

const SocialMediaContentDashboard: React.FC = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<SocialMediaContentMetrics>({
    contentGenerated: 0,
    platformsTargeted: 0,
    engagementRate: 0,
    reachMetrics: 0,
    contentQuality: 0,
    postingFrequency: 0,
    audienceGrowth: 0,
    conversionRate: 0
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const { isConnected } = useRealtimeMetrics('AI-Powered Social Media Content Generator & Publisher');


  const contentStatuses = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    published: { label: 'Published', color: 'bg-green-100 text-green-800' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800' }
  };

  const statusColors = {
    draft: '#6B7280',
    scheduled: '#3B82F6',
    published: '#10B981',
    failed: '#EF4444'
  };

  const platformIcons = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin
  };

  const contentTypeIcons = {
    image: Image,
    video: Video,
    text: FileText,
    carousel: BarChart3
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
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center mt-1">
                {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
                {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500" />}
                {trend === 'neutral' && <Minus className="h-4 w-4 text-gray-500" />}
                <span className={`text-sm ml-1 ${
                  trend === 'up' ? 'text-green-600' :
                  trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <Icon className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleStartAutomation = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual workflow start
      setIsRunning(true);
      toast({
        title: "Workflow Started",
        description: "Social Media Content automation is now running",
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
        description: "Social Media Content automation has been paused",
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
      const metricsData = await workflowSpecificApi.getSocialMediaContentMetrics();
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
        .eq('workflow_name', 'Social Media Content Creation')
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
        .eq('workflow_name', 'Social Media Content Creation');

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
          workflow_name: 'Social Media Content Creation',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the Social Media Content Creation workflow`,
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

  useEffect(() => {
    loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.workflowName;
      if (name?.startsWith('AI-Powered Social Media Content Generator & Publisher')) {
        loadDashboardData();
        loadPendingRequests();
        loadProcessedRequests();
      }
    };
    window.addEventListener('workflowExecutionUpdate', handler as EventListener);
    return () => window.removeEventListener('workflowExecutionUpdate', handler as EventListener);
  }, []);


      <AdminBannerOverlay workflowName="AI-Powered Social Media Content Generator & Publisher" />

  const getTopContent = () => {
    return content
      .filter(item => item.status === 'published')
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);
  };

  const getPipelineData = () => {
    const statusCounts = {
      draft: content.filter(item => item.status === 'draft').length,
      scheduled: content.filter(item => item.status === 'scheduled').length,
      published: content.filter(item => item.status === 'published').length,
      failed: content.filter(item => item.status === 'failed').length
    };
    return statusCounts;
  };

  const getPlatformData = () => {
    const platformCounts = {
      instagram: content.filter(item => item.platform === 'instagram').length,
      twitter: content.filter(item => item.platform === 'twitter').length,
      facebook: content.filter(item => item.platform === 'facebook').length,
      linkedin: content.filter(item => item.platform === 'linkedin').length
    };
    return platformCounts;
  };

  const getUpcomingContent = () => {
    return content
      .filter(item => item.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime())
      .slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <AdminBannerOverlay workflowName="AI-Powered Social Media Content Generator & Publisher" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold">Social Media Content Dashboard</h1>
            </div>
            <p className="text-muted-foreground ml-7">
              AI-powered social media content automation that generates, schedules, and publishes
              engaging content across multiple platforms with intelligent optimization.
            </p>
          </div>
          <div className="flex items-center space-x-3">
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

        {/* Dashboard Status */}
        {metrics.contentGenerated > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-0.5">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
                <p className="text-green-800 text-sm">
                  🎉 Showing real-time Social Media Content Creation metrics from your workflow executions
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
              Request admin to start, stop, or modify your Social Media Content Creation workflow
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
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-0.5">
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
              <p className="text-green-800 text-sm">
                This dashboard displays real-time data from your Social Media Content workflow executions.
                Metrics are updated automatically as your automation generates and publishes content.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Content Generated"
            value={metrics.contentGenerated.toString()}
            change="+25% from last week"
            icon={FileText}
            trend="up"
          />
          <StatCard
            title="Engagement Rate"
            value={`${metrics.engagementRate.toFixed(1)}%`}
            change="+12% from last week"
            icon={Heart}
            trend="up"
          />
          <StatCard
            title="Platforms Targeted"
            value={metrics.platformsTargeted.toString()}
            change="+2 from last week"
            icon={Share2}
            trend="up"
          />
          <StatCard
            title="Conversion Rate"
            value={`${metrics.conversionRate.toFixed(1)}%`}
            change="+8% from last week"
            icon={Target}
            trend="up"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Content Quality"
            value={`${metrics.contentQuality.toFixed(1)}%`}
            icon={Star}
          />
          <StatCard
            title="Posting Frequency"
            value={`${metrics.postingFrequency}/day`}
            icon={Clock}
          />
          <StatCard
            title="Audience Growth"
            value={`+${metrics.audienceGrowth}%`}
            icon={TrendingUp}
          />
        </div>

        {/* Social Media Content Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Social Media Content Activity Summary</span>
            </CardTitle>
            <CardDescription>Key metrics from your automation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{metrics.contentGenerated}</div>
                <div className="text-sm text-gray-600">Content Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{metrics.engagementRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Engagement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{metrics.platformsTargeted}</div>
                <div className="text-sm text-gray-600">Platforms Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Content Pipeline</span>
            </CardTitle>
            <CardDescription>
              Current status of your content across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(getPipelineData()).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{status}</div>
                  <Badge className={`mt-2 ${contentStatuses[status as keyof typeof contentStatuses]?.color}`}>
                    {contentStatuses[status as keyof typeof contentStatuses]?.label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Platform Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(getPlatformData()).map(([platform, count]) => {
                const Icon = platformIcons[platform as keyof typeof platformIcons];
                return (
                  <div key={platform} className="text-center">
                    <div className="flex justify-center mb-2">
                      <Icon className="h-8 w-8 text-gray-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{platform}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Content Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Content Quality</span>
                    <span>{metrics.contentQuality.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${metrics.contentQuality}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Engagement Rate</span>
                    <span>{metrics.engagementRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${metrics.engagementRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Conversion Rate</span>
                    <span>{metrics.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${metrics.conversionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Growth Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audience Growth</span>
                  <span className="text-sm font-medium">+{metrics.audienceGrowth}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Posting Frequency</span>
                  <span className="text-sm font-medium">{metrics.postingFrequency}/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reach Metrics</span>
                  <span className="text-sm font-medium">{metrics.reachMetrics.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaContentDashboard;
