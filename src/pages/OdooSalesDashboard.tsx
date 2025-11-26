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
  ShoppingCart,
  DollarSign,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Database,
  Zap,
  Activity,
  BarChart,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import AdminBannerOverlay from '@/components/AdminBannerOverlay';



interface SalesOpportunity {
  id: string;
  customer: string;
  product: string;
  value: number;
  status: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  created_at: string;
  last_activity: string;
  ai_interactions: number;
  conversion_likelihood: number;
}

interface AutomationStats {
  totalOpportunities: number;
  aiQualified: number;
  conversionRate: number;
  avgDealSize: number;
  totalValue: number;
  aiAccuracy: number;
}

const OdooSalesDashboard: React.FC = () => {
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([]);
  const [automationStats, setAutomationStats] = useState<AutomationStats>({
    totalOpportunities: 0,
    aiQualified: 0,
    conversionRate: 0,
    avgDealSize: 0,
    totalValue: 0,
    aiAccuracy: 0
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const { isConnected } = useRealtimeMetrics('AI Chatbot for Odoo Sales');


  const opportunityStatuses = {
    new: { label: 'New Lead', color: 'bg-blue-100 text-blue-800' },
    qualified: { label: 'AI Qualified', color: 'bg-green-100 text-green-800' },
    proposal: { label: 'Proposal Sent', color: 'bg-yellow-100 text-yellow-800' },
    negotiation: { label: 'In Negotiation', color: 'bg-orange-100 text-orange-800' },
    won: { label: 'Won', color: 'bg-green-100 text-green-800' },
    lost: { label: 'Lost', color: 'bg-red-100 text-red-800' }
  };

  const statusColors = {
    new: '#3B82F6',
    qualified: '#10B981',
    proposal: '#F59E0B',
    negotiation: '#F97316',
    won: '#10B981',
    lost: '#EF4444'
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

  const loadOpportunityData = () => {
    // TODO: Replace with real API call
    setOpportunities([]);
    calculateStats([]);
  };

  const calculateStats = (data: SalesOpportunity[]) => {
    const totalOpportunities = data.length;
    const aiQualified = data.filter(opp => opp.status === 'qualified').length;
    const wonOpportunities = data.filter(opp => opp.status === 'won').length;
    const conversionRate = totalOpportunities > 0 ? (wonOpportunities / totalOpportunities) * 100 : 0;
    const totalValue = data.reduce((sum, opp) => sum + opp.value, 0);
    const avgDealSize = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;
    const aiAccuracy = data.length > 0 ? data.reduce((sum, opp) => sum + opp.conversion_likelihood, 0) / data.length : 0;

    setAutomationStats({
      totalOpportunities,
      aiQualified,
      conversionRate,
      avgDealSize,
      totalValue,
      aiAccuracy
    });
  };

  const handleAutomationControl = (action: string) => {
    console.log('AI Chatbot for Odoo Sales Automation:', action);
    // Implement actual automation control
  };

  const loadPendingRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: requests, error } = await supabase
        .from('workflow_control_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('workflow_name', 'AI Chatbot for Odoo Sales')
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
        .eq('workflow_name', 'AI Chatbot for Odoo Sales');

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
          workflow_name: 'AI Chatbot for Odoo Sales',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the AI Chatbot for Odoo Sales workflow`,
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

  const getRecentOpportunities = () => {
    return opportunities
      .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())
      .slice(0, 5);
  };

  const getPipelineData = () => {
    const statusCounts = opportunities.reduce((acc, opp) => {
      acc[opp.status] = (acc[opp.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status as keyof typeof statusColors]
    }));
  };

  const getValueByStatus = () => {
    const valueByStatus = opportunities.reduce((acc, opp) => {
      acc[opp.status] = (acc[opp.status] || 0) + opp.value;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(valueByStatus).map(([status, value]) => ({
      status,
      value,
      color: statusColors[status as keyof typeof statusColors]
    }));
  };

  useEffect(() => {
    loadOpportunityData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.workflowName;
      if (name?.startsWith('AI Chatbot for Odoo Sales')) {
        loadOpportunityData();
        loadPendingRequests();
        loadProcessedRequests();
      }
    };
    window.addEventListener('workflowExecutionUpdate', handler as EventListener);
    return () => window.removeEventListener('workflowExecutionUpdate', handler as EventListener);
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
      <AdminBannerOverlay workflowName="AI Chatbot for Odoo Sales" />

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold">Odoo Sales AI Dashboard</h1>
            </div>
            <p className="text-muted-foreground ml-7">AI-powered sales opportunity management and qualification</p>
          </div>
        </div>

        {/* Dashboard Status */}
        {opportunities.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-0.5">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
                <p className="text-green-800 text-sm">
                  🎉 Showing real-time AI Chatbot for Odoo Sales metrics from your workflow executions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Automation Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold">Odoo Sales AI Assistant</h3>
                  <p className="text-sm text-gray-600">Automatically qualifying leads and managing sales pipeline</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleAutomationControl('pause')}>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
                <Button size="sm" onClick={() => handleAutomationControl('start')}>
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Control Request */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Control</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your AI Chatbot for Odoo Sales workflow
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
            title="Total Opportunities"
            value={automationStats.totalOpportunities.toString()}
            change="+12% from last month"
            icon={Target}
            trend="up"
          />
          <StatCard
            title="AI Qualified"
            value={automationStats.aiQualified.toString()}
            change="+8% from last month"
            icon={CheckCircle}
            trend="up"
          />
          <StatCard
            title="Conversion Rate"
            value={`${automationStats.conversionRate.toFixed(1)}%`}
            change="+5% from last month"
            icon={TrendingUp}
            trend="up"
          />
          <StatCard
            title="Avg Deal Size"
            value={`$${automationStats.avgDealSize.toLocaleString()}`}
            change="+15% from last month"
            icon={DollarSign}
            trend="up"
          />
        </div>

        {/* Pipeline and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Sales Pipeline
              </CardTitle>
              <CardDescription>Opportunity distribution by stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getPipelineData().map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium capitalize">{item.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{item.count} opportunities</span>
                      <span className="text-sm font-medium">
                        {((item.count / automationStats.totalOpportunities) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Value */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Pipeline Value
              </CardTitle>
              <CardDescription>Total value by opportunity stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getValueByStatus().map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium capitalize">{item.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">${item.value.toLocaleString()}</span>
                      <span className="text-sm text-gray-600">
                        {((item.value / automationStats.totalValue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Recent Opportunities
            </CardTitle>
            <CardDescription>Latest sales opportunities managed by AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecentOpportunities().map((opportunity) => (
                <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{opportunity.customer}</h4>
                      <p className="text-sm text-gray-600">{opportunity.product}</p>
                      <p className="text-xs text-gray-500">
                        AI Interactions: {opportunity.ai_interactions} |
                        Conversion Likelihood: {opportunity.conversion_likelihood}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">${opportunity.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{opportunity.probability}% probability</p>
                    </div>
                    <Badge className={opportunityStatuses[opportunity.status].color}>
                      {opportunityStatuses[opportunity.status].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              AI Sales Controls
            </CardTitle>
            <CardDescription>Manage AI-powered sales automation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center"
                onClick={() => handleAutomationControl('qualify_leads')}
              >
                <Target className="w-6 h-6 mb-2" />
                <span className="text-sm">AI Lead Qualification</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center"
                onClick={() => handleAutomationControl('update_pipeline')}
              >
                <RefreshCw className="w-6 h-6 mb-2" />
                <span className="text-sm">Update Pipeline</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center"
                onClick={() => handleAutomationControl('generate_proposals')}
              >
                <FileText className="w-6 h-6 mb-2" />
                <span className="text-sm">Generate Proposals</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Health
            </CardTitle>
            <CardDescription>Odoo Sales AI system components status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">Odoo API</p>
                  <p className="text-xs text-gray-600">Connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">AI Engine</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">Database</p>
                  <p className="text-xs text-gray-600">Synced</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">CRM Sync</p>
                  <p className="text-xs text-gray-600">Real-time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default OdooSalesDashboard;
