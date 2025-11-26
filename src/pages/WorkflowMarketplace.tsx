import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CheckCircle, Clock, DollarSign, Zap, ExternalLink, Star, Eye, Send, BarChart3, Store, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencySync } from '@/lib/currency';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import RequestAccessForm from '@/components/RequestAccessForm';
import WorkflowDetailsModal from '@/components/WorkflowDetailsModal';
import CustomWorkflowRequestForm from '@/components/CustomWorkflowRequestForm';
import { useAuth } from '@/contexts/AuthProvider';
import Navbar from '@/components/Navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

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
    'WhatsApp Sales Automation': '/whatsapp-sales',
    'WhatsApp Responder': '/whatsapp-responder',
    'WhatsApp Dietitian Assistant': '/whatsapp-dietitian',
    'Local Chatbot': '/local-chatbot',
    'Gmail Outreach with Auto Follow-Up': '/gmail-campaign',
    'Generate Leads With Google Maps': '/lead-generation'
  };

  return routeMap[workflowName] || null;
};

// Mapping function to convert workflow names to sample dashboard routes
const getSampleDashboardRoute = (workflowName: string): string | null => {
  const sampleRouteMap: { [key: string]: string } = {
    'Generate Leads With Google Maps': '/sample-lead-generation',
    'Automated WhatsApp Chat Assistant': '/sample-whatsapp-chatbot',
    'Gmail Outreach with Auto Follow-Up': '/sample-gmail-campaign',
    'Automated Lead Generation': '/sample-automated-lead-generation',
    'Client Onboarding Automation': '/sample-client-onboarding',
    'Automated HR Service System': '/sample-hr-service',
    'Handling Job Application Submissions with AI': '/sample-job-application',
    'Automated Customer Support': '/sample-customer-support-automation',
    'Gmail AI Auto-Responder': '/sample-gmail-auto-responder',
    'AI-Powered Social Media Content Generator & Publisher': '/sample-social-media-content',
    'AI Chatbot for Odoo Sales': '/sample-odoo-sales',
    'Generate Monthly Financial Reports': '/sample-financial-reports',
    'Smart Invoice Collection System': '/sample-invoice-collection',
    'Gmail Email Labelling': '/sample-gmail-email-labelling',
    'Local AI Chatbot for Documents (Powered by RAG)': '/sample-local-rag',
    'AI Website Chatbot': '/sample-website-chatbot',
    'Talk to Your Database with AI': '/sample-database-chat',
    'Email Summary Agent': '/sample-email-summary-agent',
    'AI Chatbot for Company Documents': '/sample-rag-chatbot',
    'Whatsapp Product Catalog Bot': '/sample-whatsapp-product-catalog',
    'WhatsApp Sales Automation': '/sample-whatsapp-sales',
    'WhatsApp Responder': '/sample-whatsapp-responder',
    'WhatsApp Dietitian Assistant': '/sample-whatsapp-dietitian',
    'Local Chatbot': '/sample-local-chatbot',
    'Automatic Email Labelling': '/sample-gmail-email-labelling'
  };

  return sampleRouteMap[workflowName] || null;
};

// Business Automation Agents that should show the AI Agents Platform notice
const isBusinessAutomationAgent = (name: string): boolean => {
  const agents = new Set<string>([
    'Automated WhatsApp Chat Assistant',
    'AI Website Chatbot',
    'AI Chatbot for Company Documents',
    'AI Chatbot for Odoo Sales',
    'Local AI Chatbot for Documents (Powered by RAG)',
    'Whatsapp Product Catalog Bot',
    'WhatsApp Sales Automation',
    'WhatsApp Responder',
    'WhatsApp Dietitian Assistant',
    'Local Chatbot',
  ]);
  return agents.has(name);
};

// Helper to create i18n keys from dynamic names
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Normalize various complexity labels to i18n keys
const normalizeComplexityKey = (level?: string) => {
  const l = (level || 'medium').toLowerCase();
  if (l === 'low' || l === 'easy') return 'easy';
  if (l === 'high' || l === 'hard') return 'hard';
  return 'medium';
};


// Interface for workflow templates
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  // Optional localized fields (if present in Supabase)
  name_ar?: string;
  description_ar?: string;
  category_ar?: string;
  is_active: boolean;
  created_at: string;
  // Optional fields for backward compatibility
  json_file_path?: string | null;
  n8n_link?: string;
  estimated_setup_cost?: number;
  estimated_monthly_cost?: number;
  complexity_level?: string;
}

const WorkflowMarketplace = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const currentCurrency = useCurrency();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<WorkflowTemplate[]>([]);
  const [userApprovedWorkflows, setUserApprovedWorkflows] = useState<string[]>([]);

  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isCustomRequestModalOpen, setIsCustomRequestModalOpen] = useState(false);
  const [workflowForRequest, setWorkflowForRequest] = useState<WorkflowTemplate | null>(null);
  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);

  // Fetch workflows and user's approved workflows from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('WorkflowMarketplace: Fetching workflows and user data...');
        setIsLoading(true);

        // Fetch user's approved workflows if logged in
        if (user) {
          const { data: userSubscription, error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .select('approved_workflows')
            .filter('user_id', 'eq', user.id)
            .maybeSingle();

          if (!subscriptionError && userSubscription) {
            setUserApprovedWorkflows(userSubscription.approved_workflows || []);
            console.log('User approved workflows:', userSubscription.approved_workflows);
          }
        }

        // Try to fetch workflows, but handle missing table gracefully
        const { data: workflows, error } = await supabase
          .from('workflow_templates')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (workflows) {
          console.log('Available workflow names:', workflows.map(w => w.name));
          console.log('Sample route mappings:');
          workflows.forEach(w => {
            const sampleRoute = getSampleDashboardRoute(w.name);
            console.log(`  "${w.name}" -> ${sampleRoute || 'NO ROUTE FOUND'}`);
            // Special debug for Automatic Email Labelling
            if (w.name.includes('Email Labelling') || w.name.includes('email labelling')) {
              console.log('=== EMAIL LABELLING DEBUG ===');
              console.log('Found workflow:', w.name);
              console.log('Sample route:', sampleRoute);
              console.log('User approved workflows:', userApprovedWorkflows);
              const slug = w.name.toLowerCase().replace(/\s+/g, '-');
              console.log('Generated slug:', slug);
              console.log('Has access:', userApprovedWorkflows.includes(slug));
            }
          });
        }

        if (error) {
          console.log('WorkflowMarketplace: Error fetching workflows:', error);
          if (error.code === '42P01') { // Table doesn't exist
            console.log('WorkflowMarketplace: Table does not exist, using empty array');
            setWorkflows([]);
          } else {
            console.log('WorkflowMarketplace: Other error, using empty array');
            setWorkflows([]);
          }
        } else {
          console.log('WorkflowMarketplace: Found workflows:', workflows);
          setWorkflows(workflows || []);
          setFilteredWorkflows(workflows || []);
        }
      } catch (error) {
        console.error('WorkflowMarketplace: Error in fetchData:', error);
        setWorkflows([]);
        setFilteredWorkflows([]);
      } finally {
        console.log('WorkflowMarketplace: Setting loading to false');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, user]);

  // Preserve and restore scroll position when navigating away and back to Marketplace
  const savedScrollRef = useRef<number | null>(null);
  const [scrollRestored, setScrollRestored] = useState(false);

  // Read preserved position on mount and save on unmount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('marketplaceScrollY');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!Number.isNaN(val)) savedScrollRef.current = val;
      }
    } catch {}

    return () => {
      try {
        sessionStorage.setItem('marketplaceScrollY', String(window.scrollY));
      } catch {}
    };
  }, []);

  // After loading completes, restore scroll if available
  useEffect(() => {
    if (!isLoading && !scrollRestored && savedScrollRef.current != null) {
      window.scrollTo(0, savedScrollRef.current);
      setScrollRestored(true);
      try { sessionStorage.removeItem('marketplaceScrollY'); } catch {}
    }
  }, [isLoading, scrollRestored]);

  // Filter workflows based on search and category (includes i18n fallbacks)
  useEffect(() => {
    const filtered = workflows.filter(workflow => {
      const slug = slugify(workflow.name);
      const trName = t(`workflows.${slug}.name`, { defaultValue: workflow.name });
      const trDesc = t(`workflows.${slug}.description`, { defaultValue: workflow.description });
      const haystack = [
        workflow.name,
        workflow.description,
        workflow.name_ar,
        workflow.description_ar,
        trName,
        trDesc
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || workflow.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredWorkflows(filtered);
  }, [workflows, searchTerm, selectedCategory, t]);

  const categories = ['all', ...Array.from(new Set(workflows.map(w => w.category).filter(Boolean)))];

  // Check if user has access to a workflow
  const hasWorkflowAccess = (workflow: WorkflowTemplate): boolean => {
    if (!user) return false;
    const workflowSlug = workflow.name.toLowerCase().replace(/\s+/g, '-');
    return userApprovedWorkflows.includes(workflowSlug);
  };

  const handleViewDetails = (workflow: WorkflowTemplate) => {
    setSelectedWorkflow(workflow);
    setIsDetailsModalOpen(true);
  };

  const handleRequestAccess = (workflow: WorkflowTemplate) => {
    setWorkflowForRequest(workflow);
    setIsRequestModalOpen(true);
  };

  const handleAddToCart = (workflow: WorkflowTemplate) => {
    if (cart.find(item => item.id === workflow.id)) {
      toast({
        title: "Already in cart",
        description: "This workflow is already in your cart.",
        variant: "default",
      });
      return;
    }
    setCart([...cart, workflow]);
    toast({
      title: "Added to cart",
      description: `${workflow.name} has been added to your cart.`,
      variant: "default",
    });
  };

  const handleRemoveFromCart = (workflowId: string) => {
    setCart(cart.filter(item => item.id !== workflowId));
  };

  const handlePurchase = () => {
      // Helper function to check if workflow has numeric pricing
  const hasNumericPricing = (workflow: WorkflowTemplate) => {
    return workflow.complexity_level !== 'high' && workflow.complexity_level !== 'High';
  };

  // Calculate totals only for workflows with numeric pricing
  const totalSetupCost = cart
    .filter(hasNumericPricing)
    .reduce((sum, w) => sum + (w.estimated_setup_cost || 0), 0);
  const totalMonthlyCost = cart
    .filter(hasNumericPricing)
    .reduce((sum, w) => sum + (w.estimated_monthly_cost || 0), 0);

  // Check if any workflows in cart have "Contact for cost"
  const hasContactForCost = cart.some(w => !hasNumericPricing(w));

    toast({
      title: "Purchase initiated",
      description: `Total setup cost: ${totalSetupCost} QAR, Monthly: ${totalMonthlyCost} QAR`,
      variant: "default",
    });
  };

  const getComplexityColor = (level: string) => {
    const key = normalizeComplexityKey(level);
    switch (key) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Marketing': 'bg-blue-100 text-blue-800',
      'Sales': 'bg-green-100 text-green-800',
      'Support': 'bg-purple-100 text-purple-800',
      'Data': 'bg-orange-100 text-orange-800',
      'HR': 'bg-pink-100 text-pink-800',
      'Finance': 'bg-indigo-100 text-indigo-800',
      'Operations': 'bg-teal-100 text-teal-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-waselify-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-waselify-600 hover:text-waselify-700 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            {t('marketplace.backToDashboard')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('marketplace.title')}
          </h1>
          <p className="text-gray-600">
            {t('marketplace.subtitle')}
          </p>
        </div>

        {/* Filters and Custom Request Button */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('marketplace.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-waselify-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all'
                      ? t('marketplace.allCategories')
                      : t(`categories.${slugify(category)}`, { defaultValue: i18n.language === 'ar' ? (workflows.find(w => w.category === category)?.category_ar || category) : category })}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => setIsCustomRequestModalOpen(true)}
              className="bg-gradient-to-r from-waselify-500 to-waselify-600 hover:from-waselify-600 hover:to-waselify-700 text-white px-6"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {t('marketplace.requestCustomWorkflow')}
            </Button>
          </div>
        </div>

        {/* Custom Workflow Request Banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">{t('marketplace.banner.needCustomTitle')}</h3>
                <p className="text-blue-800 text-sm mb-3">
                  {t('marketplace.banner.needCustomDesc')}
                </p>
                <div className="flex items-center gap-4 text-xs text-blue-700">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {t('marketplace.banner.featureCustomDev')}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {t('marketplace.banner.featureTailored')}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {t('marketplace.banner.featureExpertSupport')}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsCustomRequestModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {t('marketplace.banner.cta')}
            </Button>
          </div>
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-3">{t('marketplace.cart.selectedWorkflows')} ({cart.length})</h3>
            <div className="space-y-2">
              {cart.map(workflow => (
                <div key={workflow.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{t(`workflows.${slugify(workflow.name)}.name`, { defaultValue: i18n.language === 'ar' ? (workflow.name_ar || workflow.name) : workflow.name })}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 min-w-[120px] text-right">
                      {`${formatCurrencySync(workflow.estimated_setup_cost || 0, undefined, workflow.complexity_level)} ${t('marketplace.setupShort')}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromCart(workflow.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      {t('marketplace.cart.remove')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between items-center text-sm py-1">
                <span>{t('marketplace.cart.totalSetupCost')}</span>
                <span className="font-semibold text-right min-w-[80px]">
                  {hasContactForCost ? t('marketplace.contactForCost') : formatCurrencySync(totalSetupCost)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span>{t('marketplace.cart.totalMonthlyCost')}</span>
                <span className="font-semibold text-right min-w-[80px]">
                  {hasContactForCost ? t('marketplace.contactForCost') : formatCurrencySync(totalMonthlyCost)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Workflows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={getCategoryColor(workflow.category)}>
                      {t(`categories.${slugify(workflow.category)}`, { defaultValue: i18n.language === 'ar' ? (workflow.category_ar || workflow.category) : workflow.category })}
                    </Badge>
                    {hasWorkflowAccess(workflow) && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle size={12} className="mr-1" />
                        {t('marketplace.owned')}
                      </Badge>
                    )}
                  </div>
                  <Badge className={`${getComplexityColor(workflow.complexity_level || 'medium')} flex-shrink-0`}>
                    {i18n.language === 'ar' ? t(`marketplace.complexity.${normalizeComplexityKey(workflow.complexity_level)}`) : (workflow.complexity_level || 'Medium')}
                  </Badge>
                </div>
                <CardTitle className="text-lg mb-2">{t(`workflows.${slugify(workflow.name)}.name`, { defaultValue: i18n.language === 'ar' ? (workflow.name_ar || workflow.name) : workflow.name })}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {t(`workflows.${slugify(workflow.name)}.description`, { defaultValue: i18n.language === 'ar' ? (workflow.description_ar || workflow.description) : workflow.description })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 flex-1 flex flex-col justify-end">
                  <div className="flex justify-between items-center text-sm py-2 border-t border-gray-100">
                    <span className="text-gray-600">{t('marketplace.setupCost')}</span>
                    <span className="font-semibold text-right min-w-[80px]">{formatCurrencySync(workflow.estimated_setup_cost || 0, undefined, workflow.complexity_level)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2">
                    <span className="text-gray-600">{t('marketplace.monthlyCost')}</span>
                    <span className="font-semibold text-right min-w-[80px]">{formatCurrencySync(workflow.estimated_monthly_cost || 0, undefined, workflow.complexity_level)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                    {hasWorkflowAccess(workflow) ? (
                      // User has access - show only Dashboard button
                      <>
                        {getWorkflowDashboardRoute(workflow.name) && (
                          <Link to={getWorkflowDashboardRoute(workflow.name)} className="w-full">
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <BarChart3 size={16} className="mr-2" />
                              {t('marketplace.dashboard')}
                            </Button>
                          </Link>
                        )}
                      </>
                    ) : (
                      // User doesn't have access - show Request Access and Sample Dashboard buttons
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleRequestAccess(workflow)}
                          className="flex-1 bg-waselify-500 hover:bg-waselify-600"
                        >
                          <Send size={16} className="mr-2" />
                          {t('marketplace.requestAccess')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            if (isBusinessAutomationAgent(workflow.name)) {
                              setIsAgentDialogOpen(true);
                              return;
                            }
                            console.log('=== SAMPLE DASHBOARD CLICK DEBUG ===');
                            console.log('Workflow name:', workflow.name);
                            const route = getSampleDashboardRoute(workflow.name);
                            console.log('Sample route found:', route);
                            console.log('Current URL:', window.location.href);
                            console.log('Navigate function:', typeof navigate);

                            if (route) {
                              console.log('About to navigate to:', route);
                              try {
                                navigate(route);
                                console.log('Navigation called successfully');
                              } catch (error) {
                                console.error('Navigation error:', error);
                                // Fallback to window.location
                                window.location.href = route;
                              }
                            } else {
                              console.log('No route found, navigating to dashboard');
                              navigate('/dashboard');
                            }
                          }}
                        >
                          <Eye size={16} className="mr-2" />
                          {t('marketplace.sampleDashboard')}
                        </Button>
                      </>
                    )}
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWorkflows.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('marketplace.noResults')}</p>
          </div>
        )}
      </div>

      {/* Workflow Details Modal */}
      <WorkflowDetailsModal
        workflow={selectedWorkflow}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedWorkflow(null);
        }}
      />

      {/* Request Access Modal */}
      <RequestAccessForm
        workflow={workflowForRequest}
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setWorkflowForRequest(null);
        }}
      />

      {/* Custom Workflow Request Modal */}
      <CustomWorkflowRequestForm
        isOpen={isCustomRequestModalOpen}
        onClose={() => setIsCustomRequestModalOpen(false)}
      />

      {/* AI Agents Notice Dialog */}
      <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Agents Platform</DialogTitle>
            <DialogDescription>
              AI Agents use a different platform. After purchase, we will email you your platform link where you can view all call logs, enquiries solved by the agents, and more.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsAgentDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowMarketplace;