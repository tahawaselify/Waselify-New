import React, { useState, useEffect } from 'react'
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  Play,
  Pause,
  Settings,
  Activity,
  Bot,
  Database,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { workflowSpecificApi, FinancialReportsMetrics } from '@/services/workflowSpecificApi';
import { useToast } from "@/hooks/use-toast";
import UpgradeBanner from '@/components/UpgradeBanner';
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';


interface FinancialReport {
  id: string;
  reportName: string;
  reportType: 'monthly' | 'quarterly' | 'annual' | 'custom';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  dataSource: string;
  generatedAt?: Date;
  fileSize?: string;
  downloadCount: number;
  accuracy: number;
  processingTime?: number; // in minutes
  lastUpdated: Date;
}

const FinancialReportsDashboard: React.FC = () => {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [metrics, setMetrics] = useState<FinancialReportsMetrics>({
    reportsGenerated: 0,
    budgetVarianceAnalysis: 0,
    costCenterReports: 0,
    ytdAnalysis: 0,
    monthlyComparisons: 0,
    dataAccuracy: 0,
    processingTime: 0,
    errorRate: 0
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const { isConnected } = useRealtimeMetrics('Generate Monthly Financial Reports');


  const reportStatuses = {
    pending: { label: 'Pending', color: 'bg-yellow-500' },
    generating: { label: 'Generating', color: 'bg-blue-500' },
    completed: { label: 'Completed', color: 'bg-green-500' },
    failed: { label: 'Failed', color: 'bg-red-500' }
  };

  const statusColors = {
    pending: 'text-yellow-600',
    generating: 'text-blue-600',
    completed: 'text-green-600',
    failed: 'text-red-600'
  };

  const reportTypeColors = {
    monthly: 'text-blue-600',
    quarterly: 'text-green-600',
    annual: 'text-purple-600',
    custom: 'text-orange-600'
  };

  const handleStartAutomation = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual workflow start
      setIsRunning(true);
      toast({
        title: "Workflow Started",
        description: "Financial Reports automation is now running",
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
        description: "Financial Reports automation has been paused",
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
      const metricsData = await workflowSpecificApi.getFinancialReportsMetrics();
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
        .eq('workflow_name', 'Generate Monthly Financial Reports')
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
        .eq('workflow_name', 'Generate Monthly Financial Reports');

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
          workflow_name: 'Generate Monthly Financial Reports',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${action} the Generate Monthly Financial Reports workflow`,
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

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    changeType?: 'positive' | 'negative';
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-xs flex items-center mt-1 ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {change}
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  const handleAutomationControl = (action: string) => {
    console.log(`Generate Monthly Financial Reports Automation ${action} triggered`);
    // Implement actual automation control logic
  };

  const getPendingReports = () => {
    return reports.filter(report => report.status === 'pending');
  };

  const getGeneratingReports = () => {
    return reports.filter(report => report.status === 'generating');
  };

  const getPipelineData = () => {
    const statusCounts = {
      pending: reports.filter(r => r.status === 'pending').length,
      generating: reports.filter(r => r.status === 'generating').length,
      completed: reports.filter(r => r.status === 'completed').length,
      failed: reports.filter(r => r.status === 'failed').length
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: reportStatuses[status as keyof typeof reportStatuses].label,
      count,
      color: reportStatuses[status as keyof typeof reportStatuses].color
    }));
  };

  const getReportTypeDistribution = () => {
    const types = reports.reduce((acc, report) => {
      acc[report.reportType] = (acc[report.reportType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(types).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: (count / reports.length) * 100
    }));
  };

  const getDataSourceDistribution = () => {
    const sources = reports.reduce((acc, report) => {
      acc[report.dataSource] = (acc[report.dataSource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sources).map(([source, count]) => ({
      source,
      count,
      percentage: (count / reports.length) * 100
    }));
  };

  useEffect(() => {
    loadDashboardData();
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail?.workflowName;
      if (name?.startsWith('Generate Monthly Financial Reports')) {
        loadDashboardData();
        loadPendingRequests();
        loadProcessedRequests();
      }
    };
    window.addEventListener('workflowExecutionUpdate', handler as EventListener);
    return () => window.removeEventListener('workflowExecutionUpdate', handler as EventListener);
  }, []);


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold">Financial Reports Dashboard</h1>
          </div>
          <p className="text-muted-foreground ml-7">
            Monitor and manage your automated financial report generation system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </Badge>
          <Button
            onClick={isRunning ? handlePauseAutomation : handleStartAutomation}
            disabled={isLoading}
            variant={isRunning ? "destructive" : "default"}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : isRunning ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span>{isLoading ? "Processing..." : isRunning ? 'Stop' : 'Start'} Automation</span>
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

      {/* Upgrade Banner */}
      <UpgradeBanner workflowName="Financial Reports" />

      {/* Dashboard Status */}
      {metrics.reportsGenerated > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-0.5">
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Live Dashboard</h3>
              <p className="text-green-800 text-sm">
                🎉 Showing real-time Generate Monthly Financial Reports metrics from your workflow executions
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
            Request admin to start, stop, or modify your Generate Monthly Financial Reports workflow
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Reports Generated"
          value={metrics.reportsGenerated}
          icon={FileText}
          change="+3"
          changeType="positive"
        />
        <StatCard
          title="Data Accuracy"
          value={`${metrics.dataAccuracy}%`}
          icon={BarChart3}
          change="+2.1%"
          changeType="positive"
        />
        <StatCard
          title="Avg Processing Time"
          value={`${metrics.processingTime.toFixed(1)}m`}
          icon={Clock}
          change="-1.5m"
          changeType="positive"
        />
        <StatCard
          title="Error Rate"
          value={`${metrics.errorRate.toFixed(1)}%`}
          icon={AlertTriangle}
          change="-0.5%"
          changeType="positive"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Budget Variance Analysis"
          value={metrics.budgetVarianceAnalysis}
          icon={TrendingUp}
        />
        <StatCard
          title="Cost Center Reports"
          value={metrics.costCenterReports}
          icon={PieChart}
        />
        <StatCard
          title="YTD Analysis"
          value={metrics.ytdAnalysis}
          icon={Calendar}
        />
      </div>

      {/* Financial Reports Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Financial Reports Activity Summary</span>
          </CardTitle>
          <CardDescription>Key metrics from your automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{metrics.reportsGenerated}</div>
              <div className="text-sm text-gray-600">Reports Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.processingTime.toFixed(1)}m</div>
              <div className="text-sm text-gray-600">Avg Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{metrics.monthlyComparisons}</div>
              <div className="text-sm text-gray-600">Monthly Comparisons</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Report Generation Pipeline</CardTitle>
            <CardDescription>
              Distribution of reports by generation status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPipelineData().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                    <Progress
                      value={(item.count / Math.max(metrics.reportsGenerated, 1)) * 100}
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Report Types</CardTitle>
            <CardDescription>
              Distribution by report type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">Budget Variance</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics.budgetVarianceAnalysis}</span>
                  <span className="text-xs text-muted-foreground">
                    {metrics.reportsGenerated > 0 ? ((metrics.budgetVarianceAnalysis / metrics.reportsGenerated) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">Cost Center</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics.costCenterReports}</span>
                  <span className="text-xs text-muted-foreground">
                    {metrics.reportsGenerated > 0 ? ((metrics.costCenterReports / metrics.reportsGenerated) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">YTD Analysis</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics.ytdAnalysis}</span>
                  <span className="text-xs text-muted-foreground">
                    {metrics.reportsGenerated > 0 ? ((metrics.ytdAnalysis / metrics.reportsGenerated) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">Monthly Comparisons</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics.monthlyComparisons}</span>
                  <span className="text-xs text-muted-foreground">
                    {metrics.reportsGenerated > 0 ? ((metrics.monthlyComparisons / metrics.reportsGenerated) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Report Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Data Accuracy</span>
                  <span>{metrics.dataAccuracy}%</span>
                </div>
                <Progress value={metrics.dataAccuracy} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Error Rate</span>
                  <span>{metrics.errorRate.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.errorRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Processing Time</span>
                  <span>{metrics.processingTime.toFixed(1)}m</span>
                </div>
                <Progress value={Math.min((metrics.processingTime / 30) * 100, 100)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Financial Reports Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Budget Variance Analysis</span>
                <span className="text-sm font-medium">{metrics.budgetVarianceAnalysis}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cost Center Reports</span>
                <span className="text-sm font-medium">{metrics.costCenterReports}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">YTD Analysis</span>
                <span className="text-sm font-medium">{metrics.ytdAnalysis}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Monthly Comparisons</span>
                <span className="text-sm font-medium">{metrics.monthlyComparisons}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Generation Controls</CardTitle>
          <CardDescription>
            Manage your financial report automation system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleAutomationControl('start')}
              className="h-auto p-4 flex flex-col items-center"
            >
              <Play className="w-6 h-6 mb-2" />
              <span>Start Generation</span>
            </Button>
            <Button
              onClick={() => handleAutomationControl('update')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center"
            >
              <Settings className="w-6 h-6 mb-2" />
              <span>Update Templates</span>
            </Button>
            <Button
              onClick={() => handleAutomationControl('validate')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center"
            >
              <Zap className="w-6 h-6 mb-2" />
              <span>Validate Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>
          Monitor financial report automation system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Data Sources</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Bot className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Report Engine</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Template Library</p>
                <p className="text-xs text-muted-foreground">Synced</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <PieChart className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Analytics Engine</p>
                <p className="text-xs text-muted-foreground">Healthy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportsDashboard;
