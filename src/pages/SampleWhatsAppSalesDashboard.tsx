import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  TrendingUp, 
  DollarSign, 
  Users,
  ShoppingCart,
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
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Database,
  XCircle,
  Settings
} from "lucide-react";
import BackButton from '@/components/BackButton';
import Navbar from '@/components/Navbar';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const SampleWhatsAppSalesDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();

  // Sample data for demonstration
  const sampleMetrics = {
    totalConversations: 342,
    conversionRate: 28.5,
    totalRevenue: 15420,
    averageOrderValue: 450,
    responseTime: "1.2 minutes",
    customerSatisfaction: 94.2,
    activeCampaigns: 8,
    totalCustomers: 156
  };

  const stats = [
    {
      title: "Total Conversations",
      value: sampleMetrics.totalConversations.toString(),
      change: "+15.3%",
      trend: "up",
      icon: MessageSquare,
      color: "text-green-600"
    },
    {
      title: "Conversion Rate",
      value: `${sampleMetrics.conversionRate}%`,
      change: "+3.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Total Revenue",
      value: `$${sampleMetrics.totalRevenue.toLocaleString()}`,
      change: "+22.1%",
      trend: "up",
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "Avg Order Value",
      value: `$${sampleMetrics.averageOrderValue}`,
      change: "+8.5%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-orange-600"
    }
  ];

  const recentConversations = [
    {
      id: 1,
      customerName: "Maria Garcia",
      phone: "+1-555-0101",
      status: "Completed",
      product: "Premium Package",
      value: 850,
      duration: "15 min",
      lastMessage: "2 hours ago",
      satisfaction: 5
    },
    {
      id: 2,
      customerName: "Ahmed Hassan",
      phone: "+1-555-0102",
      status: "In Progress",
      product: "Basic Package",
      value: 350,
      duration: "8 min",
      lastMessage: "45 min ago",
      satisfaction: 4
    },
    {
      id: 3,
      customerName: "Lisa Chen",
      phone: "+1-555-0103",
      status: "Qualified",
      product: "Enterprise Solution",
      value: 2500,
      duration: "12 min",
      lastMessage: "1 hour ago",
      satisfaction: 5
    },
    {
      id: 4,
      customerName: "Robert Johnson",
      phone: "+1-555-0104",
      status: "Follow Up",
      product: "Standard Package",
      value: 600,
      duration: "20 min",
      lastMessage: "3 hours ago",
      satisfaction: 4
    }
  ];

  const campaigns = [
    {
      id: 1,
      name: "Q4 Holiday Sale",
      status: "Active",
      conversations: 89,
      conversions: 25,
      revenue: 11250,
      target: 15000
    },
    {
      id: 2,
      name: "New Product Launch",
      status: "Active",
      conversations: 67,
      conversions: 18,
      revenue: 8100,
      target: 10000
    },
    {
      id: 3,
      name: "Loyalty Program",
      status: "Paused",
      conversations: 45,
      conversions: 12,
      revenue: 5400,
      target: 8000
    }
  ];

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start WhatsApp Sales Automation workflow',
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
        details: 'Request to modify WhatsApp Sales Automation workflow settings',
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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'qualified': return 'bg-yellow-100 text-yellow-800';
      case 'follow up': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
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
                This is a sample dashboard showing how your WhatsApp Sales workflow dashboard will look when you purchase this workflow. 
                All data shown is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
                      <BackButton to="/marketplace" />
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">WhatsApp Sales Dashboard</h1>
              <p className="text-gray-600 mt-2">AI-powered WhatsApp sales automation and customer engagement</p>
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
              Request admin to start, stop, or modify your WhatsApp Sales Automation workflow
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
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                  <CardDescription>Revenue and conversion metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly Revenue Target</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Progress value={85} className="w-full" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Target: $18,000</p>
                        <p className="font-medium">${sampleMetrics.totalRevenue.toLocaleString()} achieved</p>
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
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start New Chat
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Create Campaign
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

            {/* Customer Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>Overall customer experience metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{sampleMetrics.customerSatisfaction}%</div>
                    <p className="text-sm text-gray-600">Satisfaction Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{sampleMetrics.responseTime}</div>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{sampleMetrics.totalCustomers}</div>
                    <p className="text-sm text-gray-600">Total Customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Conversations</CardTitle>
                    <CardDescription>Latest customer interactions and sales</CardDescription>
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
                  {recentConversations.map((conversation) => (
                    <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-waselify-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-waselify-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{conversation.customerName}</h4>
                          <p className="text-sm text-gray-600">{conversation.product}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500">{conversation.phone}</span>
                            <span className="text-xs text-gray-500">{conversation.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(conversation.status)}>
                          {conversation.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">${conversation.value}</p>
                          <p className="text-xs text-gray-500">{conversation.lastMessage}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(conversation.satisfaction)].map((_, i) => (
                              <CheckCircle key={i} className="w-3 h-3 text-yellow-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>Current WhatsApp sales campaigns and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-waselify-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-waselify-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600">{campaign.conversations} conversations</span>
                            <span className="text-sm text-gray-600">{campaign.conversions} conversions</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">${campaign.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Target: ${campaign.target.toLocaleString()}</p>
                          <Progress value={(campaign.revenue / campaign.target) * 100} className="w-24 mt-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversation Sources</CardTitle>
                  <CardDescription>Distribution of conversations by source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Direct Messages</span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                    <Progress value={60} className="w-full" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Campaign Links</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <Progress value={25} className="w-full" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">QR Code Scans</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <Progress value={10} className="w-full" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Referrals</span>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                    <Progress value={5} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Time Analysis</CardTitle>
                  <CardDescription>Average response times by conversation status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Sales</span>
                      <span className="text-sm font-medium">0.8 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">In Progress</span>
                      <span className="text-sm font-medium">1.2 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Qualified Leads</span>
                      <span className="text-sm font-medium">1.5 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Average</span>
                      <span className="text-sm font-medium">{sampleMetrics.responseTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SampleWhatsAppSalesDashboard; 