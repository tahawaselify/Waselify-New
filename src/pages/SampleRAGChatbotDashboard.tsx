import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  Users,
  Brain,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Database,
  XCircle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import Navbar from '@/components/Navbar';
import UpgradeBanner from '@/components/UpgradeBanner';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

import '@/lib/dashboardI18n';

const SampleRAGChatbotDashboard = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();

  // Sample data for demonstration
  const [stats, setStats] = useState({
    totalConversations: 1247,
    activeUsers: 23,
    responseTime: 2.3,
    satisfactionRate: 94,
    questionsAnswered: 892,
    knowledgeBaseQueries: 567
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      description: "User asked about product pricing and received RAG-enhanced response",
      timestamp: "2 minutes ago"
    },
    {
      description: "Knowledge base updated with new product information",
      timestamp: "5 minutes ago"
    },
    {
      description: "Customer support query resolved using company documentation",
      timestamp: "8 minutes ago"
    },
    {
      description: "Technical question answered with 95% confidence score",
      timestamp: "12 minutes ago"
    },
    {
      description: "New conversation started with lead qualification",
      timestamp: "15 minutes ago"
    }
  ]);

  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    lastCheck: new Date().toISOString(),
    components: [
      { name: 'AI Model', status: 'healthy' },
      { name: 'Knowledge Base', status: 'healthy' },
      { name: 'Vector Database', status: 'healthy' },
      { name: 'Chat Interface', status: 'healthy' }
    ]
  });

  const handleStartAutomation = async () => {
    setIsLoading(true);
    try {
      // Sample automation control logic
      console.log('Sample RAG Chatbot automation started...');
      setIsRunning(true);
    } catch (error) {
      console.error('Error starting automation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseAutomation = async () => {
    setIsLoading(true);
    try {
      // Sample automation control logic
      console.log('Sample RAG Chatbot automation paused...');
      setIsRunning(false);
    } catch (error) {
      console.error('Error pausing automation:', error);
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
        details: 'Request to start RAG Chatbot with AI workflow',
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
        details: 'Request to modify RAG Chatbot with AI workflow settings',
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
      // Sample data refresh logic
      console.log('Sample RAG Chatbot data refreshed...');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
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
                This is a sample dashboard showing how your RAG Chatbot workflow dashboard will look when you purchase this workflow.
                All data shown is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <BackButton to="/dashboard" />
                <div>
                  <h1 className="text-3xl font-bold">RAG Chatbot Dashboard</h1>
                  <p className="text-muted-foreground">
                    AI-powered chatbot with Retrieval-Augmented Generation that provides accurate,
                    context-aware responses using your knowledge base.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
              <Button
                onClick={isRunning ? handlePauseAutomation : handleStartAutomation}
                disabled={isLoading}
                className={isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : isRunning ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? t('buttons.pauseAutomationLabel') : t('buttons.startAutomationLabel')}
              </Button>
              <Button
                variant="outline"
                onClick={handleRefreshData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t('buttons.refresh')}
              </Button>
            </div>
          </div>
          </div>

          {/* Workflow Control Request */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('sections.workflowControl')}</CardTitle>
              <CardDescription>
                Request admin to start, stop, or modify your RAG Chatbot with AI workflow
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
                    <span>{t('buttons.requestStart')}</span>
                  </Button>
                  <Button
                    onClick={() => handleWorkflowRequest('stop')}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
                  >
                    <XCircle className="w-6 h-6 mb-2" />
                    <span>{t('buttons.requestStop')}</span>
                  </Button>
                  <Button
                    onClick={() => handleWorkflowRequest('modify')}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
                  >
                    <Settings className="w-6 h-6 mb-2" />
                    <span>{t('buttons.requestChanges')}</span>
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
                <span>{t('sections.pendingRequests')}</span>
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
                <span>{t('sections.recentProcessedRequests')}</span>
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
                          {request.status === 'approved' ? t('badgeStatus.approved') : t('badgeStatus.rejected')} on {new Date(request.updated_at || request.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                      {request.status === 'approved' ? t('badgeStatus.approved') : t('badgeStatus.rejected')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Automation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                {t('sections.automationStatus')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Badge
                  variant={isRunning ? 'default' : 'secondary'}
                  className={isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                >
                  {isRunning ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Running
                    </>
                  ) : (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      {t('badgeStatus.paused')}
                    </>
                  )}
                </Badge>
                <span className="text-sm text-gray-500">
                  {t('labels.lastUpdated')} {new Date().toLocaleTimeString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('statTitles.totalConversations')}</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalConversations}</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('statTitles.activeUsers')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Currently online
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('statTitles.responseTime')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.responseTime}s</div>
                <p className="text-xs text-muted-foreground">
                  {t('statLabels.avgResponseHint')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('statTitles.satisfactionRate')}</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.satisfactionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  User satisfaction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('statTitles.questionsAnswered')}</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.questionsAnswered}</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('statTitles.knowledgeBaseQueries')}</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.knowledgeBaseQueries}</div>
                <p className="text-xs text-muted-foreground">
                  RAG queries today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Conversation Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation Flow</CardTitle>
              <CardDescription>Current conversation pipeline status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1,567</div>
                  <div className="text-sm text-gray-600">Messages Received</div>
                  <Progress value={100} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">1,234</div>
                  <div className="text-sm text-gray-600">Processed</div>
                  <Progress value={79} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">987</div>
                  <div className="text-sm text-gray-600">RAG Enhanced</div>
                  <Progress value={63} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">876</div>
                  <div className="text-sm text-gray-600">Responses Sent</div>
                  <Progress value={56} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest chatbot interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your RAG chatbot automation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                  <Brain className="h-6 w-6 mb-2" />
                  <span className="text-sm">Knowledge Base</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span className="text-sm">Chat Interface</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">User Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Monitor RAG chatbot system components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemHealth.components.map((component, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{component.name}</span>
                    <Badge variant={component.status === 'healthy' ? 'default' : 'destructive'}>
                      {component.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Banner */}
          <UpgradeBanner workflowName="AI Chatbot for Company Documents" />
        </div>
      </div>
    </div>
  );
};

export default SampleRAGChatbotDashboard;