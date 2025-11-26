import React, { useState, useEffect } from 'react'
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import { SampleWorkflowControl, StatusBadge } from '@/components/sample/SampleDashboardParts';
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
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

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

const SampleOdooSalesDashboard: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Sample data for demonstration
  const automationStats: AutomationStats = {
    totalOpportunities: 156,
    aiQualified: 89,
    conversionRate: 23.5,
    avgDealSize: 12500,
    totalValue: 1950000,
    aiAccuracy: 94.2
  };
  
  const opportunities: SalesOpportunity[] = [
    {
      id: '1',
      customer: 'TechCorp Solutions',
      product: 'Enterprise ERP Suite',
      value: 45000,
      status: 'negotiation',
      probability: 75,
      created_at: '2024-01-15T10:30:00Z',
      last_activity: '2024-01-20T14:15:00Z',
      ai_interactions: 12,
      conversion_likelihood: 85
    },
    {
      id: '2',
      customer: 'DataFlow Systems',
      product: 'CRM Module',
      value: 18000,
      status: 'qualified',
      probability: 60,
      created_at: '2024-01-18T09:15:00Z',
      last_activity: '2024-01-20T11:30:00Z',
      ai_interactions: 8,
      conversion_likelihood: 72
    },
    {
      id: '3',
      customer: 'InnovateLabs',
      product: 'Inventory Management',
      value: 32000,
      status: 'proposal',
      probability: 45,
      created_at: '2024-01-19T16:45:00Z',
      last_activity: '2024-01-20T10:20:00Z',
      ai_interactions: 15,
      conversion_likelihood: 68
    },
    {
      id: '4',
      customer: 'Global Manufacturing Co.',
      product: 'Full ERP Package',
      value: 85000,
      status: 'new',
      probability: 25,
      created_at: '2024-01-20T08:00:00Z',
      last_activity: '2024-01-20T08:00:00Z',
      ai_interactions: 3,
      conversion_likelihood: 45
    }
  ];

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


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
        description: "Odoo Sales automation has been paused",
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

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start AI Chatbot for Odoo Sales workflow',
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
        details: 'Request to modify AI Chatbot for Odoo Sales workflow settings',
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

  const getRecentOpportunities = () => opportunities.slice(0, 5);

  const getPipelineData = () => [
    { name: 'New Leads', value: opportunities.filter(opp => opp.status === 'new').length, color: '#3B82F6' },
    { name: 'AI Qualified', value: opportunities.filter(opp => opp.status === 'qualified').length, color: '#10B981' },
    { name: 'Proposal Sent', value: opportunities.filter(opp => opp.status === 'proposal').length, color: '#F59E0B' },
    { name: 'Negotiation', value: opportunities.filter(opp => opp.status === 'negotiation').length, color: '#F97316' },
    { name: 'Won', value: opportunities.filter(opp => opp.status === 'won').length, color: '#10B981' }
  ];

  const getValueByStatus = () => [
    { name: 'New', value: opportunities.filter(opp => opp.status === 'new').reduce((sum, opp) => sum + opp.value, 0) },
    { name: 'Qualified', value: opportunities.filter(opp => opp.status === 'qualified').reduce((sum, opp) => sum + opp.value, 0) },
    { name: 'Proposal', value: opportunities.filter(opp => opp.status === 'proposal').reduce((sum, opp) => sum + opp.value, 0) },
    { name: 'Negotiation', value: opportunities.filter(opp => opp.status === 'negotiation').reduce((sum, opp) => sum + opp.value, 0) }
  ];

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
                This is a sample dashboard showing how your Odoo Sales workflow dashboard will look when you purchase this workflow. 
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
                <h1 className="text-3xl font-bold text-gray-900 mt-4">Odoo Sales AI Chatbot</h1>
                <p className="text-gray-600 mt-2">AI-powered sales automation and lead qualification</p>
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
                  onClick={handleRefreshData}
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
        </div>

        {/* Workflow Control - standardized */}
        <SampleWorkflowControl
          workflowTitle="AI Chatbot for Odoo Sales"
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

        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Opportunities"
              value={automationStats.totalOpportunities.toString()}
              change="+12.5%"
              icon={Target}
              trend="up"
            />
            <StatCard
              title="AI Qualified"
              value={automationStats.aiQualified.toString()}
              change="+8.3%"
              icon={CheckCircle}
              trend="up"
            />
            <StatCard
              title="Conversion Rate"
              value={`${automationStats.conversionRate}%`}
              change="+2.1%"
              icon={TrendingUp}
              trend="up"
            />
            <StatCard
              title="Total Pipeline Value"
              value={`$${(automationStats.totalValue / 1000000).toFixed(1)}M`}
              change="+15.7%"
              icon={DollarSign}
              trend="up"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Opportunities */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Recent Sales Opportunities</span>
                  </CardTitle>
                  <CardDescription>Latest AI-qualified sales opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {opportunities.map((opportunity) => (
                      <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{opportunity.customer}</h4>
                            <p className="text-sm text-gray-600">{opportunity.product}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={opportunityStatuses[opportunity.status].color}>
                                {opportunityStatuses[opportunity.status].label}
                              </Badge>
                              <Badge variant="outline" className="text-blue-600">
                                {opportunity.probability}% probability
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${opportunity.value.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(opportunity.last_activity), 'MMM dd, HH:mm')}
                          </p>
                          <p className="text-sm text-green-600">
                            {opportunity.ai_interactions} AI interactions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics */}
            <div className="space-y-6">
              {/* Sales Pipeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Sales Pipeline</span>
                  </CardTitle>
                  <CardDescription>Opportunity status distribution</CardDescription>
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

              {/* Pipeline Value */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Pipeline Value</span>
                  </CardTitle>
                  <CardDescription>Value by opportunity status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getValueByStatus().map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium">${(item.value / 1000).toFixed(0)}k</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>AI Performance</span>
                  </CardTitle>
                  <CardDescription>AI automation metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Qualification Accuracy</span>
                      <span className="text-sm font-medium">{automationStats.aiAccuracy}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Deal Size</span>
                      <span className="text-sm font-medium">${automationStats.avgDealSize.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total AI Interactions</span>
                      <span className="text-sm font-medium">
                        {opportunities.reduce((sum, opp) => sum + opp.ai_interactions, 0)}
                      </span>
                    </div>
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

export default SampleOdooSalesDashboard; 