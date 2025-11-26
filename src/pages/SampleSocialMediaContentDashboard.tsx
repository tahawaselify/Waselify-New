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
  AlertTriangle,
  Database
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

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

const SampleSocialMediaContentDashboard: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Sample data for demonstration
  const metrics = {
    contentGenerated: 45,
    platformsTargeted: 4,
    engagementRate: 8.7,
    reachMetrics: 125000,
    contentQuality: 94.2,
    postingFrequency: 2.3,
    audienceGrowth: 12.5,
    conversionRate: 3.8
  };
  
  const content: Content[] = [
    {
      id: '1',
      title: 'Product Launch Announcement',
      type: 'image',
      platform: 'instagram',
      status: 'published',
      engagement: 2340,
      likes: 1890,
      shares: 234,
      comments: 216,
      created_at: '2024-01-20T09:00:00Z',
      scheduled_for: '2024-01-20T10:00:00Z',
      published_at: '2024-01-20T10:00:00Z',
      ai_generated: true,
      content_url: '/sample-content-1.jpg'
    },
    {
      id: '2',
      title: 'Industry Insights - Weekly Roundup',
      type: 'text',
      platform: 'linkedin',
      status: 'scheduled',
      engagement: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      created_at: '2024-01-20T11:30:00Z',
      scheduled_for: '2024-01-22T08:00:00Z',
      published_at: '',
      ai_generated: true,
      content_url: ''
    },
    {
      id: '3',
      title: 'Behind the Scenes - Team Culture',
      type: 'video',
      platform: 'facebook',
      status: 'draft',
      engagement: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      created_at: '2024-01-20T14:15:00Z',
      scheduled_for: '',
      published_at: '',
      ai_generated: false,
      content_url: '/sample-content-3.mp4'
    },
    {
      id: '4',
      title: 'Customer Success Story',
      type: 'carousel',
      platform: 'instagram',
      status: 'published',
      engagement: 1890,
      likes: 1456,
      shares: 189,
      comments: 245,
      created_at: '2024-01-19T16:00:00Z',
      scheduled_for: '2024-01-19T17:00:00Z',
      published_at: '2024-01-19T17:00:00Z',
      ai_generated: true,
      content_url: '/sample-content-4.jpg'
    }
  ];

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        description: "Social Media Content automation has been paused",
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

  const getTopContent = () => content.filter(item => item.status === 'published').sort((a, b) => b.engagement - a.engagement).slice(0, 3);

  const getPipelineData = () => [
    { name: 'Draft', value: content.filter(item => item.status === 'draft').length, color: '#6B7280' },
    { name: 'Scheduled', value: content.filter(item => item.status === 'scheduled').length, color: '#3B82F6' },
    { name: 'Published', value: content.filter(item => item.status === 'published').length, color: '#10B981' },
    { name: 'Failed', value: content.filter(item => item.status === 'failed').length, color: '#EF4444' }
  ];

  const getPlatformData = () => [
    { name: 'Instagram', value: content.filter(item => item.platform === 'instagram').length, icon: Instagram },
    { name: 'LinkedIn', value: content.filter(item => item.platform === 'linkedin').length, icon: Linkedin },
    { name: 'Facebook', value: content.filter(item => item.platform === 'facebook').length, icon: Facebook },
    { name: 'Twitter', value: content.filter(item => item.platform === 'twitter').length, icon: Twitter }
  ];

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Generate Social Media Content with AI workflow',
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
        details: 'Request to modify Generate Social Media Content with AI workflow settings',
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

  const getUpcomingContent = () => content.filter(item => item.status === 'scheduled').sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());

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
                This is a sample dashboard showing how your Social Media Content workflow dashboard will look when you purchase this workflow. 
                All data shown is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <BackButton to="/marketplace" />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Social Media Content Generator</h1>
              <p className="text-gray-600 mt-2">AI-powered social media content creation and publishing</p>
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
                Request admin to start, stop, or modify your Generate Social Media Content with AI workflow
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
              title="Content Generated"
              value={metrics.contentGenerated.toString()}
              change="+15.3%"
              icon={FileText}
              trend="up"
            />
            <StatCard
              title="Engagement Rate"
              value={`${metrics.engagementRate}%`}
              change="+8.7%"
              icon={Heart}
              trend="up"
            />
            <StatCard
              title="Total Reach"
              value={metrics.reachMetrics.toLocaleString()}
              change="+12.5%"
              icon={Eye}
              trend="up"
            />
            <StatCard
              title="Content Quality"
              value={`${metrics.contentQuality}%`}
              change="+2.1%"
              icon={Star}
              trend="up"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Recent Content</span>
                  </CardTitle>
                  <CardDescription>Latest AI-generated and published content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {content.map((item) => {
                      const PlatformIcon = platformIcons[item.platform];
                      const ContentIcon = contentTypeIcons[item.type];
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <ContentIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{item.title}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <PlatformIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600 capitalize">{item.platform}</span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={contentStatuses[item.status].color}>
                                  {contentStatuses[item.status].label}
                                </Badge>
                                {item.ai_generated && (
                                  <Badge variant="outline" className="text-blue-600">
                                    AI Generated
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {item.status === 'published' ? (
                              <>
                                <p className="font-medium">{item.engagement.toLocaleString()} engagement</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <span>{item.likes} likes</span>
                                  <span>{item.shares} shares</span>
                                  <span>{item.comments} comments</span>
                                </div>
                              </>
                            ) : item.status === 'scheduled' ? (
                              <p className="text-sm text-gray-600">
                                {format(new Date(item.scheduled_for), 'MMM dd, HH:mm')}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-600">
                                {format(new Date(item.created_at), 'MMM dd, HH:mm')}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics */}
            <div className="space-y-6">
              {/* Content Pipeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Content Pipeline</span>
                  </CardTitle>
                  <CardDescription>Content status distribution</CardDescription>
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

              {/* Platform Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Share2 className="h-5 w-5" />
                    <span>By Platform</span>
                  </CardTitle>
                  <CardDescription>Content distribution across platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getPlatformData().map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Upcoming Content</span>
                  </CardTitle>
                  <CardDescription>Scheduled content for next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getUpcomingContent().map((item) => (
                      <div key={item.id} className="p-2 border rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className="text-xs text-gray-600">
                            {format(new Date(item.scheduled_for), 'MMM dd')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 capitalize">{item.platform} • {item.type}</p>
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

export default SampleSocialMediaContentDashboard; 