import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  MessageSquare,
  Star,
  ArrowUpRight,
  Filter,
  Search,
  Download,
  RefreshCw,
  Plus,
  Image,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Settings
} from "lucide-react";
import BackButton from '@/components/BackButton';
import Navbar from '@/components/Navbar';
import { workflowSpecificApi, WhatsAppProductCatalogMetrics } from '@/services/workflowSpecificApi';
import { formatCurrency } from '@/lib/currency';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

import AdminBannerOverlay from '@/components/AdminBannerOverlay';


const WhatsAppProductCatalogDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<WhatsAppProductCatalogMetrics>({
    catalogQueries: 0,
    productSearches: 0,
    orderInquiries: 0,
    customerInteractions: 0,
    averageResponseTime: 0,
    conversionRate: 0,
    customerSatisfaction: 0,
    salesImpact: 0
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const { isConnected } = useRealtimeMetrics('WhatsApp Product Catalog');

  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();

  const handleStartAutomation = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual workflow start
      setIsRunning(true);
      toast({
        title: "Workflow Started",
        description: "WhatsApp Product Catalog automation is now running",
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
        description: "WhatsApp Product Catalog automation has been paused",
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
      const metricsData = await workflowSpecificApi.getWhatsAppProductCatalogMetrics();
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
        .eq('workflow_name', 'WhatsApp Product Catalog')
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
        .eq('workflow_name', 'WhatsApp Product Catalog');

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
          workflow_name: 'WhatsApp Product Catalog',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the WhatsApp Product Catalog workflow`,
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
    loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.workflowName;
      if (name?.startsWith('WhatsApp Product Catalog')) {
        loadDashboardData();
        loadPendingRequests();
        loadProcessedRequests();
      }
    };
    window.addEventListener('workflowExecutionUpdate', handler as EventListener);
    return () => window.removeEventListener('workflowExecutionUpdate', handler as EventListener);
  }, []);


      <AdminBannerOverlay workflowName="WhatsApp Product Catalog" />

  const stats = [
    {
      title: "Catalog Queries",
      value: metrics.catalogQueries.toString(),
      change: "+12.5%",
      trend: "up",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Product Searches",
      value: metrics.productSearches.toString(),
      change: "+8.2%",
      trend: "up",
      icon: Search,
      color: "text-green-600"
    },
    {
      title: "Customer Interactions",
      value: metrics.customerInteractions.toString(),
      change: "+15.3%",
      trend: "up",
      icon: MessageSquare,
      color: "text-purple-600"
    },
    {
      title: "Sales Impact",
      value: formatCurrency(metrics.salesImpact),
      change: "+18.2%",
      trend: "up",
      icon: DollarSign,
      color: "text-orange-600"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "low_stock": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    loadDashboardData().finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <AdminBannerOverlay workflowName="WhatsApp Product Catalog" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <BackButton to="/dashboard" />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">WhatsApp Product Catalog</h1>
              <p className="text-gray-600 mt-1">Manage your product catalog and customer orders</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant={isRunning ? "destructive" : "default"}
                onClick={isRunning ? handlePauseAutomation : handleStartAutomation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : isRunning ? (
                  <XCircle className="h-4 w-4 mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {isLoading ? "Processing..." : isRunning ? "Stop Automation" : "Start Automation"}
              </Button>
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        {/* Dashboard Status */}
        {metrics.catalogQueries > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-0.5">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
                <p className="text-green-800 text-sm">
                  🎉 Showing real-time WhatsApp Product Catalog metrics from your workflow executions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Control Request */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Workflow Control</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your WhatsApp Product Catalog workflow
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
          <Card className="mb-6">
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
          <Card className="mb-6">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className={`h-4 w-4 mr-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Engagement</CardTitle>
                  <CardDescription>Interaction metrics and response times</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="text-sm font-medium">{metrics.conversionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.conversionRate} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Customer Satisfaction</span>
                      <span className="text-sm font-medium">{metrics.customerSatisfaction.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.customerSatisfaction} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Response Time</span>
                      <span className="text-sm font-medium">{metrics.averageResponseTime.toFixed(1)}s</span>
                    </div>
                    <Progress value={Math.min((metrics.averageResponseTime / 60) * 100, 100)} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Product Catalog Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Catalog Activity Summary</CardTitle>
                  <CardDescription>Key metrics from your automation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Order Inquiries</span>
                      <span className="text-sm font-medium">{metrics.orderInquiries}</span>
                    </div>
                    <Progress value={Math.min((metrics.orderInquiries / 100) * 100, 100)} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Product Searches</span>
                      <span className="text-sm font-medium">{metrics.productSearches}</span>
                    </div>
                    <Progress value={Math.min((metrics.productSearches / 200) * 100, 100)} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Catalog Queries</span>
                      <span className="text-sm font-medium">{metrics.catalogQueries}</span>
                    </div>
                    <Progress value={Math.min((metrics.catalogQueries / 150) * 100, 100)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Catalog</CardTitle>
                    <CardDescription>Manage your product inventory</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">WhatsApp Product Catalog System</h4>
                        <p className="text-sm text-gray-600">Automated catalog management</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">Queries: {metrics.catalogQueries}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{metrics.customerSatisfaction.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">{formatCurrency(metrics.salesImpact)}</p>
                        <p className="text-sm text-gray-600">Sales Impact</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>Automated order processing</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Automated Order Processing</h4>
                        <p className="text-sm text-gray-600">WhatsApp-based ordering system</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">Inquiries: {metrics.orderInquiries}</span>
                          <span className="text-sm text-gray-600">Conversion: {metrics.conversionRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">{metrics.customerInteractions}</p>
                        <p className="text-sm text-gray-600">Interactions</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        Automated
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
  );
};

export default WhatsAppProductCatalogDashboard;