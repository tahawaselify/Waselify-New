import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Settings, Bell, Search, Plus, Play, Pause, CheckCircle, Clock, AlertCircle, Target, MessageSquare, FileText, Mail, Brain, User, ChevronDown, BarChart3, Store } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import NotificationPanel from '@/components/NotificationPanel';
import SettingsPanel from '@/components/SettingsPanel';
import { useAuth } from '@/contexts/AuthProvider';
import RequestAccessForm from '@/components/RequestAccessForm';
import WorkflowDetailsModal from '@/components/WorkflowDetailsModal';
import Navbar from '@/components/Navbar';
import ConnectWorkflowCredentialsModal from '@/components/ConnectWorkflowCredentialsModal';

// Mapping function to convert workflow names to dashboard routes
const getWorkflowDashboardRoute = (workflowName: string): string | null => {
  const routeMap: { [key: string]: string } = {
    'Automated Lead Generation': '/automated-lead-generation',
    'Client Onboarding Automation': '/client-onboarding',
    'Automated HR Service System': '/hr-service',
    'Handling Job Application Submissions with AI': '/job-application',
    'Automated Customer Support': '/customer-support-automation',
    'Gmail AI Auto-Responder': '/gmail-auto-responder',
    'AI-Powered Social Media Content Generator & Publisher': '/social-media-content',
    'AI Chatbot for Odoo Sales': '/odoo-sales',
    'Generate Monthly Financial Reports': '/financial-reports',
    'Smart Invoice Collection System': '/invoice-collection',
    'Gmail Email Labelling': '/gmail-email-labelling',
    'Automatic Email Labelling': '/gmail-email-labelling',
    'Local AI Chatbot for Documents (Powered by RAG)': '/local-rag',
    'AI Website Chatbot': '/website-chatbot',
    'Automated WhatsApp Chat Assistant': '/whatsapp-chatbot',
    'Talk to Your Database with AI': '/database-chat',
    'Email Summary Agent': '/email-summary-agent',
    'AI Chatbot for Company Documents': '/rag-chatbot',
    'Whatsapp Product Catalog Bot': '/whatsapp-product-catalog',
    'Gmail Outreach with Auto Follow-Up': '/gmail-campaign',
    'Generate Leads With Google Maps': '/lead-generation',
    'WhatsApp Sales Automation': '/whatsapp-sales',
    'WhatsApp Dietitian Assistant': '/whatsapp-dietitian',
    'WhatsApp Responder': '/whatsapp-responder',
    'Local Chatbot': '/local-chatbot'
  };
  
  return routeMap[workflowName] || null;
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState([]);
  const [userApprovedWorkflows, setUserApprovedWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showWorkflowDetails, setShowWorkflowDetails] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectWorkflow, setConnectWorkflow] = useState<{ name: string; provider: 'gmail' | 'whatsapp' | null } | null>(null);

  console.log('Dashboard: Component loaded, user:', user?.email);

  useEffect(() => {
    loadUserWorkflows();
  }, []);

  const loadUserWorkflows = async () => {
    try {
      setLoading(true);
      
      // First, get user's approved workflows
      const { data: userSubscriptions, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('approved_workflows')
        .filter('user_id', 'eq', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Get the most recent subscription (first in the array)
      const userSubscription = userSubscriptions?.[0];

      if (subscriptionError) {
        console.error('Dashboard: Error loading user subscription:', subscriptionError);
        console.error('Dashboard: Full error details:', {
          code: subscriptionError.code,
          message: subscriptionError.message,
          details: subscriptionError.details,
          hint: subscriptionError.hint
        });
        toast({
          title: t('common.warning'),
          description: t('dashboard.toasts.loadPermissionsDesc'),
          variant: "destructive",
        });
        setUserApprovedWorkflows([]);
      } else {
        console.log('Dashboard: Successfully loaded user subscription:', userSubscription);
        setUserApprovedWorkflows(userSubscription?.approved_workflows || []);
      }

      // Then, load all active workflows and filter by approved ones
      const { data: allWorkflows, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Dashboard: All workflow templates:', allWorkflows);

      if (error) {
        console.error('Dashboard: Error loading workflow templates:', error);
        console.error('Dashboard: Full workflow templates error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      // Filter workflows based on approved workflow names
      const approvedWorkflowNames = userSubscription?.approved_workflows || [];
      console.log('Dashboard: User subscription data:', userSubscription);
      console.log('Dashboard: Approved workflow names:', approvedWorkflowNames);
      console.log('Dashboard: All available workflows:', allWorkflows);
      
      // Support both name and slug formats in approved_workflows
      const approvedSet = new Set((approvedWorkflowNames || []).map((w: any) => String(w).toLowerCase()));
      const userWorkflows = allWorkflows?.filter((workflow: any) => {
        const name = String(workflow.name || '').toLowerCase();
        const slug = name.replace(/\s+/g, '-');
        const isApproved = approvedSet.has(name) || approvedSet.has(slug);
        console.log(`Dashboard: Workflow: "${workflow.name}", NameApproved: ${approvedSet.has(name)}, SlugApproved: ${approvedSet.has(slug)}, Approved: ${isApproved}`);
        return isApproved;
      }) || [];

      setWorkflows(userWorkflows);
      console.log('Loaded user workflows:', userWorkflows);

      // Check if Email Summary Agent is approved and if Gmail token is missing
      const emailSummaryApproved = (approvedWorkflowNames || []).some((w: any) => {
        const x = String(w).toLowerCase();
        return x === 'email summary agent' || x === 'email-summary-agent';
      });
      if (emailSummaryApproved) {
        const { data: token } = await supabase
          .from('user_oauth_tokens')
          .select('id')
          .filter('user_id', 'eq', user.id)
          .eq('workflow_id', 'email-summary-agent')
          .eq('provider', 'gmail')
          .maybeSingle();
        if (!token) {
          setConnectWorkflow({ name: 'Email Summary Agent', provider: 'gmail' });
          setShowConnectModal(true);
        }
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: t('common.error'),
        description: t('dashboard.toasts.loadFailedDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!connectWorkflow) return;
    const state = encodeURIComponent(JSON.stringify({ provider: connectWorkflow.provider, workflowId: 'email-summary-agent', userId: user.id }));
    // Redirect to backend OAuth start
    window.location.href = `/api/oauth/google/start?state=${state}`;
  };

  const handleRequestAccess = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowRequestForm(true);
  };

  // Navigate to the real workflow dashboard or show sample modal as fallback
  const handleViewDetails = (workflow) => {
    const dashboardRoute = getWorkflowDashboardRoute(workflow.name);
    
    if (dashboardRoute) {
      // Navigate to the real dashboard with live data
      window.location.href = dashboardRoute;
    } else {
      // Fallback to sample modal for unknown workflows
      setSelectedWorkflow(workflow);
      setShowWorkflowDetails(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.workflows.title')}</h1>
              <p className="mt-2 text-gray-600">
                {t('dashboard.managePurchased', { count: workflows.length })}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <Link to="/marketplace">
                <Button className="bg-waselify-600 hover:bg-waselify-700 w-full sm:w-auto">
                  <Store className="h-4 w-4 mr-2" />
                  {t('dashboard.browseAll')}
                </Button>
              </Link>

              <Link to="/marketplace">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dashboard.quickActions.requestNew')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Workflows Section */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-waselify-500"></div>
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Store className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('dashboard.workflows.noWorkflows')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('dashboard.workflows.noWorkflowsPurchasedDesc')}
            </p>
            <div className="mt-6">
              <Link to="/marketplace">
                <Button className="bg-waselify-600 hover:bg-waselify-700">
                  <Store className="h-4 w-4 mr-2" />
                  {t('dashboard.workflows.browseMarketplace')}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {t('common.active')}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{workflow.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>{t('dashboard.lastRun', { when: workflow.last_run || t('common.never') })}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {getWorkflowDashboardRoute(workflow.name) && (
                      <Link to={getWorkflowDashboardRoute(workflow.name)} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center justify-center space-x-1"
                        >
                          <BarChart3 className="h-3 w-3" />
                          <span>{t('common.openDashboard')}</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)}
          onNotificationUpdate={setUnreadNotificationsCount}
        />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      )}

      {/* Request Access Form */}
      {showRequestForm && (
        <RequestAccessForm
          isOpen={showRequestForm}
          workflow={selectedWorkflow}
          onClose={() => setShowRequestForm(false)}
        />
      )}

      {/* Workflow Details Modal */}
      {showWorkflowDetails && selectedWorkflow && (
        <WorkflowDetailsModal
          isOpen={showWorkflowDetails}
          workflow={selectedWorkflow}
          onClose={() => setShowWorkflowDetails(false)}
        />
      )}

      {/* Connect Credentials Modal */}
      {showConnectModal && connectWorkflow && (
        <ConnectWorkflowCredentialsModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          workflowName={connectWorkflow.name}
          providerLabel={connectWorkflow.provider === 'gmail' ? 'Google' : 'Provider'}
          onConnect={handleConnect}
        />
      )}
    </div>
  );
};

export default Dashboard; 
