import React, { useState, useEffect } from 'react'
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  FileText, 
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
  Briefcase,
  GraduationCap,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import UpgradeBanner from '@/components/UpgradeBanner';
import Navbar from "@/components/Navbar";
import { SampleHeader, SampleWorkflowControl, StatusBadge } from '@/components/sample/SampleDashboardParts';
import { supabase } from "@/lib/supabaseClient";

interface JobApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  position: string;
  department: string;
  status: 'received' | 'screening' | 'shortlisted' | 'interview' | 'hired' | 'rejected';
  aiScore: number;
  experience: number; // years
  skills: string[];
  receivedAt: Date;
  processedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'linkedin' | 'indeed' | 'referral' | 'other';
  resumeUrl?: string;
  coverLetter?: string;
}

const SampleJobApplicationDashboard: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Sample data for demonstration
  const metrics = {
    applicationsReceived: 156,
    aiScreeningCompleted: 142,
    qualifiedCandidates: 89,
    rejectedApplications: 67,
    averageProcessingTime: 1.8,
    screeningAccuracy: 94.2,
    candidateExperience: 4.6,
    hiringFunnelConversion: 12.8
  };
  
  const applications: JobApplication[] = [
    {
      id: '1',
      applicantName: 'Alex Johnson',
      applicantEmail: 'alex.johnson@email.com',
      position: 'Senior Software Engineer',
      department: 'Engineering',
      status: 'shortlisted',
      aiScore: 92,
      experience: 5,
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      receivedAt: new Date('2024-01-20T10:30:00'),
      processedAt: new Date('2024-01-20T11:15:00'),
      priority: 'high',
      source: 'linkedin'
    },
    {
      id: '2',
      applicantName: 'Sarah Chen',
      applicantEmail: 'sarah.chen@email.com',
      position: 'Product Manager',
      department: 'Product',
      status: 'screening',
      aiScore: 87,
      experience: 4,
      skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
      receivedAt: new Date('2024-01-20T14:20:00'),
      priority: 'medium',
      source: 'website'
    },
    {
      id: '3',
      applicantName: 'Michael Rodriguez',
      applicantEmail: 'michael.rodriguez@email.com',
      position: 'UX Designer',
      department: 'Design',
      status: 'interview',
      aiScore: 95,
      experience: 6,
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      receivedAt: new Date('2024-01-19T09:15:00'),
      processedAt: new Date('2024-01-19T10:00:00'),
      priority: 'high',
      source: 'referral'
    },
    {
      id: '4',
      applicantName: 'Emily Thompson',
      applicantEmail: 'emily.thompson@email.com',
      position: 'Marketing Specialist',
      department: 'Marketing',
      status: 'received',
      aiScore: 78,
      experience: 3,
      skills: ['Digital Marketing', 'SEO', 'Content Creation', 'Analytics'],
      receivedAt: new Date('2024-01-20T16:45:00'),
      priority: 'low',
      source: 'indeed'
    }
  ];

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const applicationStatuses = {
    received: { label: 'Received', color: 'bg-blue-500' },
    screening: { label: 'Screening', color: 'bg-yellow-500' },
    shortlisted: { label: 'Shortlisted', color: 'bg-green-500' },
    interview: { label: 'Interview', color: 'bg-purple-500' },
    hired: { label: 'Hired', color: 'bg-emerald-500' },
    rejected: { label: 'Rejected', color: 'bg-red-500' }
  };

  const statusColors = {
    received: 'text-blue-600',
    screening: 'text-yellow-600',
    shortlisted: 'text-green-600',
    interview: 'text-purple-600',
    hired: 'text-emerald-600',
    rejected: 'text-red-600'
  };

  const priorityColors = {
    low: 'text-blue-600',
    medium: 'text-orange-600',
    high: 'text-red-600'
  };

  const sourceColors = {
    website: 'text-blue-600',
    linkedin: 'text-purple-600',
    indeed: 'text-orange-600',
    referral: 'text-green-600',
    other: 'text-gray-600'
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
        description: "Job Application automation has been paused",
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

  const getPendingApplications = () => applications.filter(app => app.status === 'received').length;
  const getScreeningApplications = () => applications.filter(app => app.status === 'screening').length;

  const getPipelineData = () => [
    { name: 'Received', value: getPendingApplications(), color: 'bg-blue-500' },
    { name: 'Screening', value: getScreeningApplications(), color: 'bg-yellow-500' },
    { name: 'Shortlisted', value: applications.filter(app => app.status === 'shortlisted').length, color: 'bg-green-500' },
    { name: 'Interview', value: applications.filter(app => app.status === 'interview').length, color: 'bg-purple-500' },
    { name: 'Hired', value: applications.filter(app => app.status === 'hired').length, color: 'bg-emerald-500' }
  ];

  const getDepartmentDistribution = () => [
    { name: 'Engineering', value: applications.filter(app => app.department === 'Engineering').length },
    { name: 'Product', value: applications.filter(app => app.department === 'Product').length },
    { name: 'Design', value: applications.filter(app => app.department === 'Design').length },
    { name: 'Marketing', value: applications.filter(app => app.department === 'Marketing').length }
  ];

  const getSourceDistribution = () => [
    { name: 'LinkedIn', value: applications.filter(app => app.source === 'linkedin').length },
    { name: 'Website', value: applications.filter(app => app.source === 'website').length },
    { name: 'Referral', value: applications.filter(app => app.source === 'referral').length },
    { name: 'Indeed', value: applications.filter(app => app.source === 'indeed').length }
  ];

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start Handling Job Application Submissions with AI workflow',
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
        details: 'Request to modify Handling Job Application Submissions with AI workflow settings',
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

  const getTopPositions = () => [
    { name: 'Software Engineer', count: 45, department: 'Engineering' },
    { name: 'Product Manager', count: 23, department: 'Product' },
    { name: 'UX Designer', count: 18, department: 'Design' },
    { name: 'Marketing Specialist', count: 15, department: 'Marketing' }
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
                This is a sample dashboard showing how your Job Application workflow dashboard will look when you purchase this workflow. 
                All data shown is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <SampleHeader
            title="Job Application Automation"
            subtitle="AI-powered job application screening and management"
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
            workflowTitle="Handling Job Application Submissions with AI"
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
              title="Applications Received"
              value={metrics.applicationsReceived}
              icon={FileText}
              change="+15.3%"
              changeType="positive"
            />
            <StatCard
              title="AI Screening Completed"
              value={metrics.aiScreeningCompleted}
              icon={Bot}
              change="+8.7%"
              changeType="positive"
            />
            <StatCard
              title="Screening Accuracy"
              value={`${metrics.screeningAccuracy}%`}
              icon={CheckCircle}
              change="+2.1%"
              changeType="positive"
            />
            <StatCard
              title="Avg Processing Time"
              value={`${metrics.averageProcessingTime}h`}
              icon={Clock}
              change="-12.5%"
              changeType="positive"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Applications */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Recent Applications</span>
                  </CardTitle>
                  <CardDescription>Latest job applications and their AI screening results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{application.applicantName}</h4>
                            <p className="text-sm text-gray-600">{application.position} • {application.department}</p>
                            <p className="text-sm text-gray-500 mt-1">{application.experience} years experience</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={`${applicationStatuses[application.status].color} text-white`}>
                                {applicationStatuses[application.status].label}
                              </Badge>
                              <Badge variant="outline" className={priorityColors[application.priority]}>
                                {application.priority}
                              </Badge>
                              <Badge variant="outline" className={sourceColors[application.source]}>
                                {application.source}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {format(application.receivedAt, 'MMM dd, HH:mm')}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            AI Score: {application.aiScore}%
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            {application.skills.slice(0, 2).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {application.skills.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{application.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics */}
            <div className="space-y-6">
              {/* Application Pipeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Application Pipeline</span>
                  </CardTitle>
                  <CardDescription>Current application status distribution</CardDescription>
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

              {/* Department Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>By Department</span>
                  </CardTitle>
                  <CardDescription>Applications by department</CardDescription>
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

              {/* Top Positions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Top Positions</span>
                  </CardTitle>
                  <CardDescription>Most applied positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getTopPositions().map((item) => (
                      <div key={item.name} className="p-2 border rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm text-gray-600">{item.count}</span>
                        </div>
                        <p className="text-xs text-gray-500">{item.department}</p>
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

export default SampleJobApplicationDashboard; 