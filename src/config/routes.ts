// Centralized route configuration
import { lazy } from 'react';

// Lazy load components for better performance
const Index = lazy(() => import('@/pages/Index'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const WorkflowMarketplace = lazy(() => import('@/pages/WorkflowMarketplace'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const WorkflowManager = lazy(() => import('@/pages/WorkflowManager'));
const TestWorkflowExecution = lazy(() => import('@/pages/TestWorkflowExecution'));
const OAuthCallback = lazy(() => import('@/pages/OAuthCallback'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Dashboard pages
const LeadGenerationDashboard = lazy(() => import('@/pages/LeadGenerationDashboard'));
const WhatsAppSalesDashboard = lazy(() => import('@/pages/WhatsAppSalesDashboard'));
const InvoiceCollectionDashboard = lazy(() => import('@/pages/InvoiceCollectionDashboard'));
const GmailCampaignDashboard = lazy(() => import('@/pages/GmailCampaignDashboard'));
const RAGChatbotDashboard = lazy(() => import('@/pages/RAGChatbotDashboard'));
const OdooSalesDashboard = lazy(() => import('@/pages/OdooSalesDashboard'));
const LocalChatbotDashboard = lazy(() => import('@/pages/LocalChatbotDashboard'));
const WhatsAppProductCatalogDashboard = lazy(() => import('@/pages/WhatsAppProductCatalogDashboard'));
const SocialMediaContentDashboard = lazy(() => import('@/pages/SocialMediaContentDashboard'));
const EmailSummaryAgentDashboard = lazy(() => import('@/pages/EmailSummaryAgentDashboard'));
const DatabaseChatDashboard = lazy(() => import('@/pages/DatabaseChatDashboard'));
const WebsiteChatbotDashboard = lazy(() => import('@/pages/WebsiteChatbotDashboard'));
const GmailAutoResponderDashboard = lazy(() => import('@/pages/GmailAutoResponderDashboard'));
const CustomerSupportAutomationDashboard = lazy(() => import('@/pages/CustomerSupportAutomationDashboard'));
const FinancialReportsDashboard = lazy(() => import('@/pages/FinancialReportsDashboard'));
const GmailEmailLabellingDashboard = lazy(() => import('@/pages/GmailEmailLabellingDashboard'));
const JobApplicationDashboard = lazy(() => import('@/pages/JobApplicationDashboard'));
const WhatsAppDietitianDashboard = lazy(() => import('@/pages/WhatsAppDietitianDashboard'));
const HRServiceDashboard = lazy(() => import('@/pages/HRServiceDashboard'));
const LocalRAGDashboard = lazy(() => import('@/pages/LocalRAGDashboard'));
const WhatsAppChatbotDashboard = lazy(() => import('@/pages/WhatsAppChatbotDashboard'));
const WhatsAppResponderDashboard = lazy(() => import('@/pages/WhatsAppResponderDashboard'));
const AutomatedLeadGenerationDashboard = lazy(() => import('@/pages/AutomatedLeadGenerationDashboard'));
const ClientOnboardingDashboard = lazy(() => import('@/pages/ClientOnboardingDashboard'));

// Sample dashboard pages
const SampleLeadGenerationDashboard = lazy(() => import('@/pages/SampleLeadGenerationDashboard'));
const SampleWhatsAppSalesDashboard = lazy(() => import('@/pages/SampleWhatsAppSalesDashboard'));
const SampleGmailCampaignDashboard = lazy(() => import('@/pages/SampleGmailCampaignDashboard'));
const SampleCustomerSupportAutomationDashboard = lazy(() => import('@/pages/SampleCustomerSupportAutomationDashboard'));
const SampleFinancialReportsDashboard = lazy(() => import('@/pages/SampleFinancialReportsDashboard'));
const SampleAutomatedLeadGenerationDashboard = lazy(() => import('@/pages/SampleAutomatedLeadGenerationDashboard'));
const SampleClientOnboardingDashboard = lazy(() => import('@/pages/SampleClientOnboardingDashboard'));
const SampleHRServiceDashboard = lazy(() => import('@/pages/SampleHRServiceDashboard'));
const SampleJobApplicationDashboard = lazy(() => import('@/pages/SampleJobApplicationDashboard'));
const SampleGmailAutoResponderDashboard = lazy(() => import('@/pages/SampleGmailAutoResponderDashboard'));
const SampleSocialMediaContentDashboard = lazy(() => import('@/pages/SampleSocialMediaContentDashboard'));
const SampleOdooSalesDashboard = lazy(() => import('@/pages/SampleOdooSalesDashboard'));
const SampleInvoiceCollectionDashboard = lazy(() => import('@/pages/SampleInvoiceCollectionDashboard'));
const SampleGmailEmailLabellingDashboard = lazy(() => import('@/pages/SampleGmailEmailLabellingDashboard'));
const SampleLocalRAGDashboard = lazy(() => import('@/pages/SampleLocalRAGDashboard'));
const SampleWebsiteChatbotDashboard = lazy(() => import('@/pages/SampleWebsiteChatbotDashboard'));
const SampleDatabaseChatDashboard = lazy(() => import('@/pages/SampleDatabaseChatDashboard'));
const SampleEmailSummaryAgentDashboard = lazy(() => import('@/pages/SampleEmailSummaryAgentDashboard'));
const SampleRAGChatbotDashboard = lazy(() => import('@/pages/SampleRAGChatbotDashboard'));
const SampleLocalChatbotDashboard = lazy(() => import('@/pages/SampleLocalChatbotDashboard'));
const SampleWhatsAppChatbotDashboard = lazy(() => import('@/pages/SampleWhatsAppChatbotDashboard'));
const SampleWhatsAppResponderDashboard = lazy(() => import('@/pages/SampleWhatsAppResponderDashboard'));
const SampleWhatsAppProductCatalogDashboard = lazy(() => import('@/pages/SampleWhatsAppProductCatalogDashboard'));
const SampleWhatsAppDietitianDashboard = lazy(() => import('@/pages/SampleWhatsAppDietitianDashboard'));

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  protected?: boolean;
  admin?: boolean;
  public?: boolean;
}

// Route configurations
export const routes: RouteConfig[] = [
  // Public routes
  { path: '/', component: Index, public: true },
  { path: '/login', component: Login, public: true },
  { path: '/oauth/callback', component: OAuthCallback, public: true },
  { path: '/marketplace', component: WorkflowMarketplace, public: true },
  
  // Sample routes (public) - MUST COME BEFORE PROTECTED ROUTES
  { path: '/sample-lead-generation', component: SampleLeadGenerationDashboard, public: true },
  { path: '/sample-whatsapp-sales', component: SampleWhatsAppSalesDashboard, public: true },
  { path: '/sample-gmail-campaign', component: SampleGmailCampaignDashboard, public: true },
  { path: '/sample-customer-support-automation', component: SampleCustomerSupportAutomationDashboard, public: true },
  { path: '/sample-financial-reports', component: SampleFinancialReportsDashboard, public: true },
  { path: '/sample-automated-lead-generation', component: SampleAutomatedLeadGenerationDashboard, public: true },
  { path: '/sample-client-onboarding', component: SampleClientOnboardingDashboard, public: true },
  { path: '/sample-hr-service', component: SampleHRServiceDashboard, public: true },
  { path: '/sample-job-application', component: SampleJobApplicationDashboard, public: true },
  { path: '/sample-gmail-auto-responder', component: SampleGmailAutoResponderDashboard, public: true },
  { path: '/sample-social-media-content', component: SampleSocialMediaContentDashboard, public: true },
  { path: '/sample-odoo-sales', component: SampleOdooSalesDashboard, public: true },
  { path: '/sample-invoice-collection', component: SampleInvoiceCollectionDashboard, public: true },
  { path: '/sample-gmail-email-labelling', component: SampleGmailEmailLabellingDashboard, public: true },
  { path: '/sample-local-rag', component: SampleLocalRAGDashboard, public: true },
  { path: '/sample-website-chatbot', component: SampleWebsiteChatbotDashboard, public: true },
  { path: '/sample-database-chat', component: SampleDatabaseChatDashboard, public: true },
  { path: '/sample-email-summary-agent', component: SampleEmailSummaryAgentDashboard, public: true },
  { path: '/sample-rag-chatbot', component: SampleRAGChatbotDashboard, public: true },
  { path: '/sample-local-chatbot', component: SampleLocalChatbotDashboard, public: true },
  { path: '/sample-whatsapp-chatbot', component: SampleWhatsAppChatbotDashboard, public: true },
  { path: '/sample-whatsapp-responder', component: SampleWhatsAppResponderDashboard, public: true },
  { path: '/sample-whatsapp-product-catalog', component: SampleWhatsAppProductCatalogDashboard, public: true },
  { path: '/sample-whatsapp-dietitian', component: SampleWhatsAppDietitianDashboard, public: true },
  
  // Protected routes
  { path: '/dashboard', component: Dashboard, protected: true },
  { path: '/marketplace', component: WorkflowMarketplace, protected: true },
  { path: '/test-workflow-execution', component: TestWorkflowExecution, protected: true },
  
  // Admin routes
  { path: '/admin', component: AdminDashboard, admin: true },
  { path: '/workflow-manager', component: WorkflowManager, admin: true },
  
  // Dashboard routes (protected)
  { path: '/lead-generation', component: LeadGenerationDashboard, protected: true },
  { path: '/whatsapp-sales', component: WhatsAppSalesDashboard, protected: true },
  { path: '/invoice-collection', component: InvoiceCollectionDashboard, protected: true },
  { path: '/gmail-campaign', component: GmailCampaignDashboard, protected: true },
  { path: '/rag-chatbot', component: RAGChatbotDashboard, protected: true },
  { path: '/odoo-sales', component: OdooSalesDashboard, protected: true },
  { path: '/local-chatbot', component: LocalChatbotDashboard, protected: true },
  { path: '/whatsapp-product-catalog', component: WhatsAppProductCatalogDashboard, protected: true },
  { path: '/social-media-content', component: SocialMediaContentDashboard, protected: true },
  { path: '/email-summary-agent', component: EmailSummaryAgentDashboard, protected: true },
  { path: '/database-chat', component: DatabaseChatDashboard, protected: true },
  { path: '/website-chatbot', component: WebsiteChatbotDashboard, protected: true },
  { path: '/gmail-auto-responder', component: GmailAutoResponderDashboard, protected: true },
  { path: '/customer-support-automation', component: CustomerSupportAutomationDashboard, protected: true },
  { path: '/financial-reports', component: FinancialReportsDashboard, protected: true },
  { path: '/gmail-email-labelling', component: GmailEmailLabellingDashboard, protected: true },
  { path: '/job-application', component: JobApplicationDashboard, protected: true },
  { path: '/whatsapp-dietitian', component: WhatsAppDietitianDashboard, protected: true },
  { path: '/hr-service', component: HRServiceDashboard, protected: true },
  { path: '/local-rag', component: LocalRAGDashboard, protected: true },
  { path: '/whatsapp-chatbot', component: WhatsAppChatbotDashboard, protected: true },
  { path: '/whatsapp-responder', component: WhatsAppResponderDashboard, protected: true },
  { path: '/automated-lead-generation', component: AutomatedLeadGenerationDashboard, protected: true },
  { path: '/client-onboarding', component: ClientOnboardingDashboard, protected: true },
  
  // Auth routes (public)
  { path: '/signup', component: Signup, public: true },
  { path: '/reset-password', component: ResetPassword, public: true },
  
  // Catch-all route
  { path: '*', component: NotFound, public: true },
];

// Helper functions
export const getPublicRoutes = () => routes.filter(route => route.public);
export const getProtectedRoutes = () => routes.filter(route => route.protected);
export const getAdminRoutes = () => routes.filter(route => route.admin);



