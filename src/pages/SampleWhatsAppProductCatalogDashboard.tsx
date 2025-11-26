import React, { useState } from 'react';
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
  AlertTriangle,
  Database,
  Settings,
  Clock
} from "lucide-react";
import Navbar from '@/components/Navbar';
import { formatQAR } from '@/lib/currency';
import BackButton from '@/components/BackButton';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const SampleWhatsAppProductCatalogDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();

  // Sample data for demonstration
  const sampleMetrics = {
    catalogQueries: 156,
    productSearches: 89,
    orderInquiries: 67,
    customerInteractions: 234,
    averageResponseTime: 2.8,
    conversionRate: 23.5,
    customerSatisfaction: 91.2,
    salesImpact: 12450
  };

  const stats = [
    {
      title: "Catalog Queries",
      value: sampleMetrics.catalogQueries.toString(),
      change: "+12.5%",
      trend: "up",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Product Searches",
      value: sampleMetrics.productSearches.toString(),
      change: "+8.2%",
      trend: "up",
      icon: Search,
      color: "text-green-600"
    },
    {
      title: "Customer Interactions",
      value: sampleMetrics.customerInteractions.toString(),
      change: "+15.3%",
      trend: "up",
      icon: MessageSquare,
      color: "text-purple-600"
    },
    {
      title: "Sales Impact",
      value: formatQAR(sampleMetrics.salesImpact),
      change: "+18.2%",
      trend: "up",
      icon: DollarSign,
      color: "text-orange-600"
    }
  ];

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start WhatsApp Product Catalog with AI workflow',
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
        details: 'Request to modify WhatsApp Product Catalog with AI workflow settings',
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
        <div className="p-4 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">Sample Dashboard Notice</h3>
              <p className="text-yellow-700 text-sm">
                This dashboard shows how your WhatsApp Product Catalog workflow will display real-time data when you purchase it. 
                Metrics will be updated automatically as your automation handles customer queries and processes orders.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <BackButton to="/marketplace" />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">WhatsApp Product Catalog</h1>
              <p className="text-gray-600 mt-2">Manage your product catalog and customer orders</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button className="bg-waselify-500 hover:bg-waselify-600 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Product
              </Button>
            </div>
          </div>
        </div>



        {/* Workflow Control Request */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Workflow Control</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your WhatsApp Product Catalog with AI workflow
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
                      <span className="text-sm font-medium">{sampleMetrics.conversionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={sampleMetrics.conversionRate} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Customer Satisfaction</span>
                      <span className="text-sm font-medium">{sampleMetrics.customerSatisfaction.toFixed(1)}%</span>
                    </div>
                    <Progress value={sampleMetrics.customerSatisfaction} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Response Time</span>
                      <span className="text-sm font-medium">{sampleMetrics.averageResponseTime.toFixed(1)}s</span>
                    </div>
                    <Progress value={Math.min((sampleMetrics.averageResponseTime / 60) * 100, 100)} className="h-2" />
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
                      <span className="text-sm font-medium">{sampleMetrics.orderInquiries}</span>
                    </div>
                    <Progress value={Math.min((sampleMetrics.orderInquiries / 100) * 100, 100)} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Product Searches</span>
                      <span className="text-sm font-medium">{sampleMetrics.productSearches}</span>
                    </div>
                    <Progress value={Math.min((sampleMetrics.productSearches / 200) * 100, 100)} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Catalog Queries</span>
                      <span className="text-sm font-medium">{sampleMetrics.catalogQueries}</span>
                    </div>
                    <Progress value={Math.min((sampleMetrics.catalogQueries / 150) * 100, 100)} className="h-2" />
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
                    <Button variant="outline" size="sm" disabled={true}>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button variant="outline" size="sm" disabled={true}>
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button disabled={true}>
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
                          <span className="text-sm text-gray-600">Queries: {sampleMetrics.catalogQueries}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{sampleMetrics.customerSatisfaction.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">{formatQAR(sampleMetrics.salesImpact)}</p>
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
                  <Button disabled={true}>
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
                          <span className="text-sm text-gray-600">Inquiries: {sampleMetrics.orderInquiries}</span>
                          <span className="text-sm text-gray-600">Conversion: {sampleMetrics.conversionRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">{sampleMetrics.customerInteractions}</p>
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
  );
};

export default SampleWhatsAppProductCatalogDashboard;
