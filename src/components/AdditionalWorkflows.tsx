import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const AdditionalWorkflows = () => {
  const { t } = useTranslation();

  const categories = [
    'sales',
    'support', 
    'finance',
    'hr',
    'crm'
  ];

  // Fallback workflows in case translation fails
  const fallbackWorkflows = {
    sales: ['WhatsApp Product Catalog Bot', 'Gmail Campaign Sender', 'Lead Generation with Google Maps', 'AI-Powered Social Media Content Generator'],
    support: ['Email Summary Agent', 'Chat with Database using AI', 'Website Chatbot', 'Gmail AI Auto-Responder', 'Customer Support Automation'],
    finance: ['Smart Invoice Collection System', 'Generate Monthly Financial Reports', 'Gmail Email Labelling'],
    hr: ['Job Application Submissions with AI', 'Automated HR Service System', 'WhatsApp Dietitian AI Chatbot'],
    crm: ['AI Chatbot for Odoo Sales', 'RAG Chatbot for Company Documents', 'Local Chatbot with RAG']
  };

  const getWorkflows = (category: string) => {
    try {
      const workflows = t(`additionalWorkflows.categories.${category}.workflows`, { returnObjects: true });
      return Array.isArray(workflows) ? workflows : fallbackWorkflows[category as keyof typeof fallbackWorkflows] || [];
    } catch (error) {
      return fallbackWorkflows[category as keyof typeof fallbackWorkflows] || [];
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 relative" id="additional-workflows">
      {/* Background decorative elements */}
      <div className="absolute -top-20 left-0 w-72 h-72 bg-waselify-50 rounded-full opacity-60 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-10 w-64 h-64 bg-gray-100 rounded-full opacity-70 blur-3xl -z-10"></div>
      
      <div className="section-container">
        <div className="text-center mb-16 opacity-0 animate-on-scroll">
          <div className="pulse-chip mx-auto mb-4">
            <span>{t('additionalWorkflows.chip')}</span>
          </div>
          <h2 className="section-title mb-4">{t('additionalWorkflows.title')}</h2>
          <p className="section-subtitle mx-auto">
            {t('additionalWorkflows.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <div 
              key={category}
              className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-elegant hover:shadow-elegant-hover transition-all duration-500 opacity-0 animate-on-scroll"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="flex items-center mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mr-4",
                  category === 'sales' && "bg-blue-100 text-blue-600",
                  category === 'support' && "bg-green-100 text-green-600", 
                  category === 'finance' && "bg-purple-100 text-purple-600",
                  category === 'hr' && "bg-orange-100 text-orange-600",
                  category === 'crm' && "bg-red-100 text-red-600"
                )}>
                  {category === 'sales' && "💼"}
                  {category === 'support' && "🎧"}
                  {category === 'finance' && "💰"}
                  {category === 'hr' && "👥"}
                  {category === 'crm' && "📊"}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {t(`additionalWorkflows.categories.${category}.title`)}
                </h3>
              </div>
              
              <ul className="space-y-3">
                {getWorkflows(category).map((workflow: string, workflowIndex: number) => (
                  <li key={workflowIndex} className="flex items-start">
                    <div className="w-2 h-2 bg-waselify-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm">{workflow}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to="/login" className="text-waselify-500 hover:text-waselify-600 font-medium text-sm transition-colors">
                  {t('additionalWorkflows.learnMore')}
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 opacity-0 animate-on-scroll">
          <p className="text-gray-600 mb-6">
            {t('additionalWorkflows.note')}
          </p>
          <a 
            href="#details" 
            className="inline-flex items-center justify-center bg-waselify-500 hover:bg-waselify-600 text-white font-semibold text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
          >
            {t('additionalWorkflows.getQuote')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default AdditionalWorkflows; 