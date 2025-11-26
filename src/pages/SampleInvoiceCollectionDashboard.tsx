import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Filter,
  Search,
  Download,
  RefreshCw,
  Plus,
  FileText,
  Users,
  Play,
  Pause,
  AlertTriangle,
  Database,
  Settings
} from "lucide-react";
import BackButton from '@/components/BackButton';
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { SampleWorkflowControl, StatusBadge } from '@/components/sample/SampleDashboardParts';
import { formatQAR } from '@/lib/currency';
import { supabase } from "@/lib/supabaseClient";

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'overdue' | 'pending' | 'disputed';
  daysOverdue: number;
  followUpsSent: number;
  lastFollowUp: string;
  paymentMethod?: string;
  notes?: string;
}

const SampleInvoiceCollectionDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  
  // Sample data for demonstration
  const metrics = {
    invoicesProcessed: 234,
    followUpsSent: 189,
    overdueInvoices: 45,
    paymentReminders: 156,
    responseRate: 78.5,
    collectionSuccess: 92.3,
    averageDaysOverdue: 12.5,
    revenueRecovered: 125000
  };
  
  const { toast } = useToast();

  const invoices: Invoice[] = [
    {
      id: 'INV-001',
      customer: 'TechCorp Solutions',
      amount: 15000,
      dueDate: '2024-01-15',
      status: 'overdue',
      daysOverdue: 5,
      followUpsSent: 3,
      lastFollowUp: '2024-01-20T10:30:00Z',
      notes: 'Customer requested payment extension'
    },
    {
      id: 'INV-002',
      customer: 'DataFlow Systems',
      amount: 8500,
      dueDate: '2024-01-20',
      status: 'pending',
      daysOverdue: 0,
      followUpsSent: 1,
      lastFollowUp: '2024-01-20T14:15:00Z',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'INV-003',
      customer: 'InnovateLabs',
      amount: 22000,
      dueDate: '2024-01-10',
      status: 'paid',
      daysOverdue: 0,
      followUpsSent: 2,
      lastFollowUp: '2024-01-18T09:45:00Z',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'INV-004',
      customer: 'Global Manufacturing Co.',
      amount: 32000,
      dueDate: '2024-01-05',
      status: 'disputed',
      daysOverdue: 15,
      followUpsSent: 5,
      lastFollowUp: '2024-01-20T16:20:00Z',
      notes: 'Quality dispute - under investigation'
    }
  ];

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
        description: "Invoice Collection automation has been paused",
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

  const handleRefresh = async () => {
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

  const stats = [
    {
      title: "Invoices Processed",
      value: metrics.invoicesProcessed,
      change: "+12.5%",
      icon: FileText,
      trend: "up"
    },
    {
      title: "Follow-ups Sent",
      value: metrics.followUpsSent,
      change: "+8.3%",
      icon: AlertCircle,
      trend: "up"
    },
    {
      title: "Collection Success",
      value: `${metrics.collectionSuccess}%`,
      change: "+2.1%",
      icon: CheckCircle,
      trend: "up"
    },
    {
      title: "Revenue Recovered",
      value: formatQAR(metrics.revenueRecovered),
      change: "+15.7%",
      icon: DollarSign,
      trend: "up"
    }
  ];

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Invoice Collection with AI workflow',
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
        details: 'Request to modify Invoice Collection with AI workflow settings',
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
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'disputed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                This is a sample dashboard showing how your Invoice Collection workflow dashboard will look when you purchase this workflow. 
                All data shown is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <BackButton to="/marketplace" />
                <h1 className="text-3xl font-bold text-gray-900 mt-4">Invoice Collection Automation</h1>
                <p className="text-gray-600 mt-2">AI-powered invoice collection and payment reminders</p>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge label={isRunning ? 'Active' : 'Paused'} color={isRunning ? 'green' : 'red'} />
                <Button
                  onClick={isRunning ? handlePauseAutomation : handleStartAutomation}
                  disabled={isLoading}
                  className={isRunning ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-waselify-500 hover:bg-waselify-600 text-white'}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : isRunning ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      <span>Pause Chatbot</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      <span>Start Automation</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </div>



          {/* Workflow Control - standardized */}
          <SampleWorkflowControl
            workflowTitle="Invoice Collection with AI"
            onRequest={handleWorkflowRequest}
          />

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
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <div className="flex items-center mt-1">
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-500 ml-1">{stat.change}</span>
                        </div>
                      </div>
                      <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Invoices */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Recent Invoices</span>
                      </CardTitle>
                      <CardDescription>Latest invoice collection activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {invoices.map((invoice) => (
                          <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{invoice.customer}</h4>
                                <p className="text-sm text-gray-600">Invoice {invoice.id}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge className={getStatusColor(invoice.status)}>
                                    {invoice.status}
                                  </Badge>
                                  {invoice.daysOverdue > 0 && (
                                    <Badge variant="outline" className="text-red-600">
                                      {invoice.daysOverdue} days overdue
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatQAR(invoice.amount)}</p>
                              <p className="text-sm text-gray-600">Due: {invoice.dueDate}</p>
                              <p className="text-sm text-blue-600">
                                {invoice.followUpsSent} follow-ups sent
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Collection Stats */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Collection Stats</span>
                      </CardTitle>
                      <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Response Rate</span>
                          <span className="text-sm font-medium">{metrics.responseRate}%</span>
                        </div>
                        <Progress value={metrics.responseRate} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Overdue Invoices</span>
                          <span className="text-sm font-medium">{metrics.overdueInvoices}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Avg Days Overdue</span>
                          <span className="text-sm font-medium">{metrics.averageDaysOverdue}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Payment Reminders</span>
                          <span className="text-sm font-medium">{metrics.paymentReminders}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Collection Timeline</span>
                      </CardTitle>
                      <CardDescription>Payment collection progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">0-30 days</span>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">31-60 days</span>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">61-90 days</span>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">90+ days</span>
                          <span className="text-sm font-medium">25%</span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Invoices</CardTitle>
                  <CardDescription>Complete invoice collection status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{invoice.customer}</h4>
                            <p className="text-sm text-gray-600">Invoice {invoice.id}</p>
                            {invoice.notes && (
                              <p className="text-sm text-gray-500 mt-1">{invoice.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatQAR(invoice.amount)}</p>
                          <p className="text-sm text-gray-600">Due: {invoice.dueDate}</p>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Collection Performance</CardTitle>
                    <CardDescription>Monthly collection trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">January</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">February</span>
                        <span className="text-sm font-medium">88%</span>
                      </div>
                      <Progress value={88} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">March</span>
                        <span className="text-sm font-medium">95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Customer Payment Behavior</CardTitle>
                    <CardDescription>Payment patterns analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">On-time payments</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Late payments</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                      <Progress value={15} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Disputed invoices</span>
                        <span className="text-sm font-medium">7%</span>
                      </div>
                      <Progress value={7} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SampleInvoiceCollectionDashboard; 