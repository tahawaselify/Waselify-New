import React, { useState, useEffect } from 'react'
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
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
  Star,
  FileText,
  Building,
  Phone,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import UpgradeBanner from '@/components/UpgradeBanner';
import Navbar from "@/components/Navbar";
import { SampleHeader, SampleWorkflowControl, StatusBadge } from '@/components/sample/SampleDashboardParts';
import { supabase } from "@/lib/supabaseClient";

interface HRRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  requestType: 'leave_request' | 'attendance' | 'payroll' | 'benefits' | 'policy' | 'general';
  status: 'received' | 'processing' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: Date;
  processedAt?: Date;
  aiConfidence: number;
  department: string;
  description: string;
  assignedTo?: string;
  resolutionTime?: number; // in minutes
}

const SampleHRServiceDashboard: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Sample data for demonstration
  const metrics = {
    hrInquiries: 234,
    automatedResponses: 189,
    policyQueries: 45,
    leaveRequests: 67,
    employeeOnboarding: 12,
    averageResponseTime: 2.3,
    satisfactionScore: 4.7,
    escalationRate: 8.5
  };
  
  const requests: HRRequest[] = [
    {
      id: '1',
      employeeName: 'Sarah Johnson',
      employeeId: 'EMP001',
      requestType: 'leave_request',
      status: 'approved',
      priority: 'medium',
      submittedAt: new Date('2024-01-20T09:30:00'),
      processedAt: new Date('2024-01-20T10:15:00'),
      aiConfidence: 95,
      department: 'Engineering',
      description: 'Request for 3 days vacation next month',
      assignedTo: 'AI Assistant',
      resolutionTime: 45
    },
    {
      id: '2',
      employeeName: 'Michael Chen',
      employeeId: 'EMP002',
      requestType: 'payroll',
      status: 'processing',
      priority: 'high',
      submittedAt: new Date('2024-01-20T11:00:00'),
      aiConfidence: 87,
      department: 'Sales',
      description: 'Inquiry about missing overtime pay',
      assignedTo: 'HR Specialist'
    },
    {
      id: '3',
      employeeName: 'Emily Rodriguez',
      employeeId: 'EMP003',
      requestType: 'benefits',
      status: 'received',
      priority: 'low',
      submittedAt: new Date('2024-01-20T14:20:00'),
      aiConfidence: 92,
      department: 'Marketing',
      description: 'Questions about health insurance coverage',
      assignedTo: 'AI Assistant'
    },
    {
      id: '4',
      employeeName: 'David Thompson',
      employeeId: 'EMP004',
      requestType: 'policy',
      status: 'escalated',
      priority: 'urgent',
      submittedAt: new Date('2024-01-20T08:45:00'),
      aiConfidence: 78,
      department: 'Operations',
      description: 'Dispute regarding remote work policy',
      assignedTo: 'HR Manager'
    }
  ];

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const requestStatuses = {
    received: { label: 'Received', color: 'bg-blue-500' },
    processing: { label: 'Processing', color: 'bg-yellow-500' },
    approved: { label: 'Approved', color: 'bg-green-500' },
    rejected: { label: 'Rejected', color: 'bg-red-500' },
    escalated: { label: 'Escalated', color: 'bg-orange-500' }
  };

  const statusColors = {
    received: 'text-blue-600',
    processing: 'text-yellow-600',
    approved: 'text-green-600',
    rejected: 'text-red-600',
    escalated: 'text-orange-600'
  };

  const priorityColors = {
    low: 'text-blue-600',
    medium: 'text-orange-600',
    high: 'text-red-600',
    urgent: 'text-purple-600'
  };

  const requestTypeColors = {
    leave_request: 'text-blue-600',
    attendance: 'text-green-600',
    payroll: 'text-purple-600',
    benefits: 'text-orange-600',
    policy: 'text-red-600',
    general: 'text-gray-600'
  };

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
        description: "HR Service automation has been paused",
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
              <div className="flex items-center mt-1">
                <ArrowUpRight className={`h-4 w-4 ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm ml-1 ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
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

  const getPendingRequests = () => requests.filter(req => req.status === 'received').length;
  const getProcessingRequests = () => requests.filter(req => req.status === 'processing').length;
  const getEscalatedRequests = () => requests.filter(req => req.status === 'escalated').length;

  const getPipelineData = () => [
    { name: 'Received', value: getPendingRequests(), color: 'bg-blue-500' },
    { name: 'Processing', value: getProcessingRequests(), color: 'bg-yellow-500' },
    { name: 'Approved', value: requests.filter(req => req.status === 'approved').length, color: 'bg-green-500' },
    { name: 'Escalated', value: getEscalatedRequests(), color: 'bg-orange-500' }
  ];

  const getRequestTypeDistribution = () => [
    { name: 'Leave Requests', value: requests.filter(req => req.requestType === 'leave_request').length },
    { name: 'Payroll', value: requests.filter(req => req.requestType === 'payroll').length },
    { name: 'Benefits', value: requests.filter(req => req.requestType === 'benefits').length },
    { name: 'Policy', value: requests.filter(req => req.requestType === 'policy').length },
    { name: 'General', value: requests.filter(req => req.requestType === 'general').length }
  ];

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start HR Service with AI workflow',
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
        details: 'Request to modify HR Service with AI workflow settings',
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

  const getDepartmentDistribution = () => [
    { name: 'Engineering', value: requests.filter(req => req.department === 'Engineering').length },
    { name: 'Sales', value: requests.filter(req => req.department === 'Sales').length },
    { name: 'Marketing', value: requests.filter(req => req.department === 'Marketing').length },
    { name: 'Operations', value: requests.filter(req => req.department === 'Operations').length }
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
                This is a sample dashboard showing how your HR Service workflow dashboard will look when you purchase this workflow. 
                All data shown is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <SampleHeader
            title="HR Service Automation"
            subtitle="AI-powered HR service management and automation"
            rightSide={
              <>
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
                      <span>Pause Automation</span>
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
              </>
            }
          />



          {/* Workflow Control - standardized */}
          <SampleWorkflowControl
            workflowTitle="HR Service with AI"
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
            <StatCard
              title="HR Inquiries"
              value={metrics.hrInquiries}
              icon={MessageSquare}
              change="+12.5%"
              changeType="positive"
            />
            <StatCard
              title="Automated Responses"
              value={metrics.automatedResponses}
              icon={Bot}
              change="+8.3%"
              changeType="positive"
            />
            <StatCard
              title="Avg Response Time"
              value={`${metrics.averageResponseTime}h`}
              icon={Clock}
              change="-15.2%"
              changeType="positive"
            />
            <StatCard
              title="Satisfaction Score"
              value={`${metrics.satisfactionScore}/5`}
              icon={Star}
              change="+0.3"
              changeType="positive"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Requests */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Recent HR Requests</span>
                  </CardTitle>
                  <CardDescription>Latest employee requests and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{request.employeeName}</h4>
                            <p className="text-sm text-gray-600">{request.department} • {request.employeeId}</p>
                            <p className="text-sm text-gray-500 mt-1">{request.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={`${requestStatuses[request.status].color} text-white`}>
                                {requestStatuses[request.status].label}
                              </Badge>
                              <Badge variant="outline" className={priorityColors[request.priority]}>
                                {request.priority}
                              </Badge>
                              <Badge variant="outline" className={requestTypeColors[request.requestType]}>
                                {request.requestType.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {format(request.submittedAt, 'MMM dd, HH:mm')}
                          </p>
                          <p className="text-sm text-gray-500">
                            AI Confidence: {request.aiConfidence}%
                          </p>
                          {request.resolutionTime && (
                            <p className="text-sm text-green-600">
                              Resolved in {request.resolutionTime}min
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health & Analytics */}
            <div className="space-y-6">
              {/* Request Pipeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Request Pipeline</span>
                  </CardTitle>
                  <CardDescription>Current request status distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getPipelineData().map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Request Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Request Types</span>
                  </CardTitle>
                  <CardDescription>Distribution by request category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getRequestTypeDistribution().map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Department Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>By Department</span>
                  </CardTitle>
                  <CardDescription>Requests by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getDepartmentDistribution().map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
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

export default SampleHRServiceDashboard; 