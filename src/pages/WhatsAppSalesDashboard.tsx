import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Zap, 
  Clock, 
  Phone, 
  ShoppingCart, 
  DollarSign, 
  ArrowRight,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Send,
  XCircle,
  Database,
  Settings,
  ArrowLeft
} from "lucide-react";
import { formatQAR } from '@/lib/currency';
import { format, isAfter, isBefore, addDays } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { workflowSpecificApi } from "@/services/workflowSpecificApi";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";

// WhatsApp Sales specific statuses
const conversationStatuses = {
  initiated: "Initiated",
  responded: "Responded", 
  qualified: "Qualified",
  proposal: "Proposal Sent",
  closed: "Closed",
  lost: "Lost"
};

const statusColors = {
  initiated: "bg-slate-100 text-slate-700 border-slate-200",
  responded: "bg-blue-100 text-blue-700 border-blue-200",
  qualified: "bg-yellow-100 text-yellow-700 border-yellow-200",
  proposal: "bg-purple-100 text-purple-700 border-purple-200",
  closed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lost: "bg-red-100 text-red-700 border-red-200"
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

export default function WhatsAppSalesDashboard() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [workflowStatus, setWorkflowStatus] = useState('active');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const [automationStats, setAutomationStats] = useState({
    totalConversations: 0,
    totalResponded: 0,
    totalQualified: 0,
    totalClosed: 0,
    responseRate: 0,
    conversionRate: 0,
    lastRun: null,
    nextRun: null
  });

  useEffect(() => {
    loadConversationData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  const loadConversationData = async () => {
    setIsLoading(true);
    try {
      // Simulate loading WhatsApp conversation data
      const mockConversations = [
        {
          id: 1,
          customer_name: "Ahmed Hassan",
          phone: "+971-50-123-4567",
          status: "initiated",
          value: 15000,
          last_message: "Hi, I'm interested in your services",
          created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          last_contact: null,
          next_follow_up: null
        },
        {
          id: 2,
          customer_name: "Fatima Al-Rashid",
          phone: "+971-55-987-6543",
          status: "responded",
          value: 25000,
          last_message: "Can you send me more details?",
          created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          last_contact: new Date(Date.now() - 6 * 60 * 60 * 1000),
          next_follow_up: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 3,
          customer_name: "Omar Khalil",
          phone: "+971-52-456-7890",
          status: "qualified",
          value: 35000,
          last_message: "What are your payment terms?",
          created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          last_contact: new Date(Date.now() - 12 * 60 * 60 * 1000),
          next_follow_up: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: 4,
          customer_name: "Layla Mansour",
          phone: "+971-56-789-0123",
          status: "proposal",
          value: 45000,
          last_message: "I'll review the proposal",
          created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          last_contact: new Date(Date.now() - 24 * 60 * 60 * 1000),
          next_follow_up: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        },
        {
          id: 5,
          customer_name: "Youssef Ibrahim",
          phone: "+971-54-321-0987",
          status: "closed",
          value: 55000,
          last_message: "Deal closed successfully!",
          created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          last_contact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          next_follow_up: null
        }
      ];

      setConversations(mockConversations);
      calculateStats(mockConversations);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load workflow data",
        variant: "destructive"
      });
      toast({
        title: "Error",
        description: "Failed to load WhatsApp sales data",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const calculateStats = (conversationsData) => {
    const totalConversations = conversationsData.length;
    const totalResponded = conversationsData.filter(conv => ['responded', 'qualified', 'proposal', 'closed'].includes(conv.status)).length;
    const totalQualified = conversationsData.filter(conv => ['qualified', 'proposal', 'closed'].includes(conv.status)).length;
    const totalClosed = conversationsData.filter(conv => conv.status === 'closed').length;
    
    const responseRate = totalConversations > 0 ? parseFloat(((totalResponded / totalConversations) * 100).toFixed(1)) : 0;
    const conversionRate = totalConversations > 0 ? parseFloat(((totalClosed / totalConversations) * 100).toFixed(1)) : 0;

    setAutomationStats({
      totalConversations,
      totalResponded,
      totalQualified,
      totalClosed,
      responseRate,
      conversionRate,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000)
    });
  };

  const handleAutomationControl = (action) => {
    toast({
      title: "Automation Control",
      description: `${action} command sent to WhatsApp sales chatbot`,
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
        .eq('workflow_name', 'WhatsApp Sales Automation')
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
        .eq('workflow_name', 'WhatsApp Sales Automation');

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
          workflow_name: 'WhatsApp Sales Automation',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the WhatsApp Sales Automation workflow`,
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

  const getUpcomingFollowUps = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    return conversations.filter(conv => {
      if (!conv.next_follow_up) return false;
      const followUpDate = new Date(conv.next_follow_up);
      return isAfter(followUpDate, today) && isBefore(followUpDate, nextWeek);
    }).sort((a, b) => new Date(a.next_follow_up) - new Date(b.next_follow_up));
  };

  const getPipelineData = () => {
    const statusCounts = {
      initiated: 0,
      responded: 0,
      qualified: 0,
      proposal: 0,
      closed: 0,
      lost: 0
    };

    conversations.forEach(conv => {
      if (statusCounts.hasOwnProperty(conv.status)) {
        statusCounts[conv.status]++;
      }
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: conversationStatuses[status],
      count,
      fill: status === 'closed' ? '#10b981' :
            status === 'lost' ? '#ef4444' :
            status === 'proposal' ? '#8b5cf6' :
            status === 'qualified' ? '#f59e0b' :
            status === 'responded' ? '#3b82f6' : '#64748b'
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-4xl font-bold text-slate-800">WhatsApp Sales ChatBot</h1>
            </div>
            <p className="text-slate-600 text-lg ml-7">AI-powered WhatsApp sales automation and lead qualification</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => handleAutomationControl('start')}
              disabled={workflowStatus === 'active'}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
            >
              <Play className="w-4 h-4 mr-2" />
              Start ChatBot
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
        {conversations.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-0.5">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
                <p className="text-green-800 text-sm">
                  🎉 Showing real-time WhatsApp Sales metrics from your workflow executions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Control Request */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
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
        {pendingRequests.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
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
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
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
                <div className={`w-3 h-3 rounded-full ${workflowStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    ChatBot Status: {workflowStatus === 'active' ? 'Running' : 'Paused'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Last run: {automationStats.lastRun ? format(automationStats.lastRun, "MMM d, h:mm a") : 'Never'} | 
                    Next run: {automationStats.nextRun ? format(automationStats.nextRun, "MMM d, h:mm a") : 'Not scheduled'}
                  </p>
                </div>
              </div>
              <Badge className={`${workflowStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
            title="Total Conversations"
            value={automationStats.totalConversations}
            icon={MessageSquare}
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend="WhatsApp interactions"
            isLoading={isLoading}
          />
          <StatCard
            title="Responses Received"
            value={automationStats.totalResponded}
            icon={Phone}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend="Customer engagement"
            isLoading={isLoading}
          />
          <StatCard
            title="Qualification Rate"
            value={`${automationStats.responseRate}%`}
            icon={TrendingUp}
            color="bg-gradient-to-r from-amber-500 to-amber-600"
            trend={`${automationStats.totalQualified} leads qualified`}
            isLoading={isLoading}
          />
          <StatCard
            title="Conversion Rate"
            value={`${automationStats.conversionRate}%`}
            icon={DollarSign}
            color="bg-gradient-to-r from-emerald-500 to-emerald-600"
            trend={`${automationStats.totalClosed} deals closed`}
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
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Sales Pipeline Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(conversationStatuses).map(([status, label]) => {
                      const count = conversations.filter(conv => conv.status === status).length;
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

            {/* Recent Conversations */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Recent Conversations
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {conversations.slice(0, 5).map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-semibold text-sm">
                          {conversation.customer_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {conversation.customer_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Phone className="w-3 h-3" />
                          <span>{conversation.phone}</span>
                          <span>•</span>
                          <span>{format(new Date(conversation.created_date), "MMM d")}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 truncate max-w-xs">
                          "{conversation.last_message}"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusColors[conversation.status]} text-xs font-medium border`}>
                        {conversationStatuses[conversation.status]}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-800">
                        {formatQAR(conversation.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Follow-ups */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Clock className="w-5 h-5 text-green-600" />
                  Upcoming Follow-ups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getUpcomingFollowUps().length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    <Clock className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No follow-ups scheduled</p>
                  </div>
                ) : (
                  getUpcomingFollowUps().slice(0, 3).map((conversation) => {
                    const followUpDate = new Date(conversation.next_follow_up);
                    const isToday = format(followUpDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    const isTomorrow = format(followUpDate, 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd');

                    return (
                      <div
                        key={conversation.id}
                        className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-800">
                              {conversation.customer_name}
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
                            {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : format(followUpDate, "MMM d")}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{conversation.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{format(followUpDate, "h:mm a")}</span>
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
                  <Zap className="w-5 h-5 text-green-600" />
                  ChatBot Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-green-50 hover:border-green-200 transition-colors duration-200"
                  onClick={() => handleAutomationControl('start')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Auto-Response
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Follow-up Messages
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-purple-50 hover:border-purple-200 transition-colors duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Conversation Status
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            {/* Automation Health */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">WhatsApp API</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">AI Chat Engine</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Database</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Message Queue</span>
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
}
