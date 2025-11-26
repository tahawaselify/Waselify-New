import React, { useState } from 'react';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  TrendingUp, 
  Users, 
  Target,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Filter,
  Search,
  Download,
  Plus,
  Activity,
  Info,
  Eye,
  Reply,
  Forward,
  AlertTriangle,
  Database,
  XCircle,
  Settings
} from "lucide-react";
import Navbar from '@/components/Navbar';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const SampleGmailCampaignDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();

  // Sample data for demonstration
  const sampleMetrics = {
    totalEmails: 1250,
    openRate: 34.2,
    clickRate: 8.7,
    replyRate: 12.3,
    conversionRate: 5.8,
    totalReplies: 154,
    averageResponseTime: "2.1 hours",
    activeCampaigns: 6
  };

  const stats = [
    {
      title: "Total Emails Sent",
      value: sampleMetrics.totalEmails.toLocaleString(),
      change: "+18.5%",
      trend: "up",
      icon: Send,
      color: "text-blue-600"
    },
    {
      title: "Open Rate",
      value: `${sampleMetrics.openRate}%`,
      change: "+2.3%",
      trend: "up",
      icon: Eye,
      color: "text-green-600"
    },
    {
      title: "Click Rate",
      value: `${sampleMetrics.clickRate}%`,
      change: "+1.8%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Reply Rate",
      value: `${sampleMetrics.replyRate}%`,
      change: "+3.1%",
      trend: "up",
      icon: Reply,
      color: "text-orange-600"
    }
  ];

  const recentCampaigns = [
    {
      id: 1,
      name: "Q4 Product Launch",
      status: "Active",
      emailsSent: 250,
      opens: 89,
      clicks: 22,
      replies: 31,
      conversion: 8
    },
    {
      id: 2,
      name: "Holiday Special Offer",
      status: "Active",
      emailsSent: 180,
      opens: 67,
      clicks: 15,
      replies: 18,
      conversion: 6
    },
    {
      id: 3,
      name: "Newsletter - December",
      status: "Completed",
      emailsSent: 320,
      opens: 112,
      clicks: 28,
      replies: 35,
      conversion: 12
    },
    {
      id: 4,
      name: "Follow-up Sequence",
      status: "Paused",
      emailsSent: 150,
      opens: 45,
      clicks: 12,
      replies: 8,
      conversion: 3
    }
  ];

  const recentReplies = [
    {
      id: 1,
      contactName: "Sarah Johnson",
      email: "sarah.j@techcorp.com",
      campaign: "Q4 Product Launch",
      replyTime: "1 hour ago",
      status: "Qualified",
      message: "Interested in learning more about your enterprise solution..."
    },
    {
      id: 2,
      contactName: "Michael Chen",
      email: "mchen@innovatetech.com",
      campaign: "Holiday Special Offer",
      replyTime: "2 hours ago",
      status: "Interested",
      message: "Can you provide more details about the pricing?"
    },
    {
      id: 3,
      contactName: "Emily Rodriguez",
      email: "emily.r@digitaldynamics.com",
      campaign: "Newsletter - December",
      replyTime: "4 hours ago",
      status: "Meeting Scheduled",
      message: "Would love to schedule a demo for next week..."
    },
    {
      id: 4,
      contactName: "David Thompson",
      email: "dthompson@futuresystems.com",
      campaign: "Follow-up Sequence",
      replyTime: "1 day ago",
      status: "Not Interested",
      message: "Thanks but we're not looking for this solution right now..."
    }
  ];

  const emailTemplates = [
    {
      id: 1,
      name: "Product Introduction",
      subject: "Transform Your Business with Our Solution",
      openRate: 38.5,
      clickRate: 9.2,
      replyRate: 14.1,
      usage: 45
    },
    {
      id: 2,
      name: "Special Offer",
      subject: "Limited Time: 20% Off Your First Month",
      openRate: 42.1,
      clickRate: 11.8,
      replyRate: 16.3,
      usage: 32
    },
    {
      id: 3,
      name: "Follow-up",
      subject: "Quick follow-up on our conversation",
      openRate: 35.7,
      clickRate: 7.4,
      replyRate: 12.8,
      usage: 28
    }
  ];

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Gmail Outreach with Auto Follow-Up workflow',
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
        details: 'Request to modify Gmail Outreach with Auto Follow-Up workflow settings',
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'interested': return 'bg-blue-100 text-blue-800';
      case 'meeting scheduled': return 'bg-purple-100 text-purple-800';
      case 'not interested': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Load sample data on component mount
  React.useEffect(() => {
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
                This is a sample dashboard showing how your Gmail Campaign workflow dashboard will look when you purchase this workflow. 
                All data shown is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <BackButton to="/marketplace" />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Gmail Campaign Dashboard</h1>
              <p className="text-gray-600 mt-2">AI-powered email outreach and follow-up automation</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button className="bg-waselify-500 hover:bg-waselify-600 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
            </div>
          </div>
        </div>



        {/* Workflow Control Request */}
        <Card className="mb-6">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="replies">Replies</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>Email campaign metrics and engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly Email Target</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} className="w-full" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Target: 1,600 emails</p>
                        <p className="font-medium">{sampleMetrics.totalEmails} sent</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Conversion Rate</p>
                        <p className="font-medium">{sampleMetrics.conversionRate}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="w-4 h-4 mr-2" />
                      Send New Campaign
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="w-4 h-4 mr-2" />
                      Create Template
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Response Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Response Metrics</CardTitle>
                <CardDescription>Key performance indicators for email campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{sampleMetrics.totalReplies}</div>
                    <p className="text-sm text-gray-600">Total Replies</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{sampleMetrics.averageResponseTime}</div>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{sampleMetrics.activeCampaigns}</div>
                    <p className="text-sm text-gray-600">Active Campaigns</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{sampleMetrics.replyRate}%</div>
                    <p className="text-sm text-gray-600">Reply Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Email Campaigns</CardTitle>
                    <CardDescription>Current and completed email campaigns</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-waselify-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-6 h-6 text-waselify-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600">{campaign.emailsSent} sent</span>
                            <span className="text-sm text-gray-600">{campaign.opens} opens</span>
                            <span className="text-sm text-gray-600">{campaign.clicks} clicks</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{campaign.replies} replies</p>
                          <p className="text-sm text-gray-600">{campaign.conversion} conversions</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">Open: {((campaign.opens / campaign.emailsSent) * 100).toFixed(1)}%</span>
                            <span className="text-xs text-gray-500">Click: {((campaign.clicks / campaign.emailsSent) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="replies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Replies</CardTitle>
                <CardDescription>Latest responses from email campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReplies.map((reply) => (
                    <div key={reply.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-waselify-100 rounded-full flex items-center justify-center">
                          <Reply className="w-5 h-5 text-waselify-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{reply.contactName}</h4>
                            <span className="text-sm text-gray-500">{reply.email}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Campaign: {reply.campaign}</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            "{reply.message}"
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(reply.status)}>
                          {reply.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{reply.replyTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Performance of different email templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-waselify-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-6 h-6 text-waselify-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.subject}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500">Used {template.usage} times</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{template.openRate}%</p>
                          <p className="text-xs text-gray-500">Open Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{template.clickRate}%</p>
                          <p className="text-xs text-gray-500">Click Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{template.replyRate}%</p>
                          <p className="text-xs text-gray-500">Reply Rate</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SampleGmailCampaignDashboard; 