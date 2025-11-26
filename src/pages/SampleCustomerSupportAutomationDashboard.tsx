import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Users,
  CheckCircle,
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
  Smile,
  Frown,
  AlertTriangle,
  Database,
  XCircle,
  Settings
} from "lucide-react";
import BackButton from '@/components/BackButton';
import Navbar from '@/components/Navbar';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const SampleCustomerSupportAutomationDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();

  // Sample data for demonstration
  const sampleMetrics = {
    totalTickets: 342,
    resolvedTickets: 298,
    averageResolutionTime: "2.3 hours",
    customerSatisfaction: 94.2,
    activeTickets: 44,
    responseTime: "15 minutes",
    automationRate: 78.5,
    totalCustomers: 156
  };

  const stats = [
    {
      title: "Total Tickets",
      value: sampleMetrics.totalTickets.toString(),
      change: "+12.3%",
      trend: "up",
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      title: "Resolution Rate",
      value: `${((sampleMetrics.resolvedTickets / sampleMetrics.totalTickets) * 100).toFixed(1)}%`,
      change: "+3.2%",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Avg Resolution Time",
      value: sampleMetrics.averageResolutionTime,
      change: "-15%",
      trend: "down",
      icon: Clock,
      color: "text-purple-600"
    },
    {
      title: "Customer Satisfaction",
      value: `${sampleMetrics.customerSatisfaction}%`,
      change: "+2.1%",
      trend: "up",
      icon: Smile,
      color: "text-orange-600"
    }
  ];

  const recentTickets = [
    {
      id: 1,
      customerName: "Sarah Johnson",
      email: "sarah.j@techcorp.com",
      subject: "Login Issue",
      priority: "High",
      status: "Resolved",
      category: "Technical",
      assignedTo: "AI Assistant",
      createdAt: "2 hours ago",
      resolvedAt: "1 hour ago",
      satisfaction: 5
    },
    {
      id: 2,
      customerName: "Michael Chen",
      email: "mchen@innovatetech.com",
      subject: "Billing Question",
      priority: "Medium",
      status: "In Progress",
      category: "Billing",
      assignedTo: "AI Assistant",
      createdAt: "4 hours ago",
      resolvedAt: null,
      satisfaction: null
    },
    {
      id: 3,
      customerName: "Emily Rodriguez",
      email: "emily.r@digitaldynamics.com",
      subject: "Feature Request",
      priority: "Low",
      status: "Open",
      category: "Feature",
      assignedTo: "Human Agent",
      createdAt: "6 hours ago",
      resolvedAt: null,
      satisfaction: null
    },
    {
      id: 4,
      customerName: "David Thompson",
      email: "dthompson@futuresystems.com",
      subject: "Account Access",
      priority: "High",
      status: "Resolved",
      category: "Account",
      assignedTo: "AI Assistant",
      createdAt: "1 day ago",
      resolvedAt: "8 hours ago",
      satisfaction: 4
    }
  ];

  const automationStats = [
    {
      category: "Login Issues",
      totalTickets: 89,
      automatedResolutions: 67,
      automationRate: 75.3,
      avgResolutionTime: "1.2 hours"
    },
    {
      category: "Billing Questions",
      totalTickets: 67,
      automatedResolutions: 52,
      automationRate: 77.6,
      avgResolutionTime: "2.1 hours"
    },
    {
      category: "Feature Requests",
      totalTickets: 45,
      automatedResolutions: 12,
      automationRate: 26.7,
      avgResolutionTime: "4.5 hours"
    },
    {
      category: "Account Access",
      totalTickets: 78,
      automatedResolutions: 65,
      automationRate: 83.3,
      avgResolutionTime: "1.8 hours"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Automated Customer Support workflow',
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
        details: 'Request to modify Automated Customer Support workflow settings',
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
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
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
                This is a sample dashboard showing how your Customer Support Automation workflow dashboard will look when you purchase this workflow. 
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
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Customer Support Automation Dashboard</h1>
              <p className="text-gray-600 mt-2">AI-powered customer support and ticket management system</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button className="bg-waselify-500 hover:bg-waselify-600 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Ticket
              </Button>
            </div>
          </div>
        </div>

        
        {/* Workflow Control Request */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Workflow Control</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your Automated Customer Support workflow
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
                    <p className={`text-sm flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
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
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Performance</CardTitle>
                  <CardDescription>Ticket resolution and customer satisfaction metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly Resolution Target</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <Progress value={87} className="w-full" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Target: 95% resolution rate</p>
                        <p className="font-medium">{((sampleMetrics.resolvedTickets / sampleMetrics.totalTickets) * 100).toFixed(1)}% achieved</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Automation Rate</p>
                        <p className="font-medium">{sampleMetrics.automationRate}%</p>
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
                      Create Ticket
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      View Customers
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
                <CardDescription>Key performance indicators for customer support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{sampleMetrics.activeTickets}</div>
                    <p className="text-sm text-gray-600">Active Tickets</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{sampleMetrics.responseTime}</div>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{sampleMetrics.automationRate}%</div>
                    <p className="text-sm text-gray-600">Automation Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{sampleMetrics.totalCustomers}</div>
                    <p className="text-sm text-gray-600">Total Customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Tickets</CardTitle>
                    <CardDescription>Latest customer support tickets and their status</CardDescription>
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
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-waselify-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-waselify-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                          <p className="text-sm text-gray-600">{ticket.customerName} • {ticket.email}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500">Category: {ticket.category}</span>
                            <span className="text-xs text-gray-500">Assigned: {ticket.assignedTo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Created: {ticket.createdAt}</p>
                          {ticket.resolvedAt && (
                            <p className="text-sm text-gray-600">Resolved: {ticket.resolvedAt}</p>
                          )}
                          {ticket.satisfaction && (
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(ticket.satisfaction)].map((_, i) => (
                                <Smile key={i} className="w-3 h-3 text-yellow-500" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Performance</CardTitle>
                <CardDescription>AI automation effectiveness by ticket category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationStats.map((stat) => (
                    <div key={stat.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-waselify-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-6 h-6 text-waselify-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{stat.category}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600">{stat.totalTickets} total tickets</span>
                            <span className="text-sm text-gray-600">{stat.automatedResolutions} automated</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{stat.automationRate}%</p>
                          <p className="text-xs text-gray-500">Automation Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{stat.avgResolutionTime}</p>
                          <p className="text-xs text-gray-500">Avg Resolution</p>
                        </div>
                        <Progress value={stat.automationRate} className="w-24" />
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
                  <CardTitle>Ticket Categories</CardTitle>
                  <CardDescription>Distribution of tickets by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Technical Issues</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <Progress value={35} className="w-full" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Billing Questions</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <Progress value={25} className="w-full" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Feature Requests</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <Progress value={20} className="w-full" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Account Issues</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <Progress value={20} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Satisfaction</CardTitle>
                  <CardDescription>Satisfaction ratings by resolution method</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AI Automated</span>
                      <span className="text-sm font-medium">4.8/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Human Agent</span>
                      <span className="text-sm font-medium">4.6/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Escalated Issues</span>
                      <span className="text-sm font-medium">4.2/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Average</span>
                      <span className="text-sm font-medium">4.7/5</span>
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

export default SampleCustomerSupportAutomationDashboard; 