import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, useEffect, useRef } from "react";
import AuthProvider from "./contexts/AuthProvider";
import SubscriptionProvider from "./contexts/SubscriptionProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import PublicRoute from "./components/PublicRoute";
import { routes } from "./config/routes";
import GlobalNotificationService from './components/GlobalNotificationService';
import GlobalMessageService from './components/GlobalMessageService';
import ScrollToTop from './components/ScrollToTop';
import { AccessibilityProvider } from "./lib/accessibility";
import { PerformanceProvider } from "./lib/performance";
import "./lib/i18n";
import "./lib/dashboardI18n";
import { useTranslation } from 'react-i18next';

const queryClient = new QueryClient();

// Lightweight overlay to translate common Sample Dashboard UI labels at runtime for Arabic
const SampleI18nOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (i18n.language !== 'ar') return;
    const root = containerRef.current;
    if (!root) return;

    // Force navbar to remain LTR and isolated regardless of parent RTL
    try {
      const headers = root.querySelectorAll('header[role="banner"]');
      headers.forEach((h) => {
        const el = h as HTMLElement;
        el.setAttribute('dir', 'ltr');
        el.style.setProperty('direction', 'ltr', 'important');
        el.style.setProperty('unicode-bidi', 'isolate', 'important');
        // Mobile overlay container
        const mobileContainers = el.querySelectorAll('div.fixed.inset-0');
        mobileContainers.forEach(mc => {
          const mcel = mc as HTMLElement;
          mcel.setAttribute('dir', 'ltr');
          mcel.style.setProperty('direction', 'ltr', 'important');
          mcel.style.setProperty('unicode-bidi', 'isolate', 'important');
        });
        // Any nav inside header
        const navs = el.querySelectorAll('nav');
        navs.forEach(n => {
          const nEl = n as HTMLElement;
          nEl.setAttribute('dir', 'ltr');
          nEl.style.setProperty('direction', 'ltr', 'important');
          nEl.style.setProperty('unicode-bidi', 'isolate', 'important');
        });
      });
    } catch {}

    const map = new Map<string, string>([
      // Generic sample notice
      ['Sample Dashboard Notice', t('sample.noticeTitle')],
      // Sections
      ['Workflow Control', t('sections.workflowControl')],
      ['Pending Requests', t('sections.pendingRequests')],
      ['Recent Processed Requests', t('sections.recentProcessedRequests')],
      // Labels
      ['Request admin to start, stop, or modify your workflow', t('labels.workflowControlDesc')],
      ['Your workflow control requests awaiting admin approval', t('labels.requestsAwaitingApproval')],
      ['Your recently approved or rejected workflow requests', t('labels.recentlyApprovedOrRejected')],
      ['Submitted', t('labels.submittedOn')],
      // Buttons
      ['Request Start', t('buttons.requestStart')],
      ['Request Stop', t('buttons.requestStop')],
      ['Request Changes', t('buttons.requestChanges')],
      ['Start Automation', t('buttons.startAutomationLabel')],
      ['Pause Automation', t('buttons.pauseAutomationLabel')],
      ['Refresh', t('buttons.refresh')],
      // Badges
      ['Approved', t('badgeStatus.approved')],
      ['Rejected', t('badgeStatus.rejected')],
      ['Pending', t('badgeStatus.pending')],

      // Common tabs
      ['Overview', 'نظرة عامة'],
      ['Invoices', 'الفواتير'],
      ['Analytics', 'التحليلات'],
      ['Leads', 'العملاء'],
      ['Campaigns', 'الحملات'],

      // Odoo Sales sample
      ['Odoo Sales AI Chatbot', 'روبوت محادثة أودو للمبيعات'],
      ['AI-powered sales automation and lead qualification', 'أتمتة المبيعات وتأهيل العملاء المحتملين بالذكاء الاصطناعي'],
      ['Recent Sales Opportunities', 'أحدث فرص المبيعات'],
      ['Sales Pipeline', 'خط أنابيب المبيعات'],
      ['Pipeline Value', 'قيمة خط المبيعات'],
      ['AI Performance', 'أداء الذكاء الاصطناعي'],
      ['Opportunity status distribution', 'توزيع حالات الفرص'],
      ['Value by opportunity status', 'القيمة حسب حالة الفرصة'],
      ['AI automation metrics', 'مقاييس أتمتة الذكاء الاصطناعي'],

      // Invoice Collection sample
      ['Invoice Collection Automation', 'أتمتة تحصيل الفواتير'],
      ['AI-powered invoice collection and payment reminders', 'تحصيل الفواتير وتذكيرات الدفع بالذكاء الاصطناعي'],
      ['Recent Invoices', 'أحدث الفواتير'],
      ['Collection Stats', 'إحصائيات التحصيل'],
      ['Collection Timeline', 'الجدول الزمني للتحصيل'],
      ['All Invoices', 'جميع الفواتير'],
      ['Collection Performance', 'أداء التحصيل'],
      ['Customer Payment Behavior', 'سلوك سداد العملاء'],
      ['Key performance indicators', 'مؤشرات الأداء الرئيسية'],
      ['Payment collection progress', 'تقدم تحصيل المدفوعات'],
      ['Complete invoice collection status', 'حالة تحصيل الفواتير كاملة'],
      ['Monthly collection trends', 'اتجاهات التحصيل الشهرية'],
      ['Payment patterns analysis', 'تحليل أنماط السداد'],

      // HR Service sample
      ['HR Service Automation', 'أتمتة خدمات الموارد البشرية'],
      ['AI-powered HR service management and automation', 'إدارة وأتمتة خدمات الموارد البشرية بالذكاء الاصطناعي'],
      ['Recent HR Requests', 'أحدث طلبات الموارد البشرية'],
      ['Request Pipeline', 'خط معالجة الطلبات'],
      ['Request Types', 'أنواع الطلبات'],
      ['By Department', 'حسب القسم'],
      ['Current request status distribution', 'توزيع حالات الطلبات الحالية'],
      ['Distribution by request category', 'التوزيع حسب فئة الطلب'],
      ['Requests by department', 'الطلبات حسب القسم'],

      // Job Application sample
      ['Job Application Automation', 'أتمتة طلبات التوظيف'],
      ['AI-powered job application screening and management', 'فرز وإدارة طلبات التوظيف بالذكاء الاصطناعي'],
      ['Recent Applications', 'أحدث الطلبات'],
      ['Application Pipeline', 'خط معالجة الطلبات'],
      ['Top Positions', 'الوظائف الأعلى طلباً'],
      ['Most applied positions', 'أكثر الوظائف طلباً'],
      ['Applications by department', 'الطلبات حسب القسم'],
      ['Latest job applications and their AI screening results', 'أحدث طلبات التوظيف ونتائج فرزها بالذكاء الاصطناعي'],

      // Lead Generation sample
      ['Lead Generation Dashboard', 'لوحة توليد العملاء'],
      ['Automated lead generation and qualification system', 'نظام آلي لتوليد العملاء وتأهيلهم'],
      ['Recent Leads', 'أحدث العملاء'],
      ['Active Campaigns', 'الحملات النشطة'],
      ['Performance Overview', 'نظرة عامة على الأداء'],
      ['Lead Sources', 'مصادر العملاء'],
      ['Response Time Analysis', 'تحليل أزمنة الاستجابة'],
      ['Lead generation performance over time', 'أداء توليد العملاء مع مرور الوقت'],
      ['Common tasks and shortcuts', 'مهام شائعة واختصارات'],
      ['Latest leads generated by the system', 'أحدث العملاء الذين تم توليدهم بواسطة النظام'],
      ['Current lead generation campaigns and their performance', 'الحملات الحالية وأداؤها'],
      ['Distribution of leads by source', 'توزيع العملاء حسب المصدر'],
      ['Average response times by lead status', 'متوسط أزمنة الاستجابة حسب الحالة'],

      // Other common sample titles
      ['Gmail Email Labelling', 'تصنيف رسائل جي ميل'],
      ['Gmail Campaign', 'حملة جي ميل'],
      ['Email Summary Agent Dashboard', 'لوحة وكيل تلخيص الرسائل'],
      ['Database Chat', 'دردشة قاعدة البيانات'],
      ['RAG Chatbot Dashboard', 'لوحة روبوت الدردشة RAG'],
      ['WhatsApp Sales Dashboard', 'لوحة مبيعات واتساب'],
      ['WhatsApp Product Catalog', 'كتالوج منتجات واتساب'],
      ['WhatsApp AI Responder', 'مجي�� واتساب بالذكاء الاصطناعي'],
      ['Social Media Content Generator', 'مولّد محتوى وسائل التواصل الاجتماعي'],
      ['Client Onboarding Automation', 'أتمتة تهيئة العملاء'],
      ['Automated Lead Generation', 'توليد العملاء آلياً'],
      ['Gmail AI Auto-Responder', 'الرد الآلي لجي ميل بالذكاء الاصطناعي'],
      ['Financial Reports', 'التقارير المالية']
    ]);

    const replaceTextNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const original = node.textContent?.trim();
        if (!original) return;
        if (map.has(original)) {
          node.textContent = node.textContent?.replace(original, map.get(original) as string) || node.textContent;
        }
      } else {
        node.childNodes?.forEach(replaceTextNode);
      }
    };

    replaceTextNode(root);
  }, [i18n.language, t]);

  return (
    <div ref={containerRef} dir={i18n.language === 'ar' ? 'rtl' : undefined}>
      {children}
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <AccessibilityProvider>
            <PerformanceProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <GlobalNotificationService />
                <GlobalMessageService />
                <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  {routes.map((route) => {
                    const { path, component: Component, protected: isProtected, admin: isAdmin, public: isPublic } = route;

                    let WrappedComponent = Component;

                    if (isProtected) {
                      WrappedComponent = () => (
                        <ProtectedRoute>
                          <Component />
                        </ProtectedRoute>
                      );
                    } else if (isAdmin) {
                      WrappedComponent = () => (
                        <AdminRoute>
                          <Component />
                        </AdminRoute>
                      );
                    } else if (isPublic) {
                      WrappedComponent = () => (
                        <PublicRoute>
                          <Component />
                        </PublicRoute>
                      );
                    }

                    const isSample = path.startsWith('/sample-');
                    const Element = (
                      <ErrorBoundary>
                        <Suspense fallback={
                          <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                              <div className="h-8 w-8 animate-spin text-waselify-500 mx-auto mb-4">⏳</div>
                              <p className="text-gray-600">Loading...</p>
                            </div>
                          </div>
                        }>
                          {isSample ? (
                            <SampleI18nOverlay>
                              <WrappedComponent />
                            </SampleI18nOverlay>
                          ) : (
                            <WrappedComponent />
                          )}
                        </Suspense>
                      </ErrorBoundary>
                    );

                    return (
                      <Route
                        key={path}
                        path={path}
                        element={Element}
                      />
                    );
                  })}
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </PerformanceProvider>
        </AccessibilityProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
