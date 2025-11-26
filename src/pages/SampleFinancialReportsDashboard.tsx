import React, { useState } from 'react';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  FileText,
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
  Calendar,
  PieChart,
  LineChart,
  AlertTriangle,
  Database,
  XCircle,
  Settings
} from "lucide-react";
import Navbar from '@/components/Navbar';
import { formatQAR } from '@/lib/currency';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const SampleFinancialReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();

  // Sample data for demonstration
  const sampleMetrics = {
    totalRevenue: 1250000,
    totalExpenses: 890000,
    netProfit: 360000,
    profitMargin: 28.8,
    monthlyGrowth: 12.5,
    reportsGenerated: 45,
    automationRate: 92.3,
    accuracyRate: 98.7
  };

  const stats = [
    {
      title: "Total Revenue",
      value: formatQAR(sampleMetrics.totalRevenue),
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Net Profit",
      value: formatQAR(sampleMetrics.netProfit),
      change: "+18.2%",
      trend: "up",
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      title: "Profit Margin",
      value: `${sampleMetrics.profitMargin}%`,
      change: "+2.1%",
      trend: "up",
      icon: BarChart3,
      color: "text-purple-600"
    },
    {
      title: "Reports Generated",
      value: sampleMetrics.reportsGenerated.toString(),
      change: "+5",
      trend: "up",
      icon: FileText,
      color: "text-orange-600"
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: "Q4 2024 Financial Report",
      type: "Quarterly",
      status: "Completed",
      generatedAt: "2 hours ago",
      revenue: 1250000,
      expenses: 890000,
      profit: 360000,
      accuracy: 98.7
    },
    {
      id: 2,
      name: "December 2024 Monthly Report",
      type: "Monthly",
      status: "Completed",
      generatedAt: "1 day ago",
      revenue: 420000,
      expenses: 310000,
      profit: 110000,
      accuracy: 99.1
    },
    {
      id: 3,
      name: "Annual 2024 Financial Summary",
      type: "Annual",
      status: "In Progress",
      generatedAt: "3 days ago",
      revenue: 4800000,
      expenses: 3400000,
      profit: 1400000,
      accuracy: 97.8
    },
    {
      id: 4,
      name: "November 2024 Monthly Report",
      type: "Monthly",
      status: "Completed",
      generatedAt: "1 week ago",
      revenue: 380000,
      expenses: 280000,
      profit: 100000,
      accuracy: 98.9
    }
  ];

  const expenseCategories = [
    {
      category: "Personnel",
      amount: 450000,
      percentage: 50.6,
      trend: "+8.2%"
    },
    {
      category: "Operations",
      amount: 180000,
      percentage: 20.2,
      trend: "+5.1%"
    },
    {
      category: "Marketing",
      amount: 120000,
      percentage: 13.5,
      trend: "+12.3%"
    },
    {
      category: "Technology",
      amount: 80000,
      percentage: 9.0,
      trend: "+15.7%"
    },
    {
      category: "Other",
      amount: 60000,
      percentage: 6.7,
      trend: "-2.1%"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Generate Financial Reports with AI workflow',
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
        details: 'Request to modify Generate Financial Reports with AI workflow settings',
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

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'annual': return 'bg-green-100 text-green-800';
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
                This is a sample dashboard showing how your Financial Reports workflow dashboard will look when you purchase this workflow. 
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
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Financial Reports Dashboard</h1>
              <p className="text-gray-600 mt-2">AI-powered financial reporting and analysis automation</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button className="bg-waselify-500 hover:bg-waselify-600 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>



        {/* Workflow Control Request */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Workflow Control</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your Generate Financial Reports with AI workflow
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
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                  <CardDescription>Key financial metrics and performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenue vs Expenses</span>
                      <span className="text-sm font-medium">71.2%</span>
                    </div>
                    <Progress value={71.2} className="w-full" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Revenue</p>
                        <p className="font-medium">{formatQAR(sampleMetrics.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expenses</p>
                        <p className="font-medium">{formatQAR(sampleMetrics.totalExpenses)}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Net Profit</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatQAR(sampleMetrics.netProfit)}
                        </span>
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
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Monthly Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      Schedule Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators for financial reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{sampleMetrics.automationRate}%</div>
                    <p className="text-sm text-gray-600">Automation Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{sampleMetrics.accuracyRate}%</div>
                    <p className="text-sm text-gray-600">Accuracy Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{sampleMetrics.monthlyGrowth}%</div>
                    <p className="text-sm text-gray-600">Monthly Growth</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{sampleMetrics.reportsGenerated}</div>
                    <p className="text-sm text-gray-600">Reports Generated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>Latest generated financial reports and their status</CardDescription>
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
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-waselify-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-waselify-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge className={getTypeColor(report.type)}>
                              {report.type}
                            </Badge>
                            <span className="text-sm text-gray-600">Accuracy: {report.accuracy}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatQAR(report.revenue)} Revenue</p>
                          <p className="text-sm text-gray-600">{formatQAR(report.profit)} Profit</p>
                          <p className="text-xs text-gray-500">{report.generatedAt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Detailed breakdown of expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseCategories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-waselify-100 rounded-lg flex items-center justify-center">
                          <PieChart className="w-6 h-6 text-waselify-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{category.category}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600">{formatQAR(category.amount)}</span>
                            <span className="text-sm text-gray-600">{category.percentage}% of total</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{category.trend}</p>
                          <p className="text-xs text-gray-500">vs last month</p>
                        </div>
                        <Progress value={category.percentage} className="w-24" />
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
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Q4 2024</span>
                      <span className="text-sm font-medium">{formatQAR(1250000)}</span>
                    </div>
                    <Progress value={100} className="w-full" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Q3 2024</span>
                      <span className="text-sm font-medium">{formatQAR(1120000)}</span>
                    </div>
                    <Progress value={89.6} className="w-full" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Q2 2024</span>
                      <span className="text-sm font-medium">{formatQAR(980000)}</span>
                    </div>
                    <Progress value={78.4} className="w-full" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Q1 2024</span>
                      <span className="text-sm font-medium">{formatQAR(850000)}</span>
                    </div>
                    <Progress value={68} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Generation Stats</CardTitle>
                  <CardDescription>Automation and accuracy statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Automation Rate</span>
                      <span className="text-sm font-medium">{sampleMetrics.automationRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Accuracy</span>
                      <span className="text-sm font-medium">{sampleMetrics.accuracyRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Processing Time</span>
                      <span className="text-sm font-medium">2.3 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Rate</span>
                      <span className="text-sm font-medium">1.3%</span>
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

export default SampleFinancialReportsDashboard; 