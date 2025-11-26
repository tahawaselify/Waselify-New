import { supabase } from '@/lib/supabaseClient';

// Workflow-specific metric interfaces based on actual n8n workflow analysis

export interface WhatsAppChatbotMetrics {
  messagesProcessed: number;
  aiResponsesGenerated: number;
  vectorStoreQueries: number;
  activeUserSessions: number;
  averageResponseTime: number;
  fileProcessingCount: number;
  embeddingOperations: number;
  conversationSatisfaction: number;
  memorySessions: number;
  nonTextMessages: number;
}

export interface DatabaseChatMetrics {
  databaseQueries: number;
  aiConversations: number;
  successfulQueries: number;
  failedQueries: number;
  averageQueryTime: number;
  memorySessions: number;
  uniqueUsers: number;
  queryComplexity: number;
}

export interface LeadGenerationMetrics {
  leadsIdentified: number;
  emailsEnriched: number;
  competitorsAnalyzed: number;
  successfulEnrichments: number;
  failedEnrichments: number;
  averageProcessingTime: number;
  uniqueCompanies: number;
  contactAccuracy: number;
}

export interface HRServiceMetrics {
  hrInquiries: number;
  automatedResponses: number;
  policyQueries: number;
  leaveRequests: number;
  employeeOnboarding: number;
  averageResponseTime: number;
  satisfactionScore: number;
  escalationRate: number;
}

export interface FinancialReportsMetrics {
  reportsGenerated: number;
  budgetVarianceAnalysis: number;
  costCenterReports: number;
  ytdAnalysis: number;
  monthlyComparisons: number;
  dataAccuracy: number;
  processingTime: number;
  errorRate: number;
}

export interface GmailAutoResponderMetrics {
  emailsProcessed: number;
  autoRepliesGenerated: number;
  draftEmailsCreated: number;
  responseAccuracy: number;
  averageProcessingTime: number;
  skippedEmails: number;
  userSatisfaction: number;
  followUpRate: number;
}

export interface InvoiceCollectionMetrics {
  invoicesProcessed: number;
  followUpsSent: number;
  overdueInvoices: number;
  paymentReminders: number;
  responseRate: number;
  collectionSuccess: number;
  averageDaysOverdue: number;
  revenueRecovered: number;
}

export interface JobApplicationMetrics {
  applicationsReceived: number;
  aiScreeningCompleted: number;
  qualifiedCandidates: number;
  rejectedApplications: number;
  averageProcessingTime: number;
  screeningAccuracy: number;
  candidateExperience: number;
  hiringFunnelConversion: number;
}

export interface GoogleMapsLeadMetrics {
  leadsGenerated: number;
  locationsAnalyzed: number;
  contactEnrichment: number;
  successfulOutreaches: number;
  averageProcessingTime: number;
  geographicCoverage: number;
  leadQuality: number;
  conversionRate: number;
}

export interface GmailCampaignMetrics {
  campaignsSent: number;
  emailsDelivered: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  engagementScore: number;
  conversionRate: number;
}

export interface ClientOnboardingMetrics {
  onboardingProcesses: number;
  documentsProcessed: number;
  welcomeEmails: number;
  setupCompletion: number;
  averageOnboardingTime: number;
  clientSatisfaction: number;
  dropOffRate: number;
  successRate: number;
}

export interface OdooSalesMetrics {
  salesInquiries: number;
  productQueries: number;
  quoteRequests: number;
  orderProcessing: number;
  customerInteractions: number;
  averageResponseTime: number;
  conversionRate: number;
  revenueImpact: number;
}

export interface WebsiteChatbotMetrics {
  websiteVisitors: number;
  chatInteractions: number;
  leadCaptures: number;
  supportQueries: number;
  averageSessionTime: number;
  satisfactionScore: number;
  conversionRate: number;
  bounceRate: number;
}

export interface LocalRAGChatbotMetrics {
  localQueries: number;
  documentSearches: number;
  knowledgeBaseAccess: number;
  responseAccuracy: number;
  averageResponseTime: number;
  userSatisfaction: number;
  offlineAvailability: number;
  dataPrivacyScore: number;
}

export interface RAGCompanyDocumentsMetrics {
  documentQueries: number;
  knowledgeBaseSearches: number;
  documentProcessing: number;
  searchAccuracy: number;
  averageResponseTime: number;
  userSatisfaction: number;
  documentCoverage: number;
  knowledgeRetention: number;
}

export interface EmailSummaryAgentMetrics {
  emailsSummarized: number;
  summaryAccuracy: number;
  processingTime: number;
  userSatisfaction: number;
  emailVolume: number;
  summaryQuality: number;
  timeSaved: number;
  adoptionRate: number;
}

export interface GmailLabellingMetrics {
  emailsProcessed: number;
  labelsApplied: number;
  categorizationAccuracy: number;
  processingTime: number;
  userSatisfaction: number;
  labelEfficiency: number;
  automationRate: number;
  errorRate: number;
}

export interface SocialMediaContentMetrics {
  contentGenerated: number;
  platformsTargeted: number;
  engagementRate: number;
  reachMetrics: number;
  contentQuality: number;
  postingFrequency: number;
  audienceGrowth: number;
  conversionRate: number;
}

export interface WhatsAppProductCatalogMetrics {
  catalogQueries: number;
  productSearches: number;
  orderInquiries: number;
  customerInteractions: number;
  averageResponseTime: number;
  conversionRate: number;
  customerSatisfaction: number;
  salesImpact: number;
}

export interface WhatsAppResponderMetrics {
  totalMessages: number;
  autoReplied: number;
  humanIntervention: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  messagesToday: number;
  aiAccuracy: number;
  responseRate: number;
  sentimentScore: number;
  activeConversations: number;
}

export interface LocalChatbotMetrics {
  localInteractions: number;
  offlineQueries: number;
  responseAccuracy: number;
  averageResponseTime: number;
  userSatisfaction: number;
  dataPrivacyScore: number;
  availabilityUptime: number;
  knowledgeBaseUsage: number;
}

// Helper functions for calculations
const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};


// Canonical workflow names used across dashboards and n8n inserts
const WF = {
  whatsappChatbot: 'WhatsApp Chatbot',
  databaseChat: 'Chat with Database using AI',
  automatedLeadGen: 'Automated Lead Generation',
  hrService: 'Automated HR Service System',
  financialReports: 'Generate Monthly Financial Reports',
  gmailAutoResponder: 'Gmail AI Auto-Responder',
  invoiceCollection: 'Smart Invoice Collection System',
  jobApplication: 'Handling Job Application Submissions with AI',
  googleMapsLead: 'Generate Leads with Google Maps',
  gmailCampaign: 'Gmail Campaign Sender',
  clientOnboarding: 'Client Onboarding Automation',
  odooSales: 'AI Chatbot for Odoo Sales',
  websiteChatbot: 'AI Website Chatbot',
  localRAGChatbot: 'Local Chatbot with Retrieval Augmented Generation (RAG)',
  ragCompanyDocs: 'RAG Chatbot for Company Documents',
  emailSummary: 'Email Summary Agent',
  gmailLabelling: 'Gmail Email Labelling',
  socialMediaContent: 'AI-Powered Social Media Content Generator & Publisher',
  whatsappProductCatalog: 'WhatsApp Product Catalog',
  whatsappResponder: 'WhatsApp AI Responder',
} as const;

// Workflow-specific API methods
export const workflowSpecificApi = {
  // WhatsApp Chatbot - Based on WhatsApp trigger, AI chat, vector store, embeddings
  async getWhatsAppChatbotMetrics(): Promise<WhatsAppChatbotMetrics> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .filter('user_id', 'eq', user.id) // CRITICAL: Filter by current user
        .like('workflow_name', 'WhatsApp Chatbot%') // Match workflow pattern
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!executions || executions.length === 0) {
        return {
          messagesProcessed: 0,
          aiResponsesGenerated: 0,
          vectorStoreQueries: 0,
          activeUserSessions: 0,
          averageResponseTime: 0,
          fileProcessingCount: 0,
          embeddingOperations: 0,
          conversationSatisfaction: 0,
          memorySessions: 0,
          nonTextMessages: 0
        };
      }

      const responseTimes = executions.map(e => e.execution_time || 0);
      const totalMessages = executions.reduce((sum, e) => sum + (e.metrics?.messages_processed || 0), 0);
      const totalAIResponses = executions.reduce((sum, e) => sum + (e.metrics?.ai_responses || 0), 0);
      const totalVectorQueries = executions.reduce((sum, e) => sum + (e.metrics?.vector_queries || 0), 0);

      return {
        messagesProcessed: totalMessages,
        aiResponsesGenerated: totalAIResponses,
        vectorStoreQueries: totalVectorQueries,
        activeUserSessions: executions.length,
        averageResponseTime: calculateAverage(responseTimes),
        fileProcessingCount: executions.reduce((sum, e) => sum + (e.metrics?.files_processed || 0), 0),
        embeddingOperations: executions.reduce((sum, e) => sum + (e.metrics?.embeddings_created || 0), 0),
        conversationSatisfaction: calculatePercentage(totalAIResponses, Math.max(totalMessages, 1)),
        memorySessions: executions.reduce((sum, e) => sum + (e.metrics?.memory_sessions || 0), 0),
        nonTextMessages: executions.reduce((sum, e) => sum + (e.metrics?.non_text_messages || 0), 0)
      };
    } catch (error) {
      console.error('Error fetching WhatsApp Chatbot metrics:', error);
      return {
        messagesProcessed: 0,
        aiResponsesGenerated: 0,
        vectorStoreQueries: 0,
        activeUserSessions: 0,
        averageResponseTime: 0,
        fileProcessingCount: 0,
        embeddingOperations: 0,
        conversationSatisfaction: 0,
        memorySessions: 0,
        nonTextMessages: 0
      };
    }
  },

  // Database Chat - Based on chat trigger, AI agent, PostgreSQL tool
  async getDatabaseChatMetrics(): Promise<DatabaseChatMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('user_id', user.id)
        .like('workflow_name', `${WF.databaseChat}%`)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!executions || executions.length === 0) {
        return {
          databaseQueries: 0,
          aiConversations: 0,
          successfulQueries: 0,
          failedQueries: 0,
          averageQueryTime: 0,
          memorySessions: 0,
          uniqueUsers: 0,
          queryComplexity: 0
        };
      }

      const queryTimes = executions.map(e => e.execution_time || 0);
      const totalQueries = executions.reduce((sum, e) => sum + (e.metrics?.database_queries || 0), 0);
      const successfulQueries = executions.reduce((sum, e) => sum + (e.metrics?.successful_queries || 0), 0);

      return {
        databaseQueries: totalQueries,
        aiConversations: executions.length,
        successfulQueries,
        failedQueries: totalQueries - successfulQueries,
        averageQueryTime: calculateAverage(queryTimes),
        memorySessions: executions.reduce((sum, e) => sum + (e.metrics?.memory_sessions || 0), 0),
        uniqueUsers: new Set(executions.map(e => e.user_id)).size,
        queryComplexity: calculateAverage(executions.map(e => e.metrics?.query_complexity || 1))
      };
    } catch (error) {
      console.error('Error fetching Database Chat metrics:', error);
      return {
        databaseQueries: 0,
        aiConversations: 0,
        successfulQueries: 0,
        failedQueries: 0,
        averageQueryTime: 0,
        memorySessions: 0,
        uniqueUsers: 0,
        queryComplexity: 0
      };
    }
  },

  // Lead Generation - Based on Google search, email enrichment, competitor analysis
  async getLeadGenerationMetrics(): Promise<LeadGenerationMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('user_id', user.id)
        .like('workflow_name', `${WF.automatedLeadGen}%`)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!executions || executions.length === 0) {
        return {
          leadsIdentified: 0,
          emailsEnriched: 0,
          competitorsAnalyzed: 0,
          successfulEnrichments: 0,
          failedEnrichments: 0,
          averageProcessingTime: 0,
          uniqueCompanies: 0,
          contactAccuracy: 0
        };
      }

      const processingTimes = executions.map(e => e.execution_time || 0);
      const totalLeads = executions.reduce((sum, e) => sum + (e.metrics?.leads_identified || 0), 0);
      const totalEnrichments = executions.reduce((sum, e) => sum + (e.metrics?.emails_enriched || 0), 0);
      const successfulEnrichments = executions.reduce((sum, e) => sum + (e.metrics?.successful_enrichments || 0), 0);

      return {
        leadsIdentified: totalLeads,
        emailsEnriched: totalEnrichments,
        competitorsAnalyzed: executions.reduce((sum, e) => sum + (e.metrics?.competitors_analyzed || 0), 0),
        successfulEnrichments,
        failedEnrichments: totalEnrichments - successfulEnrichments,
        averageProcessingTime: calculateAverage(processingTimes),
        uniqueCompanies: new Set(executions.map(e => e.metrics?.company_name).filter(Boolean)).size,
        contactAccuracy: calculatePercentage(successfulEnrichments, totalEnrichments)
      };
    } catch (error) {
      console.error('Error fetching Lead Generation metrics:', error);
      return {
        leadsIdentified: 0,
        emailsEnriched: 0,
        competitorsAnalyzed: 0,
        successfulEnrichments: 0,
        failedEnrichments: 0,
        averageProcessingTime: 0,
        uniqueCompanies: 0,
        contactAccuracy: 0
      };
    }
  },

  // HR Service - Based on WhatsApp trigger, AI responses, policy queries
  async getHRServiceMetrics(): Promise<HRServiceMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('user_id', user.id)
        .like('workflow_name', `${WF.hrService}%`)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!executions || executions.length === 0) {
        return {
          hrInquiries: 0,
          automatedResponses: 0,
          policyQueries: 0,
          leaveRequests: 0,
          employeeOnboarding: 0,
          averageResponseTime: 0,
          satisfactionScore: 0,
          escalationRate: 0
        };
      }

      const responseTimes = executions.map(e => e.execution_time || 0);
      const totalInquiries = executions.reduce((sum, e) => sum + (e.metrics?.hr_inquiries || 0), 0);
      const automatedResponses = executions.reduce((sum, e) => sum + (e.metrics?.automated_responses || 0), 0);

      return {
        hrInquiries: totalInquiries,
        automatedResponses,
        policyQueries: executions.reduce((sum, e) => sum + (e.metrics?.policy_queries || 0), 0),
        leaveRequests: executions.reduce((sum, e) => sum + (e.metrics?.leave_requests || 0), 0),
        employeeOnboarding: executions.reduce((sum, e) => sum + (e.metrics?.onboarding_requests || 0), 0),
        averageResponseTime: calculateAverage(responseTimes),
        satisfactionScore: calculatePercentage(automatedResponses, Math.max(totalInquiries, 1)),
        escalationRate: calculatePercentage(totalInquiries - automatedResponses, Math.max(totalInquiries, 1))
      };
    } catch (error) {
      console.error('Error fetching HR Service metrics:', error);
      return {
        hrInquiries: 0,
        automatedResponses: 0,
        policyQueries: 0,
        leaveRequests: 0,
        employeeOnboarding: 0,
        averageResponseTime: 0,
        satisfactionScore: 0,
        escalationRate: 0
      };
    }
  },

  // Financial Reports - Based on schedule trigger, MySQL queries, budget analysis
  async getFinancialReportsMetrics(): Promise<FinancialReportsMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('user_id', user.id)
        .like('workflow_name', `${WF.financialReports}%`)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (!executions || executions.length === 0) {
        return {
          reportsGenerated: 0,
          budgetVarianceAnalysis: 0,
          costCenterReports: 0,
          ytdAnalysis: 0,
          monthlyComparisons: 0,
          dataAccuracy: 0,
          processingTime: 0,
          errorRate: 0
        };
      }

      const processingTimes = executions.map(e => e.execution_time || 0);
      const totalReports = executions.reduce((sum, e) => sum + (e.metrics?.reports_generated || 0), 0);
      const successfulReports = executions.reduce((sum, e) => sum + (e.metrics?.successful_reports || 0), 0);

      return {
        reportsGenerated: totalReports,
        budgetVarianceAnalysis: executions.reduce((sum, e) => sum + (e.metrics?.variance_analysis || 0), 0),
        costCenterReports: executions.reduce((sum, e) => sum + (e.metrics?.cost_center_reports || 0), 0),
        ytdAnalysis: executions.reduce((sum, e) => sum + (e.metrics?.ytd_analysis || 0), 0),
        monthlyComparisons: executions.reduce((sum, e) => sum + (e.metrics?.monthly_comparisons || 0), 0),
        dataAccuracy: calculatePercentage(successfulReports, Math.max(totalReports, 1)),
        processingTime: calculateAverage(processingTimes),
        errorRate: calculatePercentage(totalReports - successfulReports, Math.max(totalReports, 1))
      };
    } catch (error) {
      console.error('Error fetching Financial Reports metrics:', error);
      return {
        reportsGenerated: 0,
        budgetVarianceAnalysis: 0,
        costCenterReports: 0,
        ytdAnalysis: 0,
        monthlyComparisons: 0,
        dataAccuracy: 0,
        processingTime: 0,
        errorRate: 0
      };
    }
  },

  // Gmail Auto-Responder - Based on Gmail trigger, AI analysis, draft creation
  async getGmailAutoResponderMetrics(): Promise<GmailAutoResponderMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('user_id', user.id)
        .like('workflow_name', `${WF.gmailAutoResponder}%`)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!executions || executions.length === 0) {
        return {
          emailsProcessed: 0,
          autoRepliesGenerated: 0,
          draftEmailsCreated: 0,
          responseAccuracy: 0,
          averageProcessingTime: 0,
          skippedEmails: 0,
          userSatisfaction: 0,
          followUpRate: 0
        };
      }

      const processingTimes = executions.map(e => e.execution_time || 0);
      const totalEmails = executions.reduce((sum, e) => sum + (e.metrics?.emails_processed || 0), 0);
      const autoReplies = executions.reduce((sum, e) => sum + (e.metrics?.auto_replies || 0), 0);
      const draftsCreated = executions.reduce((sum, e) => sum + (e.metrics?.drafts_created || 0), 0);

      return {
        emailsProcessed: totalEmails,
        autoRepliesGenerated: autoReplies,
        draftEmailsCreated: draftsCreated,
        responseAccuracy: calculatePercentage(autoReplies, Math.max(totalEmails, 1)),
        averageProcessingTime: calculateAverage(processingTimes),
        skippedEmails: Math.max(totalEmails - autoReplies, 0),
        userSatisfaction: calculatePercentage(autoReplies, Math.max(totalEmails, 1)),
        followUpRate: calculatePercentage(draftsCreated, Math.max(totalEmails, 1))
      };
    } catch (error) {
      console.error('Error fetching Gmail Auto-Responder metrics:', error);
      return {
        emailsProcessed: 0,
        autoRepliesGenerated: 0,
        draftEmailsCreated: 0,
        responseAccuracy: 0,
        averageProcessingTime: 0,
        skippedEmails: 0,
        userSatisfaction: 0,
        followUpRate: 0
      };
    }
  },

     // Invoice Collection - Based on Google Sheets, Gmail, AI analysis
   async getInvoiceCollectionMetrics(): Promise<InvoiceCollectionMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.invoiceCollection}%`)
         .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

       if (!executions || executions.length === 0) {
         return {
           invoicesProcessed: 0,
           followUpsSent: 0,
           overdueInvoices: 0,
           paymentReminders: 0,
           responseRate: 0,
           collectionSuccess: 0,
           averageDaysOverdue: 0,
           revenueRecovered: 0
         };
       }

       const totalInvoices = executions.reduce((sum, e) => sum + (e.metrics?.invoices_processed || 0), 0);
       const followUps = executions.reduce((sum, e) => sum + (e.metrics?.follow_ups_sent || 0), 0);
       const overdueInvoices = executions.reduce((sum, e) => sum + (e.metrics?.overdue_invoices || 0), 0);
       const revenueRecovered = executions.reduce((sum, e) => sum + (e.metrics?.revenue_recovered || 0), 0);

        return {
          invoicesProcessed: totalInvoices,
          followUpsSent: followUps,
          overdueInvoices,
          paymentReminders: followUps,
          responseRate: calculatePercentage(followUps, Math.max(totalInvoices, 1)),
          collectionSuccess: calculatePercentage(revenueRecovered > 0 ? followUps : 0, Math.max(followUps, 1)),
          averageDaysOverdue: calculateAverage(executions.map(e => e.metrics?.days_overdue || 0)),
          revenueRecovered
        };
     } catch (error) {
       console.error('Error fetching Invoice Collection metrics:', error);
       return {
         invoicesProcessed: 0,
         followUpsSent: 0,
         overdueInvoices: 0,
         paymentReminders: 0,
         responseRate: 0,
         collectionSuccess: 0,
         averageDaysOverdue: 0,
         revenueRecovered: 0
       };
     }
   },

   // Job Application - Based on form trigger, AI screening, candidate evaluation
   async getJobApplicationMetrics(): Promise<JobApplicationMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.jobApplication}%`)
         .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

       if (!executions || executions.length === 0) {
         return {
           applicationsReceived: 0,
           aiScreeningCompleted: 0,
           qualifiedCandidates: 0,
           rejectedApplications: 0,
           averageProcessingTime: 0,
           screeningAccuracy: 0,
           candidateExperience: 0,
           hiringFunnelConversion: 0
         };
       }

       const processingTimes = executions.map(e => e.execution_time || 0);
       const totalApplications = executions.reduce((sum, e) => sum + (e.metrics?.applications_received || 0), 0);
       const aiScreenings = executions.reduce((sum, e) => sum + (e.metrics?.ai_screenings || 0), 0);
       const qualifiedCandidates = executions.reduce((sum, e) => sum + (e.metrics?.qualified_candidates || 0), 0);

       return {
         applicationsReceived: totalApplications,
         aiScreeningCompleted: aiScreenings,
         qualifiedCandidates,
         rejectedApplications: totalApplications - qualifiedCandidates,
         averageProcessingTime: calculateAverage(processingTimes),
         screeningAccuracy: 92, // Mock accuracy score
         candidateExperience: 88, // Mock experience score
         hiringFunnelConversion: calculatePercentage(qualifiedCandidates, totalApplications)
       };
     } catch (error) {
       console.error('Error fetching Job Application metrics:', error);
       return {
         applicationsReceived: 0,
         aiScreeningCompleted: 0,
         qualifiedCandidates: 0,
         rejectedApplications: 0,
         averageProcessingTime: 0,
         screeningAccuracy: 0,
         candidateExperience: 0,
         hiringFunnelConversion: 0
       };
     }
   },

   // Google Maps Lead Generation - Based on Google Maps API, location analysis, contact enrichment
   async getGoogleMapsLeadMetrics(): Promise<GoogleMapsLeadMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.googleMapsLead}%`)
         .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

       if (!executions || executions.length === 0) {
         return {
           leadsGenerated: 0,
           locationsAnalyzed: 0,
           contactEnrichment: 0,
           successfulOutreaches: 0,
           averageProcessingTime: 0,
           geographicCoverage: 0,
           leadQuality: 0,
           conversionRate: 0
         };
       }

       const processingTimes = executions.map(e => e.execution_time || 0);
       const totalLeads = executions.reduce((sum, e) => sum + (e.metrics?.leads_generated || 0), 0);
       const locationsAnalyzed = executions.reduce((sum, e) => sum + (e.metrics?.locations_analyzed || 0), 0);
       const contactEnrichment = executions.reduce((sum, e) => sum + (e.metrics?.contact_enrichment || 0), 0);

       return {
         leadsGenerated: totalLeads,
         locationsAnalyzed,
         contactEnrichment,
         successfulOutreaches: executions.reduce((sum, e) => sum + (e.metrics?.successful_outreaches || 0), 0),
         averageProcessingTime: calculateAverage(processingTimes),
         geographicCoverage: new Set(executions.map(e => e.metrics?.location_area).filter(Boolean)).size,
         leadQuality: 85, // Mock quality score
         conversionRate: calculatePercentage(contactEnrichment, totalLeads)
       };
     } catch (error) {
       console.error('Error fetching Google Maps Lead metrics:', error);
       return {
         leadsGenerated: 0,
         locationsAnalyzed: 0,
         contactEnrichment: 0,
         successfulOutreaches: 0,
         averageProcessingTime: 0,
         geographicCoverage: 0,
         leadQuality: 0,
         conversionRate: 0
       };
     }
   },

   // Gmail Campaign - Based on Gmail API, email campaigns, analytics
   async getGmailCampaignMetrics(): Promise<GmailCampaignMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.gmailCampaign}%`)
         .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

       if (!executions || executions.length === 0) {
         return {
           campaignsSent: 0,
           emailsDelivered: 0,
           openRate: 0,
           clickRate: 0,
           bounceRate: 0,
           unsubscribeRate: 0,
           engagementScore: 0,
           conversionRate: 0
         };
       }

       const totalCampaigns = executions.reduce((sum, e) => sum + (e.metrics?.campaigns_sent || 0), 0);
       const emailsDelivered = executions.reduce((sum, e) => sum + (e.metrics?.emails_delivered || 0), 0);
       const emailsOpened = executions.reduce((sum, e) => sum + (e.metrics?.emails_opened || 0), 0);
       const emailsClicked = executions.reduce((sum, e) => sum + (e.metrics?.emails_clicked || 0), 0);

        const emailsBounced = executions.reduce((sum, e) => sum + (e.metrics?.emails_bounced || 0), 0);
        const unsubscribes = executions.reduce((sum, e) => sum + (e.metrics?.unsubscribes || 0), 0);
        const denomDeliveredOrBounced = Math.max(emailsDelivered + emailsBounced, 1);
        const denomDeliveredOrUnsub = Math.max(emailsDelivered + unsubscribes, 1);
        const openRate = calculatePercentage(emailsOpened, Math.max(emailsDelivered, 1));
        const clickRate = calculatePercentage(emailsClicked, Math.max(emailsDelivered, 1));
        const engagementScore = Math.round(0.6 * openRate + 0.4 * clickRate);
        return {
          campaignsSent: totalCampaigns,
          emailsDelivered,
          openRate,
          clickRate,
          bounceRate: calculatePercentage(emailsBounced, denomDeliveredOrBounced),
          unsubscribeRate: calculatePercentage(unsubscribes, denomDeliveredOrUnsub),
          engagementScore,
          conversionRate: clickRate
        };
     } catch (error) {
       console.error('Error fetching Gmail Campaign metrics:', error);
       return {
         campaignsSent: 0,
         emailsDelivered: 0,
         openRate: 0,
         clickRate: 0,
         bounceRate: 0,
         unsubscribeRate: 0,
         engagementScore: 0,
         conversionRate: 0
       };
     }
   },

   // Client Onboarding - Based on form submissions, welcome emails, setup automation
   async getClientOnboardingMetrics(): Promise<ClientOnboardingMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.clientOnboarding}%`)
         .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

       if (!executions || executions.length === 0) {
         return {
           onboardingProcesses: 0,
           documentsProcessed: 0,
           welcomeEmails: 0,
           setupCompletion: 0,
           averageOnboardingTime: 0,
           clientSatisfaction: 0,
           dropOffRate: 0,
           successRate: 0
         };
       }

       const totalProcesses = executions.reduce((sum, e) => sum + (e.metrics?.onboarding_processes || 0), 0);
       const documentsProcessed = executions.reduce((sum, e) => sum + (e.metrics?.documents_processed || 0), 0);
       const welcomeEmails = executions.reduce((sum, e) => sum + (e.metrics?.welcome_emails || 0), 0);
       const completedSetups = executions.reduce((sum, e) => sum + (e.metrics?.completed_setups || 0), 0);

        return {
          onboardingProcesses: totalProcesses,
          documentsProcessed,
          welcomeEmails,
          setupCompletion: completedSetups,
          averageOnboardingTime: calculateAverage(executions.map(e => e.metrics?.onboarding_time || 0)),
          clientSatisfaction: calculatePercentage(completedSetups, Math.max(totalProcesses, 1)),
          dropOffRate: calculatePercentage(totalProcesses - completedSetups, Math.max(totalProcesses, 1)),
          successRate: calculatePercentage(completedSetups, Math.max(totalProcesses, 1))
        };
     } catch (error) {
       console.error('Error fetching Client Onboarding metrics:', error);
       return {
         onboardingProcesses: 0,
         documentsProcessed: 0,
         welcomeEmails: 0,
         setupCompletion: 0,
         averageOnboardingTime: 0,
         clientSatisfaction: 0,
         dropOffRate: 0,
         successRate: 0
       };
     }
   },

   // Odoo Sales - Based on Odoo API, sales data, AI analysis
   async getOdooSalesMetrics(): Promise<OdooSalesMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.odooSales}%`)
         .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

       if (!executions || executions.length === 0) {
         return {
           salesInquiries: 0,
           productQueries: 0,
           quoteRequests: 0,
           orderProcessing: 0,
           customerInteractions: 0,
           averageResponseTime: 0,
           conversionRate: 0,
           revenueImpact: 0
         };
       }

       const responseTimes = executions.map(e => e.execution_time || 0);
       const totalInquiries = executions.reduce((sum, e) => sum + (e.metrics?.sales_inquiries || 0), 0);
       const productQueries = executions.reduce((sum, e) => sum + (e.metrics?.product_queries || 0), 0);
       const quoteRequests = executions.reduce((sum, e) => sum + (e.metrics?.quote_requests || 0), 0);

       return {
         salesInquiries: totalInquiries,
         productQueries,
         quoteRequests,
         orderProcessing: executions.reduce((sum, e) => sum + (e.metrics?.orders_processed || 0), 0),
         customerInteractions: executions.length,
         averageResponseTime: calculateAverage(responseTimes),
         conversionRate: calculatePercentage(quoteRequests, totalInquiries),
         revenueImpact: executions.reduce((sum, e) => sum + (e.metrics?.revenue_impact || 0), 0)
       };
     } catch (error) {
       console.error('Error fetching Odoo Sales metrics:', error);
       return {
         salesInquiries: 0,
         productQueries: 0,
         quoteRequests: 0,
         orderProcessing: 0,
         customerInteractions: 0,
         averageResponseTime: 0,
         conversionRate: 0,
         revenueImpact: 0
       };
     }
   },

   // Website Chatbot - Based on webhook trigger, AI chat, appointment booking
   async getWebsiteChatbotMetrics(): Promise<WebsiteChatbotMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.websiteChatbot}%`)
         .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

       if (!executions || executions.length === 0) {
         return {
           websiteVisitors: 0,
           chatInteractions: 0,
           leadCaptures: 0,
           supportQueries: 0,
           averageSessionTime: 0,
           satisfactionScore: 0,
           conversionRate: 0,
           bounceRate: 0
         };
       }

       const totalVisitors = executions.reduce((sum, e) => sum + (e.metrics?.website_visitors || 0), 0);
       const chatInteractions = executions.reduce((sum, e) => sum + (e.metrics?.chat_interactions || 0), 0);
       const leadCaptures = executions.reduce((sum, e) => sum + (e.metrics?.lead_captures || 0), 0);

        const conversionRate = calculatePercentage(leadCaptures, Math.max(totalVisitors, 1));
        return {
          websiteVisitors: totalVisitors,
          chatInteractions,
          leadCaptures,
          supportQueries: executions.reduce((sum, e) => sum + (e.metrics?.support_queries || 0), 0),
          averageSessionTime: calculateAverage(executions.map(e => e.metrics?.session_time || 0)),
          satisfactionScore: calculatePercentage(leadCaptures, Math.max(chatInteractions, 1)),
          conversionRate,
          bounceRate: Math.max(100 - conversionRate, 0)
        };
     } catch (error) {
       console.error('Error fetching Website Chatbot metrics:', error);
       return {
         websiteVisitors: 0,
         chatInteractions: 0,
         leadCaptures: 0,
         supportQueries: 0,
         averageSessionTime: 0,
         satisfactionScore: 0,
         conversionRate: 0,
         bounceRate: 0
       };
     }
   },

   // Local RAG Chatbot - Based on file uploads, vector store, local AI
   async getLocalRAGChatbotMetrics(): Promise<LocalRAGChatbotMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.localRAGChatbot}%`)
         .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

       if (!executions || executions.length === 0) {
         return {
           localQueries: 0,
           documentSearches: 0,
           knowledgeBaseAccess: 0,
           responseAccuracy: 0,
           averageResponseTime: 0,
           userSatisfaction: 0,
           offlineAvailability: 0,
           dataPrivacyScore: 0
         };
       }

       const responseTimes = executions.map(e => e.execution_time || 0);
       const totalQueries = executions.reduce((sum, e) => sum + (e.metrics?.local_queries || 0), 0);
       const documentSearches = executions.reduce((sum, e) => sum + (e.metrics?.document_searches || 0), 0);

        const responseAccuracy = calculatePercentage(documentSearches, Math.max(totalQueries, 1));
        return {
          localQueries: totalQueries,
          documentSearches,
          knowledgeBaseAccess: executions.reduce((sum, e) => sum + (e.metrics?.knowledge_base_access || 0), 0),
          responseAccuracy,
          averageResponseTime: calculateAverage(responseTimes),
          userSatisfaction: responseAccuracy,
          offlineAvailability: executions.length > 0 ? 100 : 0,
          dataPrivacyScore: executions.reduce((sum, e) => sum + (e.metrics?.data_privacy_score || 0), 0) / Math.max(executions.length, 1)
        };
     } catch (error) {
       console.error('Error fetching Local RAG Chatbot metrics:', error);
       return {
         localQueries: 0,
         documentSearches: 0,
         knowledgeBaseAccess: 0,
         responseAccuracy: 0,
         averageResponseTime: 0,
         userSatisfaction: 0,
         offlineAvailability: 0,
         dataPrivacyScore: 0
       };
     }
   },

   // RAG Company Documents - Based on document ingestion, semantic search, knowledge base
   async getRAGCompanyDocumentsMetrics(): Promise<RAGCompanyDocumentsMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.ragCompanyDocs}%`)
         .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

       if (!executions || executions.length === 0) {
         return {
           documentQueries: 0,
           knowledgeBaseSearches: 0,
           documentProcessing: 0,
           searchAccuracy: 0,
           averageResponseTime: 0,
           userSatisfaction: 0,
           documentCoverage: 0,
           knowledgeRetention: 0
         };
       }

       const responseTimes = executions.map(e => e.execution_time || 0);
       const totalQueries = executions.reduce((sum, e) => sum + (e.metrics?.document_queries || 0), 0);
       const knowledgeSearches = executions.reduce((sum, e) => sum + (e.metrics?.knowledge_base_searches || 0), 0);

        const documentProcessing = executions.reduce((sum, e) => sum + (e.metrics?.document_processing || 0), 0);
        const searchAccuracy = calculatePercentage(documentProcessing, Math.max(totalQueries, 1));
        return {
          documentQueries: totalQueries,
          knowledgeBaseSearches: knowledgeSearches,
          documentProcessing,
          searchAccuracy,
          averageResponseTime: calculateAverage(responseTimes),
          userSatisfaction: searchAccuracy,
          documentCoverage: calculatePercentage(documentProcessing, Math.max(knowledgeSearches, 1)),
          knowledgeRetention: calculateAverage(executions.map(e => e.metrics?.knowledge_retention || 0))
        };
     } catch (error) {
       console.error('Error fetching RAG Company Documents metrics:', error);
       return {
         documentQueries: 0,
         knowledgeBaseSearches: 0,
         documentProcessing: 0,
         searchAccuracy: 0,
         averageResponseTime: 0,
         userSatisfaction: 0,
         documentCoverage: 0,
         knowledgeRetention: 0
       };
     }
   },

   // Email Summary Agent - Based on email processing, AI summarization, content extraction
   async getEmailSummaryAgentMetrics(): Promise<EmailSummaryAgentMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.emailSummary}%`)
         .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

       if (!executions || executions.length === 0) {
         return {
           emailsSummarized: 0,
           summaryAccuracy: 0,
           processingTime: 0,
           userSatisfaction: 0,
           emailVolume: 0,
           summaryQuality: 0,
           timeSaved: 0,
           adoptionRate: 0
         };
       }

       const processingTimes = executions.map(e => e.execution_time || 0);
       const totalEmails = executions.reduce((sum, e) => sum + (e.metrics?.emails_summarized || 0), 0);
       const timeSaved = executions.reduce((sum, e) => sum + (e.metrics?.time_saved || 0), 0);

        const summaryAccuracyAvg = calculateAverage(executions.map(e => e.metrics?.summary_accuracy || 0));
        const userSatisfactionAvg = calculateAverage(executions.map(e => e.metrics?.user_satisfaction || 0));
        const summaryQualityAvg = calculateAverage(executions.map(e => e.metrics?.summary_quality || 0));
        const adoptionRateAvg = calculateAverage(executions.map(e => e.metrics?.adoption_rate || 0));
        return {
          emailsSummarized: totalEmails,
          summaryAccuracy: summaryAccuracyAvg,
          processingTime: calculateAverage(processingTimes),
          userSatisfaction: userSatisfactionAvg,
          emailVolume: totalEmails,
          summaryQuality: summaryQualityAvg,
          timeSaved,
          adoptionRate: adoptionRateAvg
        };
     } catch (error) {
       console.error('Error fetching Email Summary Agent metrics:', error);
       return {
         emailsSummarized: 0,
         summaryAccuracy: 0,
         processingTime: 0,
         userSatisfaction: 0,
         emailVolume: 0,
         summaryQuality: 0,
         timeSaved: 0,
         adoptionRate: 0
       };
     }
   },

   // Gmail Labelling - Based on Gmail API, email categorization, label management
   async getGmailLabellingMetrics(): Promise<GmailLabellingMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.gmailLabelling}%`)
         .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

       if (!executions || executions.length === 0) {
         return {
           emailsProcessed: 0,
           labelsApplied: 0,
           categorizationAccuracy: 0,
           processingTime: 0,
           userSatisfaction: 0,
           labelEfficiency: 0,
           automationRate: 0,
           errorRate: 0
         };
       }

       const processingTimes = executions.map(e => e.execution_time || 0);
       const totalEmails = executions.reduce((sum, e) => sum + (e.metrics?.emails_processed || 0), 0);
       const labelsApplied = executions.reduce((sum, e) => sum + (e.metrics?.labels_applied || 0), 0);

        const accuracyAvg = calculateAverage(executions.map(e => e.metrics?.categorization_accuracy || 0));
        const derivedAccuracy = accuracyAvg > 0 ? accuracyAvg : calculatePercentage(labelsApplied, Math.max(totalEmails, 1));
        const errorRateAvg = calculateAverage(executions.map(e => e.metrics?.error_rate || 0));
        const derivedErrorRate = errorRateAvg > 0 ? errorRateAvg : Math.max(100 - derivedAccuracy, 0);
        const labelEfficiencyAvg = calculateAverage(executions.map(e => e.metrics?.label_efficiency || 0));
        const userSatisfactionAvg2 = calculateAverage(executions.map(e => e.metrics?.user_satisfaction || 0));
        return {
          emailsProcessed: totalEmails,
          labelsApplied,
          categorizationAccuracy: derivedAccuracy,
          processingTime: calculateAverage(processingTimes),
          userSatisfaction: userSatisfactionAvg2,
          labelEfficiency: labelEfficiencyAvg,
          automationRate: calculatePercentage(labelsApplied, Math.max(totalEmails, 1)),
          errorRate: derivedErrorRate
        };
     } catch (error) {
       console.error('Error fetching Gmail Labelling metrics:', error);
       return {
         emailsProcessed: 0,
         labelsApplied: 0,
         categorizationAccuracy: 0,
         processingTime: 0,
         userSatisfaction: 0,
         labelEfficiency: 0,
         automationRate: 0,
         errorRate: 0
       };
     }
   },

   // Social Media Content - Based on content generation, platform integration, engagement tracking
   async getSocialMediaContentMetrics(): Promise<SocialMediaContentMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.socialMediaContent}%`)
         .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

       if (!executions || executions.length === 0) {
         return {
           contentGenerated: 0,
           platformsTargeted: 0,
           engagementRate: 0,
           reachMetrics: 0,
           contentQuality: 0,
           postingFrequency: 0,
           audienceGrowth: 0,
           conversionRate: 0
         };
       }

       const totalContent = executions.reduce((sum, e) => sum + (e.metrics?.content_generated || 0), 0);
       const platformsTargeted = executions.reduce((sum, e) => sum + (e.metrics?.platforms_targeted || 0), 0);
       const engagementRate = executions.reduce((sum, e) => sum + (e.metrics?.engagement_rate || 0), 0);

        const engagementRateAvg = calculateAverage(executions.map(e => e.metrics?.engagement_rate || 0));
        const contentQualityAvg = calculateAverage(executions.map(e => e.metrics?.content_quality || 0));
        const audienceGrowthAvg = calculateAverage(executions.map(e => e.metrics?.audience_growth || 0));
        const conversionRateAvg = calculateAverage(executions.map(e => e.metrics?.conversion_rate || 0));
        return {
          contentGenerated: totalContent,
          platformsTargeted,
          engagementRate: engagementRateAvg,
          reachMetrics: executions.reduce((sum, e) => sum + (e.metrics?.reach_metrics || 0), 0),
          contentQuality: contentQualityAvg,
          postingFrequency: executions.length,
          audienceGrowth: audienceGrowthAvg,
          conversionRate: conversionRateAvg
        };
     } catch (error) {
       console.error('Error fetching Social Media Content metrics:', error);
       return {
         contentGenerated: 0,
         platformsTargeted: 0,
         engagementRate: 0,
         reachMetrics: 0,
         contentQuality: 0,
         postingFrequency: 0,
         audienceGrowth: 0,
         conversionRate: 0
       };
     }
   },

   // WhatsApp Product Catalog - Based on WhatsApp trigger, product queries, order processing
   async getWhatsAppProductCatalogMetrics(): Promise<WhatsAppProductCatalogMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.whatsappProductCatalog}%`)
         .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

       if (!executions || executions.length === 0) {
         return {
           catalogQueries: 0,
           productSearches: 0,
           orderInquiries: 0,
           customerInteractions: 0,
           averageResponseTime: 0,
           conversionRate: 0,
           customerSatisfaction: 0,
           salesImpact: 0
         };
       }

       const responseTimes = executions.map(e => e.execution_time || 0);
       const totalQueries = executions.reduce((sum, e) => sum + (e.metrics?.catalog_queries || 0), 0);
       const productSearches = executions.reduce((sum, e) => sum + (e.metrics?.product_searches || 0), 0);
       const orderInquiries = executions.reduce((sum, e) => sum + (e.metrics?.order_inquiries || 0), 0);

        const customerSatisfactionAvg = calculateAverage(executions.map(e => e.metrics?.customer_satisfaction || 0));
        const derivedSatisfaction = customerSatisfactionAvg > 0 ? customerSatisfactionAvg : calculatePercentage(orderInquiries, Math.max(totalQueries, 1));
        return {
          catalogQueries: totalQueries,
          productSearches,
          orderInquiries,
          customerInteractions: executions.length,
          averageResponseTime: calculateAverage(responseTimes),
          conversionRate: calculatePercentage(orderInquiries, Math.max(totalQueries, 1)),
          customerSatisfaction: derivedSatisfaction,
          salesImpact: executions.reduce((sum, e) => sum + (e.metrics?.sales_impact || 0), 0)
        };
     } catch (error) {
       console.error('Error fetching WhatsApp Product Catalog metrics:', error);
       return {
         catalogQueries: 0,
         productSearches: 0,
         orderInquiries: 0,
         customerInteractions: 0,
         averageResponseTime: 0,
         conversionRate: 0,
         customerSatisfaction: 0,
         salesImpact: 0
       };
     }
   },

   // WhatsApp AI Responder - Based on WhatsApp trigger, AI auto-response, sentiment analysis
   async getWhatsAppResponderMetrics(): Promise<WhatsAppResponderMetrics> {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('user_id', user.id)
         .like('workflow_name', `${WF.whatsappResponder}%`)
         .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

       if (!executions || executions.length === 0) {
         return {
           totalMessages: 0,
           autoReplied: 0,
           humanIntervention: 0,
           averageResponseTime: 0,
           customerSatisfaction: 0,
           messagesToday: 0,
           aiAccuracy: 0,
           responseRate: 0,
           sentimentScore: 0,
           activeConversations: 0
         };
       }

       const responseTimes = executions.map(e => e.execution_time || 0);
       const totalMessages = executions.reduce((sum, e) => sum + (e.metrics?.total_messages || 0), 0);
       const autoReplied = executions.reduce((sum, e) => sum + (e.metrics?.auto_replied || 0), 0);
       const humanIntervention = executions.reduce((sum, e) => sum + (e.metrics?.human_intervention || 0), 0);

        const customerSatisfactionAvg2 = calculateAverage(executions.map(e => e.metrics?.customer_satisfaction || 0));
        const aiAccuracyAvg = calculateAverage(executions.map(e => e.metrics?.ai_accuracy || 0));
        const sentimentScoreAvg = calculateAverage(executions.map(e => e.metrics?.sentiment_score || 0));
        return {
          totalMessages,
          autoReplied,
          humanIntervention,
          averageResponseTime: calculateAverage(responseTimes),
          customerSatisfaction: customerSatisfactionAvg2 > 0 ? customerSatisfactionAvg2 : calculatePercentage(autoReplied, Math.max(totalMessages, 1)),
          messagesToday: executions.length,
          aiAccuracy: aiAccuracyAvg > 0 ? aiAccuracyAvg : calculatePercentage(autoReplied, Math.max(totalMessages, 1)),
          responseRate: calculatePercentage(autoReplied, Math.max(totalMessages, 1)),
          sentimentScore: sentimentScoreAvg,
          activeConversations: executions.length
        };
     } catch (error) {
       console.error('Error fetching WhatsApp AI Responder metrics:', error);
       return {
         totalMessages: 0,
         autoReplied: 0,
         humanIntervention: 0,
         averageResponseTime: 0,
         customerSatisfaction: 0,
         messagesToday: 0,
         aiAccuracy: 0,
         responseRate: 0,
         sentimentScore: 0,
         activeConversations: 0
       };
     }
   },

   // Local Chatbot - Based on local AI model, offline processing, privacy-focused
   async getLocalChatbotMetrics(): Promise<LocalChatbotMetrics> {
     try {
       const { data: executions } = await supabase
         .from('workflow_executions')
         .select('*')
         .eq('workflow_name', 'Local Chatbot')
         .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

       if (!executions || executions.length === 0) {
         return {
           localInteractions: 0,
           offlineQueries: 0,
           responseAccuracy: 0,
           averageResponseTime: 0,
           userSatisfaction: 0,
           dataPrivacyScore: 0,
           availabilityUptime: 0,
           knowledgeBaseUsage: 0
         };
       }

       const responseTimes = executions.map(e => e.execution_time || 0);
       const totalInteractions = executions.reduce((sum, e) => sum + (e.metrics?.local_interactions || 0), 0);
       const offlineQueries = executions.reduce((sum, e) => sum + (e.metrics?.offline_queries || 0), 0);

       return {
         localInteractions: totalInteractions,
         offlineQueries,
         responseAccuracy: 91, // Mock accuracy score
         averageResponseTime: calculateAverage(responseTimes),
         userSatisfaction: 89, // Mock satisfaction score
         dataPrivacyScore: 100, // Perfect privacy score for local processing
         availabilityUptime: 99.9, // High uptime for local system
         knowledgeBaseUsage: executions.reduce((sum, e) => sum + (e.metrics?.knowledge_base_usage || 0), 0)
       };
     } catch (error) {
       console.error('Error fetching Local Chatbot metrics:', error);
       return {
         localInteractions: 0,
         offlineQueries: 0,
         responseAccuracy: 0,
         averageResponseTime: 0,
         userSatisfaction: 0,
         dataPrivacyScore: 0,
         availabilityUptime: 0,
         knowledgeBaseUsage: 0
       };
     }
   }
};