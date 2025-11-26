import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
const en = {
  // Navigation
  nav: {
    home: 'Home',
    services: 'Services',
    contact: 'Contact',
    getStarted: 'Get Started',
    clientLogin: 'Client Login',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    skip: 'Skip to main content'
  },

  // Hero Section
  hero: {
    title: 'Save 20+ Hours Per Week with Custom AI Workflows',
    subtitle: 'We build intelligent automation that handles your repetitive tasks - from lead generation to customer support. Deploy proven workflows that integrate with your existing tools and start saving time immediately.',
    cta: 'Get Free Consultation',
    chip: 'Purpose'
  },

  // Features Section
  features: {
    chip: 'Features',
    title: 'Proven Workflows That Save Real Time',
    subtitle: 'These are our most successful AI workflows that businesses use to automate their operations. Each workflow is battle-tested and delivers measurable results.',
    workflow1: {
      title: 'LinkedIn & Google Maps Lead Generation',
      description: 'Automatically finds potential clients on LinkedIn and Google Maps based on your criteria, extracts their contact info, and sends personalized outreach emails using your templates.|||Result: 50-100 targeted leads/month, 15-25% response rate, saves 10 hours/week of manual prospecting.'
    },
    workflow2: {
      title: 'Automated Client Onboarding',
      description: 'Sends welcome emails, collects signed contracts via DocuSign, schedules kickoff meetings in Calendly, and creates project folders in Google Drive automatically.|||Result: Reduces onboarding time from 3 days to 1 day, ensures no documents are missed, improves client experience.'
    },
    workflow3: {
      title: 'WhatsApp Product Catalog Bot',
      description: 'ChatGPT-powered WhatsApp bot that answers product questions, shows pricing, processes orders, and books consultations using your product database.|||Result: 24/7 customer support, 2-minute response time, 30% increase in after-hours sales.'
    },
    workflow4: {
      title: 'Automated Invoice Follow-up',
      description: 'Monitors your accounting software for overdue invoices and sends escalating reminders via email and WhatsApp. Integrates with QuickBooks, Xero, or FreshBooks.|||Result: 50% faster payment collection, reduces late payments by 70%, saves 5 hours/week of manual follow-up.'
    },
    workflow5: {
      title: 'Company Knowledge Chatbot',
      description: 'AI chatbot that reads your company documents (policies, procedures, FAQs) and answers employee questions instantly. Automatically updates when you add new documents to Google Drive.|||Result: Instant answers to common questions, reduces HR workload by 40%, improves employee satisfaction.'
    },
    workflow6: {
      title: 'WhatsApp HR Assistant',
      description: 'WhatsApp bot that handles leave requests, answers HR FAQs, tracks attendance, and screens job applications using AI. Routes complex issues to human HR staff.|||Result: 24/7 HR support, 60% reduction in routine HR inquiries, faster candidate screening.'
    }
  },

  // Additional Workflows Section
  additionalWorkflows: {
    chip: 'More Solutions',
    title: 'Specialized Automation Solutions',
    subtitle: 'Beyond our flagship workflows, we offer specialized automation solutions for every business need.',
    categories: {
      sales: {
        title: 'Sales & Marketing',
        workflows: [
          'WhatsApp Product Catalog Bot',
          'Gmail Campaign Sender',
          'AI-Powered Social Media Content Generator',
          'Gmail Outreach with Auto Follow-Up'
        ]
      },
      support: {
        title: 'Customer Support',
        workflows: [
          'Email Summary Agent',
          'Chat with Database using AI',
          'Website Chatbot',
          'Gmail AI Auto-Responder',
          'Customer Support Automation'
        ]
      },
      finance: {
        title: 'Finance & Accounting',
        workflows: [
          'Generate Monthly Financial Reports',
          'Gmail Email Labelling',
          'Automated Expense Tracking'
        ]
      },
      hr: {
        title: 'Human Resources',
        workflows: [
          'Job Application Submissions with AI',
          'WhatsApp Dietitian AI Chatbot',
          'Employee Onboarding Automation'
        ]
      },
      crm: {
        title: 'CRM & Operations',
        workflows: [
          'AI Chatbot for Odoo Sales',
          'Local Chatbot with RAG',
          'Customer Data Sync Automation'
        ]
      }
    },
    learnMore: 'Learn More →',
    note: 'All workflows are fully customizable and can be integrated with your existing tools and systems.',
    getQuote: 'Get Custom Quote'
  },

  // Specs Section
  specs: {
    chip: 'Specs',
    title: 'Why Choose Waselify',
    description: 'We build custom automation workflows using proven AI tools (ChatGPT, Claude) and integrate them with your existing software (WhatsApp, Gmail, Google Sheets, etc.). No coding required - just tell us what you want automated and we handle the rest.'
  },

  // Humanoid Section
  humanoid: {
    chip: 'Process',
    title: 'The Problem & Solution',
    problem: {
      title: 'The Problem',
      description: 'Your team wastes 20+ hours per week on repetitive tasks like sending follow-up emails, collecting payments, and answering the same customer questions. This time could be spent on growing your business.'
    },
    solution: {
      title: 'The Solution',
      description: 'Custom AI workflows that handle these tasks automatically using your existing tools and business rules. Deploy in 2-3 weeks, start saving time immediately.'
    },
    outcome: {
      title: 'The Outcome',
      description: 'Your team focuses on high-value work while automation handles the routine tasks in the background. See results in the first week.'
    }
  },

  // Image Showcase
  imageShowcase: {
    title: 'Simple 3-Step Process',
    subtitle: 'From discovery to live automation in 2-3 weeks. No technical knowledge required.',
    step1: 'Discovery Call (30 min)',
    step1Desc: 'We discuss your current processes, identify automation opportunities, and agree on the scope.',
    step2: 'Design & Build (1-2 weeks)',
    step2Desc: 'We design your custom workflows, integrate with your tools, and test everything thoroughly.',
    step3: 'Launch & Train (1 week)',
    step3Desc: 'We launch your automation, train your team, and provide ongoing support.',
    cta: 'Ready to Save 20+ Hours Per Week?',
    ctaDesc: 'Join businesses that have automated their operations with Waselify. Get your free consultation today.'
  },

  // Testimonials
  testimonials: {
    chip: 'Vision',
    title: 'From the Founder',
    quote: '"I started Waselify because I was tired of watching brilliant people waste their time on repetitive, soul-draining tasks.\n\nWhether it\'s onboarding clients, chasing payments, or replying to the same message for the 23rd time — it doesn\'t have to be this way.\n\nWaselify builds smart, AI-powered workflows that run your business in the background — so you can focus on growing it. We\'re just getting started, and I\'d love for you to be part of this journey."',
    author: 'Taha Mazher, Founder'
  },

  // Details Section
  details: {
    benefits: {
      title: 'The Benefits',
      subtitle: 'Waselify\'s AI automation saves 10-20 hours per week while giving your team full control through our secure client portal. Monitor, trigger, and optimize workflows with real-time analytics.',
      taskReduction: 'Task Reduction:',
      taskReductionValue: 'Save 10-20 hours per week',
      integrations: 'Integrations:',
      integrationsValue: 'Works with your existing tools',
      monitoring: 'Monitoring:',
      monitoringValue: '24/7 real-time analytics',
      successRate: 'Success Rate:',
      successRateValue: '95%+ uptime with monitoring',
      clientPortal: 'Client Portal:',
      clientPortalValue: 'Full control & visibility'
    },
    startAutomating: {
      chip: 'Get Started',
      title: 'Start Automating',
      subtitle: 'Get your free consultation and see how automation can transform your business',
      form: {
        fullName: 'Full Name',
        email: 'Email Address',
        company: 'Company (Optional)',
        submit: 'Get Free Consultation'
      }
    }
  },

  // Newsletter
  newsletter: {
    chip: 'Newsletter',
    title: 'Get Automation Tips & Updates',
    subtitle: 'Receive monthly tips on business automation, case studies from real clients, and updates on new workflow templates.',
    placeholder: 'Email address',
    submit: 'Submit',
    success: 'Thank you for subscribing! You\'ll receive automation tips and updates from Waselify soon.'
  },

  // Footer
  footer: {
    copyright: '© 2024 Waselify. All rights reserved.',
    description: 'Freelance AI automation specialist in Qatar. We build custom workflows that save you time and money using your existing tools.',
    location: 'Doha, Qatar',
    contact: 'Contact',
    name: 'Taha Mazher',
    designation: 'AI Automation Specialist',
    legal: 'Independent consultant providing automation services. Each project is customized to your specific needs.'
  },

  // Authentication
  auth: {
    login: {
      title: 'Client Portal',
      subtitle: 'Access your automation workflows and project status',
      email: 'Email Address',
      emailPlaceholder: 'your@email.com',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      signIn: 'Sign In',
      noAccount: 'Don\'t have an account?',
      signUp: 'Sign up'
    },
    passwordRequirements: {
      title: 'Password Requirements:',
      length: 'At least 8 characters',
      uppercase: 'One uppercase letter',
      lowercase: 'One lowercase letter',
      number: 'One number',
      special: 'One special character'
    },
    signup: {
      title: 'Create Your Account',
      subtitle: 'Join Waselify and start automating your business',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter your full name',
      email: 'Email Address',
      emailPlaceholder: 'your@email.com',
      password: 'Password',
      passwordPlaceholder: 'Create a password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your password',
      createAccount: 'Create Account',
      creatingAccount: 'Creating Account...',
      alreadyHaveAccount: 'Already have an account?',
      signIn: 'Sign in',
      errors: {
        fillAllFields: 'Please fill in all fields',
        passwordsDontMatch: 'Passwords don\'t match',
        passwordRequirements: 'Password doesn\'t meet requirements',
        invalidEmail: 'Please enter a valid email address',
        signupFailed: 'Signup failed',
        somethingWentWrong: 'Something went wrong',
        tryAgainLater: 'Please try again later.'
      },
      success: {
        title: 'Account created successfully!',
        description: 'Please check your email to verify your account.'
      }
    },
    resetPassword: {
      title: 'Reset Your Password',
      subtitle: 'Enter your new password below. Make sure it meets all security requirements.',
      password: 'New Password',
      passwordPlaceholder: 'Enter your new password',
      confirmPassword: 'Confirm New Password',
      confirmPasswordPlaceholder: 'Confirm your new password',
      resetPassword: 'Reset Password',
      resettingPassword: 'Resetting Password...',
      backToLogin: 'Back to Login',
      invalidToken: 'Invalid Reset Link',
      invalidTokenDesc: 'This password reset link is invalid or has expired. Please request a new one.',
      requestNewLink: 'Request New Link',
      errors: {
        passwordRequirements: 'Password requirements not met',
        passwordRequirementsDesc: 'Please ensure your password meets all requirements.',
        passwordsDontMatch: 'Passwords don\'t match',
        passwordsDontMatchDesc: 'Please make sure both passwords are identical.',
        resetFailed: 'Password reset failed',
        somethingWentWrong: 'Something went wrong',
        tryAgainLater: 'Please try again later.'
      },
      success: {
        title: 'Password updated successfully!',
        description: 'You can now sign in with your new password.'
      },
      updatePassword: 'Update Password',
      updatingPassword: 'Updating Password...',
      passwordsMatch: 'Passwords match',
      backToSignIn: 'Back to Sign In'
    },
    forgotPassword: {
      title: 'Forgot Password?',
      subtitle: 'Enter your email address and we\'ll send you a link to reset your password.',
      email: 'Email Address',
      emailPlaceholder: 'your@email.com',
      sendResetLink: 'Send Reset Link',
      sendingLink: 'Sending Link...',
      backToLogin: 'Back to Login',
      success: {
        title: 'Password reset email sent!',
        description: 'Check your email for instructions to reset your password.'
      }
    }
  },

  // Dashboard
  dashboard: {
    title: 'Client Portal',
    subtitle: 'Welcome back! Here\'s an overview of your automation workflows and their performance.',
    stats: {
      activeWorkflows: 'Active Workflows',
      totalRuns: 'Total Runs Today',
      successRate: 'Success Rate'
    },
    workflows: {
      title: 'Your Workflows',
      newWorkflow: 'New Workflow',
      noWorkflows: 'No Workflows Yet',
      noWorkflowsDesc: 'You haven\'t set up any automation workflows yet. Click the button above to get started.',
      requestFirst: 'Request Your First Workflow',
      browseMarketplace: 'Browse Marketplace',
      noWorkflowsPurchasedDesc: "You haven't purchased any workflows yet. Browse the marketplace to get started."
    },
    searchPlaceholder: 'Search workflows...',
    quickActions: {
      title: 'Quick Actions',
      subtitle: 'Common tasks and shortcuts for managing your automations',
      requestNew: 'Request New Workflow',
      modifyExisting: 'Modify Existing',
      supportRequest: 'Support Request'
    },
    managePurchased: 'Manage your purchased automation workflows ({{count}} active)',
    lastRun: 'Last run: {{when}}',
    browseAll: 'Browse All Workflows',
    toasts: {
      loadPermissionsDesc: 'Could not load your workflow permissions. Some features may be limited.',
      loadFailedDesc: 'Failed to load workflows'
    }
  },

  // Marketplace
  marketplace: {
    title: 'Workflow Marketplace',
    subtitle: 'Choose from our ready-to-deploy automation workflows. Each workflow is customized for your business needs.',
    backToDashboard: 'Back to Dashboard',
    selected: 'selected',
    purchaseSelected: 'Purchase Selected',
    searchPlaceholder: 'Search workflows...',
    noResults: 'No workflows match your search criteria.',
    features: 'Features:',
    moreFeatures: 'more features',
    available: 'Available',

    // Added keys for full localization of Marketplace UI
    allCategories: 'All Categories',
    requestCustomWorkflow: 'Request Custom Workflow',
    banner: {
      needCustomTitle: 'Need Something Custom?',
      needCustomDesc: "Can't find the perfect workflow for your business? We can create custom automation solutions tailored to your specific needs and requirements.",
      featureCustomDev: 'Custom Development',
      featureTailored: 'Tailored Solutions',
      featureExpertSupport: 'Expert Support',
      cta: 'Request Custom Workflow'
    },
    cart: {
      selectedWorkflows: 'Selected Workflows',
      remove: 'Remove',
      totalSetupCost: 'Total Setup Cost:',
      totalMonthlyCost: 'Total Monthly Cost:'
    },
    setupCost: 'Setup Cost:',
    monthlyCost: 'Monthly Cost:',
    setupShort: 'setup',
    monthlyShort: 'monthly',
    owned: 'Owned',
    dashboard: 'Dashboard',
    requestAccess: 'Request Access',
    sampleDashboard: 'Sample Dashboard',
    contactForCost: 'Contact for cost',
    complexity: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard'
    }
  },

  // Custom Workflow Request Form
  customRequestForm: {
    dialogTitle: 'Request Custom Workflow',
    dialogDesc: 'Submit a request for a custom automation workflow tailored to your specific business needs.',
    headerTitle: 'Custom Workflow Development',
    headerBody: "Can't find what you need in our marketplace? Tell us about your specific requirements and we'll create a custom automation solution for your business.",
    basicInfo: 'Basic Information',
    workflowName: 'Workflow Name *',
    description: 'Brief Description *',
    businessProblem: 'Business Problem *',
    expectedOutcome: 'Expected Outcome',
    targetUsers: 'Target Users',
    requirementsTimeline: 'Requirements & Timeline',
    urgencyLevel: 'Urgency Level',
    timeline: 'Timeline',
    technicalRequirements: 'Technical Requirements',
    integrations: 'Required Integrations',
    additionalNotes: 'Additional Notes',
    currentPriority: 'Current Priority:',
    priorityHint: "We'll prioritize your request based on this selection",
    submit: 'Submit Custom Workflow Request',
    submitting: 'Submitting...',
    cancel: 'Cancel',
    placeholders: {
      workflowName: 'e.g., Customer Feedback Analysis System',
      description: 'Describe what this workflow should do...',
      businessProblem: 'What problem are you trying to solve?',
      expectedOutcome: 'What results do you expect from this automation?',
      targetUsers: 'e.g., Sales team, Customer support, Marketing',
      technicalRequirements: 'Any specific technical requirements, APIs, or platforms...',
      integrations: 'e.g., Salesforce, HubSpot, Gmail, WhatsApp Business API...',
      additionalNotes: 'Any other information that might help us understand your needs...'
    },
    timelineOptions: {
      within1Week: 'Within 1 week',
      within2Weeks: 'Within 2 weeks',
      within1Month: 'Within 1 month',
      within3Months: 'Within 3 months',
      noDeadline: 'No specific deadline',
      toBeDiscussed: 'To be discussed'
    },
    urgencyOptions: {
      low: 'Low Priority',
      medium: 'Medium Priority',
      high: 'High Priority',
      urgent: 'Urgent'
    },
    toasts: {
      authRequiredTitle: 'Authentication Required',
      authRequiredDesc: 'Please log in to submit a custom workflow request.',
      missingInfoTitle: 'Missing Information',
      missingInfoDesc: 'Please fill in all required fields.',
      submittedTitle: 'Request Submitted',
      submittedDesc: "Your custom workflow request has been submitted successfully. We'll review it and get back to you soon.",
      failedTitle: 'Submission Failed',
      failedDesc: 'Failed to submit your request. Please try again.'
    }
  },

  // How It Works
  howItWorks: {
    chip: 'How It Works',
    title: 'How Waselify Transforms Your Business',
    subtitle: 'A streamlined four-step process from discovery to full automation deployment.',
    step1: {
      title: 'Discovery & Analysis',
      description: 'We start with a 30-minute call to understand your current processes, identify repetitive tasks, and map out automation opportunities that will save you the most time.'
    },
    step2: {
      title: 'Custom Design & Build',
      description: 'Our team builds your automation workflows using proven AI tools, integrates them with your existing software, and thoroughly tests everything before launch.'
    },
    step3: {
      title: 'Integration & Testing',
      description: 'We deploy your custom AI workflows, conduct thorough testing, and ensure everything works perfectly with your existing infrastructure.'
    },
    step4: {
      title: 'Launch & Support',
      description: 'Your AI automation goes live! Monitor performance through our client portal, trigger workflows on-demand, and get ongoing support.'
    }
  },

  // FAQ
  faq: {
    chip: 'FAQ',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about AI automation and how Waselify can transform your business workflows.',
    q1: {
      question: 'How long does it take to build my automation?',
      answer: 'Most workflows are ready in 7-14 days. Simple automations like email sequences can be live in 3-5 days, while complex integrations with multiple platforms may take 3-4 weeks. We start with a discovery call, then build and test thoroughly before launch to ensure everything works perfectly.'
    },
    q2: {
      question: 'How much does automation cost?',
      answer: 'Pricing depends on complexity and integrations needed. Simple email automation: 1,500 QAR setup + 300 QAR/month. WhatsApp bot with product catalog: 3,000 QAR setup + 500 QAR/month. Custom workflows: 5,000+ QAR setup + 800+ QAR/month. All prices include setup, training, and 3 months of support.'
    },
    q3: {
      question: 'What tools do you integrate with?',
      answer: 'We integrate with 100+ popular business tools including WhatsApp, Gmail, Google Sheets, Notion, Airtable, Slack, Trello, Asana, Zapier, and most CRM systems. If you have a specific tool you use, we can likely integrate with it. We also build custom integrations when needed.'
    },
    q4: {
      question: 'Do I need technical knowledge?',
      answer: 'Not at all! We handle all the technical setup and provide you with a simple client portal to monitor and trigger your workflows. We\'re always available for support. The goal is to make automation accessible to everyone.'
    },
    q5: {
      question: 'What happens after launch?',
      answer: 'After launch, you get 24/7 support and monitoring. We can make adjustments as needed. You\'ll have access to our support channel for ongoing assistance, and we offer maintenance packages for continuous optimization.'
    },
    q6: {
      question: 'How quickly will I see results?',
      answer: 'Email automations and customer support workflows show results within 24 hours. Lead generation workflows typically show improved efficiency within 2-3 weeks as the automation learns your target audience and optimizes outreach strategies.'
    },
    q7: {
      question: 'What if something goes wrong?',
      answer: 'We monitor all workflows 24/7 and provide instant alerts if anything needs attention. You get a dedicated support channel for immediate assistance. Most issues are resolved within hours, and we have backup systems in place to ensure your automation keeps running smoothly.'
    },
    q8: {
      question: 'Can I modify the automation later?',
      answer: 'Absolutely! Your automation is designed to grow with your business. We can add new features, integrate additional tools, or modify workflows as your needs change. Most modifications are quick and affordable.'
    },
    q9: {
      question: 'Is my data secure?',
      answer: 'Yes, security is our top priority. We use enterprise-grade encryption and secure connections for all integrations. Your client portal is password-protected, and we follow strict data protection protocols. We never store sensitive information unnecessarily and can work with your existing security requirements.'
    }
  },

  // Made By Humans
  madeByHumans: {
    title: 'Made by AI & Human'
  },

  // CTA Section
  cta: {
    chip: 'Get Started',
    title: 'Ready to Save 10-20 Hours Per Week?',
    subtitle: 'Join other businesses that have automated their repetitive tasks with custom AI workflows. Start your automation journey today.',
    primaryButton: 'Get Free Consultation',
    secondaryButton: 'Stay Updated'
  },

  // Contact
  contact: {
    title: 'Get in Touch',
    subtitle: 'Ready to automate your business? Let\'s talk about your needs.',
    form: {
      name: 'Full Name',
      email: 'Email Address',
      company: 'Company Name',
      message: 'Tell us about your automation needs',
      submit: 'Send Message',
      sending: 'Sending...'
    },
    success: {
      title: 'Message Sent!',
      description: 'We\'ll get back to you within 24 hours.'
    }
  },

  // Common
  common: {
    loading: 'Loading...',
    saving: 'Saving...',
    error: 'An error occurred',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',
    securityNotice: 'Secure Connection • Your data is protected with enterprise-grade encryption',
    warning: 'Warning',
    send: 'Send',
    active: 'Active',
    never: 'Never',
    openDashboard: 'Open Dashboard',
    backToDashboard: 'Back to Dashboard'
  },

  // Notifications
  notifications: {
    title: 'Notifications',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications',
    noNotificationsDesc: 'You\'re all caught up! Check back later for updates.',
    loading: 'Loading notifications...',
    type: {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    },
    time: {
      justNow: 'Just now',
      hoursAgo: '{{count}} hours ago',
      dayAgo: '1 day ago',
      daysAgo: '{{count}} days ago'
    }
  },

  // Messages
  messages: {
    title: 'Messages',
    loading: 'Loading...',
    noRequests: 'No requests yet.',
    customRequest: 'Custom Workflow Request',
    awaitingResponse: 'Awaiting Response',
    status: {
      pending: 'pending',
      approved: 'approved',
      denied: 'denied',
      expired: 'expired'
    },
    workflow: 'Workflow',
    selectConversation: 'Select a conversation',
    markAsRead: 'Mark as Read',
    noMessagesYet: 'No messages yet.',
    inputPlaceholder: 'Type your message...',
    toast: {
      newFromAdminTitle: 'New message from admin',
      newFromAdminDesc: 'You have a new message about "{{workflow}}": {{preview}}'
    }
  },

  // Services
  services: {
    globalNotificationService: {
      title: 'Notification service is active',
      description: 'Monitoring for new notifications'
    }
  },

  // Settings
  settings: {
    title: 'Settings',
    profileLabel: 'Profile',
    notificationsLabel: 'Notifications',
    securityLabel: 'Security',
    appearanceLabel: 'Appearance',
    signOut: 'Sign Out',
    close: 'Close',
    loading: 'Loading settings...',
    profileSettings: {
      title: 'Profile Settings',
      fullName: 'Full Name',
      email: 'Email Address',
      company: 'Company',
      phone: 'Phone Number',
      position: 'Position',
      save: 'Save Changes',
      updatedToastTitle: 'Profile updated',
      updatedToastDesc: 'Your profile has been updated successfully.',
      updateErrorTitle: 'Error',
      updateErrorDesc: 'Failed to update profile. Please try again.',
      signedOutTitle: 'Signed out',
      signedOutDesc: 'You have been successfully signed out.',
      notSet: 'Not set'
    },
    notificationSettings: {
      title: 'Notification Preferences',
      emailNotifications: 'Email Notifications',
      emailNotificationsDesc: 'Receive notifications via email',
      workflowAlerts: 'Workflow Alerts',
      workflowAlertsDesc: 'Get notified about workflow status changes',
      systemUpdates: 'System Updates',
      systemUpdatesDesc: 'Receive updates about new features and maintenance'
    },
    securitySettings: {
      title: 'Security Settings',
      twoFactorAuth: 'Two-Factor Authentication',
      twoFactorAuthDesc: 'Add an extra layer of security to your account',
      sessionTimeout: 'Session Timeout',
      timeouts: {
        '1h': '1 hour',
        '8h': '8 hours',
        '24h': '24 hours',
        '7d': '7 days'
      }
    },
    appearanceSettings: {
      title: 'Appearance Settings',
      language: 'Language',
      compactMode: 'Compact Mode',
      compactModeDesc: 'Use a more compact layout'
    }
  },

  // 404 Not Found
  notFound: {
    title: '404',
    subtitle: 'Oops! Page not found',
    returnHome: 'Return to Home'
  },

  // Category display names (used for dynamic marketplace tags)
  categories: {
    marketing: 'Marketing',
    finance: 'Finance',
    support: 'Support',
    data: 'Data',
    hr: 'HR',
    operations: 'Operations',
    sales: 'Sales',
    ai: 'AI',
    crm: 'CRM',
    'social-media': 'Social Media'
  },

};

// Arabic translations
const ar = {
  // Navigation
  nav: {
    home: 'الرئيسية',
    services: 'الخدمات',
    contact: 'اتصل بنا',
    getStarted: 'ابدأ',
    clientLogin: 'دخول العملاء',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    signOut: 'تسجيل الخروج'
  },

  // Hero Section
  hero: {
    title: 'أتمتة مهام عملك بالذكاء الاصطناعي',
    subtitle: 'نبني مسارات عمل ذكية مخصصة تتعامل مع مهامك المتكررة - من توليد العملاء المحتملين إلى دعم العملاء. وفر 10-20 ساعة أسبوعياً مع أتمتة ذكية تعمل مع أدواتك الموجودة.',
    cta: 'احصل على استشارة مجانية',
    chip: 'الهدف'
  },

  // Features Section
  features: {
    chip: 'الميزات',
    title: 'مسارات العمل الرئيسية',
    subtitle: 'هذه هي أكثر مسارات عمل الذكاء الاصطناعي شعبية ومثبتة التي تنشرها الشركات لأتمتة عملياتها. كل واحد جاهز للاستخدام وقابل للتخصيص بالكامل لاحتياجاتك.',
    workflow1: {
      title: 'أتمتة توليد العملاء المحتملين',
      description: 'يستخرج الذكاء الاصطناعي العملاء المحتملين من المصادر عبر الإنترنت، يسلم تفاصيل الاتصال الخاصة بهم إليك، ويرسل لهم رسائل بريد إلكتروني مخصصة تلقائياً — كل ذلك بدون جهد يدوي.|||النتيجة: 200+ عميل محتمل مؤهل/شهر، معدل استجابة 40%.'
    },
    workflow2: {
      title: 'أتمتة استقبال العملاء',
      description: 'أرسل رسائل ترحيب، اجمع المستندات، حدد مواعيد الاجتماعات، وابدأ المشاريع — كل ذلك من خلال الأتمتة. يبسط عملية استقبال العملاء بالكامل من أول اتصال إلى بدء المشروع.|||النتيجة: استقبال أسرع بنسبة 95%، معدل جمع المستندات 100%، تحسين رضا العملاء.'
    },
    workflow3: {
      title: 'روبوت واتساب / كتالوج المنتجات',
      description: 'مكن العملاء من استكشاف منتجاتك أو الحصول على الدعم فوراً على واتساب مع روبوت ذكي وعلامة تجارية.|||النتيجة: دعم العملاء على مدار الساعة، وقت استجابة أسرع بنسبة 60%.'
    },
    workflow4: {
      title: 'نظام تحصيل الفواتير الذكي',
      description: 'أرسل الفواتير تلقائياً، تابع المدفوعات، وتأكد من الإيصالات — متكامل مع منصة الدفع عبر الإنترنت التي تختارها.|||النتيجة: تحصيل مدفوعات أسرع بنسبة 70%، تقليل المدفوعات المتأخرة بنسبة 90%.'
    },
    workflow5: {
      title: 'روبوت الدردشة للوثائق',
      description: 'روبوت ذكاء اصطناعي يجيب على أسئلة الموظفين بناءً على وثائق الشركة المخزنة في جوجل درايف. يفهرس الوثائق الجديدة تلقائياً ويوفر معلومات دقيقة ومحدثة.|||النتيجة: وصول فوري لمعرفة الشركة، 85% من الاستفسارات يتم حلها تلقائياً، تحسين إنتاجية الموظفين.'
    },
    workflow6: {
      title: 'نظام أتمتة الموارد البشرية',
      description: 'أتمتة الموارد البشرية القائمة على واتساب التي تصنف الرسائل باستخدام الذكاء الاصطناعي وتوجهها للوكلاء المناسبين. تتعامل مع موافقات الإجازات، الحضور، الأسئلة الشائعة، واختيار المرشحين.|||النتيجة: معالجة أسرع للموارد البشرية بنسبة 90%، دعم الموارد البشرية على مدار الساعة، تقليل العبء اليدوي.'
    }
  },

  // Specs Section
  specs: {
    chip: 'المواصفات',
    title: 'الفرق في واصلِفاي',
    description: 'على عكس أدوات الأتمتة التقليدية، يجمع واصلِفاي الذكاء الاصطناعي مع التكاملات التجارية السلسة. نحن لا نؤتمت المهام فحسب - بل نبني مسارات عمل تتعلم وتتكيف وتنمو مع عملك.'
  },

  // Humanoid Section
  humanoid: {
    chip: 'العملية',
    title: 'المشكلة والحل',
    problem: {
      title: 'المشكلة',
      description: 'العمليات اليدوية تقتل إنتاجيتك وتكلفك المال. فريقك عالق في أداء مهام متكررة بدلاً من تطوير عملك.'
    },
    solution: {
      title: 'الحل',
      description: 'أتمتة ذكية تعمل على مدار الساعة. نبني مسارات عمل مخصصة تتعامل مع مهامك المتكررة، حتى تتمكن من التركيز على ما يهم أكثر.'
    },
    outcome: {
      title: 'النتيجة',
      description: 'زيادة الكفاءة، تقليل التكاليف، ونمو قابل للتطوير. عملك يعمل بسلاسة أكبر أثناء نومك.'
    }
  },

  // Image Showcase
  imageShowcase: {
    title: 'البدء سهل',
    subtitle: 'من أول مكالمة إلى الأتمتة الحية في أسبوع واحد فقط. لا إعداد معقد، لا صداع تقني - فقط نتائج.',
    step1: 'شارك مسارات العمل',
    step1Desc: 'مكالمة مدتها 15 دقيقة لفهم عملياتك الحالية وتحديد فرص الأتمتة.',
    step2: 'تصميم وبناء',
    step2Desc: 'يصمم فريقنا مسارات عمل الذكاء الاصطناعي المخصصة لك ويدمجها مع أدواتك الموجودة.',
    step3: 'نشر وتدريب',
    step3Desc: 'أطلق أتمتتك ودرب فريقك. دعم كامل أثناء الانتقال.',
    cta: 'هل أنت مستعد لتحويل عملك؟',
    ctaDesc: 'انضم إلى القائمة المتزايدة من الشركات التي أتمتت عملياتها مع واصلِفاي. ابدأ رحلتك نحو الكفاءة اليوم.'
  },

  // Testimonials
  testimonials: {
    chip: 'الرؤية',
    title: 'من المؤسس',
    quote: 'بدأت واصلِفاي لأنني كنت متعباً من مشاهدة الأشخاص الأذكياء يضيعون وقتهم في مهام متكررة ومتعبة. سواء كان ذلك في استقبال العملاء، أو متابعة المدفوعات، أو الرد على نفس الرسالة للمرة الثالثة والعشرين — لا يجب أن يكون الأمر كذلك. يبني واصلِفاي مسارات عمل ذكية مدعومة بالذكاء الاصطناعي تعمل عملك في الخلفية — حتى تتمكن من التركيز على تطويره. نحن في البداية فقط، وأود أن تكون جزءاً من هذه الرحلة.',
    author: 'طه مظهر، المؤسس'
  },

  // Details Section
  details: {
    benefits: {
      title: 'الفوائد',
      subtitle: 'أتمتة واصلِفاي للذكاء الاصطناعي تقلل المهام اليدوية بنسبة 80% مع إعطاء فريقك سيطرة كاملة من خلال بوابة العملاء الآمنة. راقب، وشغل، وحسن مسارات العمل مع التحليلات في الوقت الفعلي.',
      taskReduction: 'تقليل المهام:',
      taskReductionValue: 'وفر 10-20 ساعة أسبوعياً',
      integrations: 'التكاملات:',
      integrationsValue: 'تعمل مع أدواتك الموجودة',
      monitoring: 'المراقبة:',
      monitoringValue: 'تحليلات في الوقت الفعلي على مدار الساعة',
      successRate: 'معدل النجاح:',
      successRateValue: '95%+ توفر مع المراقبة',
      clientPortal: 'بوابة العملاء:',
      clientPortalValue: 'سيطرة كاملة وشفافية'
    },
    startAutomating: {
      chip: 'ابدأ',
      title: 'ابدأ الأتمتة',
      subtitle: 'احصل على استشارة مجانية وشاهد كيف يمكن للأتمتة تحويل عملك',
      form: {
        fullName: 'الاسم الكامل',
        email: 'عنوان البريد الإلكتروني',
        company: 'الشركة (اختياري)',
        submit: 'احصل على استشارة مجانية'
      }
    }
  },

  // Newsletter
  newsletter: {
    chip: 'النشرة الإخبارية',
    title: 'ابق محدثاً مع أتمتة الذكاء الاصطناعي',
    subtitle: 'احصل على نصائح أتمتة قابلة للتنفيذ، ومسارات عمل رابحة للعملاء، وتحديثات حصرية — مباشرة إلى بريدك الإلكتروني.',
    placeholder: 'عنوان البريد الإلكتروني',
    submit: 'إرسال',
    success: 'شكراً لاشتراكك! ستحصل على نصائح وتحديثات الأتمتة من واصلِفاي قريباً.'
  },

  // Footer
  footer: {
    copyright: '© 2024 واصلِفاي. جميع الحقوق محفوظة.',
    description: 'مستقل متخصص في أتمتة الذكاء الاصطناعي في قطر. نبني مسارات عمل مخصصة توفر لك الوقت والمال باستخدام أدواتك الموجودة.',
    location: 'الدوحة، قطر',
    contact: 'اتصل بنا',
    name: 'طه مظهر',
    designation: 'متخصص أتمتة الذكاء الاصطناعي',
    legal: 'مستقل يوفر خدمات أتمتة الذكاء الاصطناعي. الخدمات تخضع لاتفاقيات فردية.'
  },

  // Authentication
  auth: {
    login: {
      title: 'بوابة العملاء',
      subtitle: 'الوصول إلى مسارات عمل الأتمتة وحالة المشروع',
      email: 'عنوان البريد الإلكتروني',
      emailPlaceholder: 'your@email.com',
      password: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      rememberMe: 'تذكرني',
      forgotPassword: 'نسيت كلمة المرور؟',
      signIn: 'تسجيل الدخول',
      noAccount: 'ليس لديك حساب؟',
      signUp: 'إنشاء حساب'
    },
    passwordRequirements: {
      title: 'متطلبات كلمة المرور:',
      length: '8 أحرف على الأقل',
      uppercase: 'حرف كبير واحد',
      lowercase: 'حرف صغير واحد',
      number: 'رقم واحد',
      special: 'رمز خاص واحد'
    },
    signup: {
      title: 'إنشاء حسابك',
      subtitle: 'انضم إلى واصلِفاي وابدأ أتمتة عملك',
      fullName: 'الاسم الكامل',
      fullNamePlaceholder: 'أدخل اسمك الكامل',
      email: 'عنوان البريد الإلكتروني',
      emailPlaceholder: 'your@email.com',
      password: 'كلمة المرور',
      passwordPlaceholder: 'أنشئ كلمة مرور',
      confirmPassword: 'تأكيد كلمة المرور',
      confirmPasswordPlaceholder: 'أكد كلمة المرور',
      createAccount: 'إنشاء حساب',
      creatingAccount: 'جاري إنشاء الحساب...',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      signIn: 'تسجيل الدخول',
      errors: {
        fillAllFields: 'يرجى ملء جميع الحقول',
        passwordsDontMatch: 'كلمات المرور غير متطابقة',
        passwordRequirements: 'كلمة المرور لا تستوفي المتطلبات',
        invalidEmail: 'يرجى إدخال عنوان بريد إلكتروني صحيح',
        signupFailed: 'فشل إنشاء الحساب',
        somethingWentWrong: 'حدث خطأ ما',
        tryAgainLater: 'يرجى المحاولة مرة أخرى لاحقاً.'
      },
      success: {
        title: 'تم إنشاء الحساب بنجاح!',
        description: 'يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.'
      }
    },
    resetPassword: {
      title: 'إعادة تعيين كلمة المرور',
      subtitle: 'أدخل كلمة المرور الجديدة أدناه. تأكد من أنها تستوفي جميع متطلبات الأمان.',
      password: 'كلمة المرور الجديدة',
      passwordPlaceholder: 'أدخل كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور الجديدة',
      confirmPasswordPlaceholder: 'أكد كلمة المرور الجديدة',
      resetPassword: 'إعادة تعيين كلمة المرور',
      resettingPassword: 'جاري إعادة تعيين كلمة المرور...',
      backToLogin: 'العودة إلى تسجيل الدخول',
      invalidToken: 'رابط إعادة التعيين غير صحيح',
      invalidTokenDesc: 'رابط إعادة تعيين كلمة المرور هذا غير صحيح أو انتهت صلاحيته. يرجى طلب رابط جديد.',
      requestNewLink: 'طلب رابط جديد',
      errors: {
        passwordRequirements: 'متطلبات كلمة المرور غير مستوفاة',
        passwordRequirementsDesc: 'يرجى التأكد من أن كلمة المرور تستوفي جميع المتطلبات.',
        passwordsDontMatch: 'كلمات المرور غير متطابقة',
        passwordsDontMatchDesc: 'يرجى التأكد من أن كلمتي المرور متطابقتان.',
        resetFailed: 'فشل إعادة تعيين كلمة المرور',
        somethingWentWrong: 'حدث خطأ ما',
        tryAgainLater: 'يرجى المحاولة مرة أخرى لاحقاً.'
      },
      success: {
        title: 'تم تحديث كلمة المرور بنجاح!',
        description: 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
      },
      updatePassword: 'تحديث كلمة المرور',
      updatingPassword: 'جاري تحديث كلمة المرور...',
      passwordsMatch: 'كلمات المرور متطابقة',
      backToSignIn: 'العودة إلى تسجيل الدخول'
    },
    forgotPassword: {
      title: 'نسيت كلمة المرور؟',
      subtitle: 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.',
      email: 'عنوان البريد الإلكتروني',
      emailPlaceholder: 'your@email.com',
      sendResetLink: 'إرسال رابط إعادة التعيين',
      sendingLink: 'جاري إرسال الرابط...',
      backToLogin: 'العودة إلى تسجيل الدخول',
      success: {
        title: 'تم إرسال رابط إعادة تعيين كلمة المرور!',
        description: 'تحقق من بريدك الإلكتروني للحصول على تعليمات إعادة تعيين كلمة المرور.'
      }
    }
  },

  // Dashboard
  dashboard: {
    title: 'بوابة العملاء',
    subtitle: 'مرحباً بعودتك! إليك نظرة عامة على مسارات عمل الأتمتة وأدائها.',
    stats: {
      activeWorkflows: 'مسارات العمل النشطة',
      totalRuns: 'إجمالي التشغيلات اليوم',
      successRate: 'معدل النجاح'
    },
    workflows: {
      title: 'مسارات عملك',
      newWorkflow: 'مسار عمل جديد',
      noWorkflows: 'لا توجد مسارات عمل بعد',
      noWorkflowsDesc: 'لم تقم بإعداد أي مسارات عمل أتمتة بعد. انقر على الزر أعلاه للبدء.',
      requestFirst: 'اطلب أول مسار عمل',
      browseMarketplace: 'تصفح السوق',
      noWorkflowsPurchasedDesc: 'لم تقم بشراء أي مسارات عمل بعد. تصفح السوق للبدء.'
    },
    searchPlaceholder: 'البحث في مسارات العمل...',
    quickActions: {
      title: 'إجراءات سريعة',
      subtitle: 'مهام مختصرة شائعة لإدارة أتمتتك',
      requestNew: 'طلب مسار عمل جديد',
      modifyExisting: 'تعديل الموجود',
      supportRequest: 'طلب الدعم'
    },
    managePurchased: 'إدارة مسارات العمل التي قمت بشرائها ({{count}} نشطة)',
    lastRun: 'آخر تشغيل: {{when}}',
    browseAll: 'تصفح جميع المسارات',
    toasts: {
      loadPermissionsDesc: 'تعذر تحميل أذونات مسارات العمل الخاصة بك. قد تكون بعض الميزات محدودة.',
      loadFailedDesc: 'فشل في تحميل مسارات العمل'
    }
  },

  // Marketplace
  marketplace: {
    title: 'سوق مسارات العمل',
    subtitle: 'اختر من مسارات عمل الأتمتة الجاهزة للنشر. كل مسار عمل مخصص لاحتياجات عملك.',
    backToDashboard: 'العودة إلى لوحة التحكم',
    selected: 'محدد',
    purchaseSelected: 'شراء المحدد',
    searchPlaceholder: 'البحث في مسارات العمل...',
    noResults: 'لا توجد مسارات عمل تطابق معايير البحث.',
    features: 'الميزات:',
    moreFeatures: 'ميزات إضافية',
    available: 'متاح',

    // مفاتيح إضافية لتعريب واجهة السوق بالكامل
    allCategories: 'كل الفئات',
    requestCustomWorkflow: 'طلب مسار عمل مخصص',
    banner: {
      needCustomTitle: 'هل تحتاج شيئاً مخصصاً؟',
      needCustomDesc: 'لا يمكنك العثور على المسار المناسب لعملك؟ يمكننا إنشاء حلول أتمتة مخصصة وفقاً لاحتياجاتك.',
      featureCustomDev: 'تطوير مخصص',
      featureTailored: 'حلول مخصصة',
      featureExpertSupport: 'دعم خبراء',
      cta: 'طلب مسار عمل مخصص'
    },
    cart: {
      selectedWorkflows: 'المسارات المحددة',
      remove: 'إزالة',
      totalSetupCost: 'إجمالي تكلفة الإعداد:',
      totalMonthlyCost: 'إجمالي التكلفة الشهرية:'
    },
    setupCost: 'تكلفة الإعداد:',
    monthlyCost: 'التكلفة الشهرية:',
    setupShort: 'إعداد',
    monthlyShort: 'شهري',
    owned: 'مملوك',
    dashboard: 'لوحة التحكم',
    requestAccess: 'طلب الوصول',
    sampleDashboard: 'لوحة تجريبية',
    contactForCost: 'تواصل لمعرفة التكلفة',
    complexity: {
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب'
    }
  },

  // نموذج طلب مسار عمل مخصص
  customRequestForm: {
    dialogTitle: 'طلب مسار عمل مخصص',
    dialogDesc: 'أرسل طلباً لمسار أتمتة مخصص يناسب احتياجات عملك.',
    headerTitle: 'تطوير مسار عمل مخصص',
    headerBody: 'لا تجد ما تحتاجه في السوق؟ أخبرنا بمتطلباتك وسننشئ حلاً مؤتمتاً مخصصاً لعملك.',
    basicInfo: 'معلومات أساسية',
    workflowName: 'اسم مسار العمل *',
    description: 'وصف مختصر *',
    businessProblem: 'المشكلة التجارية *',
    expectedOutcome: 'النتيجة المتوقعة',
    targetUsers: 'المستخدمون المستهدفون',
    requirementsTimeline: 'المتطلبات والجدول الزمني',
    urgencyLevel: 'درجة الأهمية',
    timeline: 'الجدول الزمني',
    technicalRequirements: 'المتطلبات التقنية',
    integrations: 'التكاملات المطلوبة',
    additionalNotes: 'ملاحظات إضافية',
    currentPriority: 'الأولوية الحالية:',
    priorityHint: 'سنحدد أولوية طلبك بناءً على هذا الاختيار',
    submit: 'إرسال طلب مسار عمل مخصص',
    submitting: 'جاري الإرسال...',
    cancel: 'إلغاء',
    placeholders: {
      workflowName: 'مثال: نظام تحليل ملاحظات العملاء',
      description: 'صف ما الذي يجب أن يفعله هذا المسار...',
      businessProblem: 'ما المشكلة التي تحاول حلها؟',
      expectedOutcome: 'ما النتائج التي تتوقعها من هذه الأتمتة؟',
      targetUsers: 'مثال: فريق المبيعات، دعم العملاء، التسويق',
      technicalRequirements: 'أي متطلبات تقنية محددة أو واجهات برمجة تطبيقات أو منصات...',
      integrations: 'مثال: Salesforce، HubSpot، Gmail، WhatsApp Business API...',
      additionalNotes: 'أي معلومات أخرى تساعدنا على فهم احتياجاتك...'
    },
    timelineOptions: {
      within1Week: 'خلال أسبوع',
      within2Weeks: 'خلال أسبوعين',
      within1Month: 'خلال شهر',
      within3Months: 'خلال 3 أشهر',
      noDeadline: 'لا يوجد موعد محدد',
      toBeDiscussed: 'يُناقش لاحقاً'
    },
    urgencyOptions: {
      low: 'أولوية منخفضة',
      medium: 'أولوية متوسطة',
      high: 'أولوية عالية',
      urgent: 'عاجل'
    },
    toasts: {
      authRequiredTitle: 'مطلوب تسجيل الدخول',
      authRequiredDesc: 'يرجى تسجيل الدخول لإرسال طلب مسار عمل مخصص.',
      missingInfoTitle: 'معلومات ناقصة',
      missingInfoDesc: 'يرجى تعبئة جميع الحقول المطلوبة.',
      submittedTitle: 'تم إرسال الطلب',
      submittedDesc: 'تم إرسال طلبك بنجاح. سنراجعه ونتواصل معك قريباً.',
      failedTitle: 'فشل الإرسال',
      failedDesc: 'تعذر إرسال طلبك. يرجى المحاولة مرة أخرى.'
    }
  },

  // How It Works
  howItWorks: {
    chip: 'كيف تعمل',
    title: 'كيف يحول واصلِفاي عملك',
    subtitle: 'عملية منظمة من أربع خطوات من الاكتشاف إلى نشر الأتمتة الكاملة.',
    step1: {
      title: 'الاكتشاف والتحليل',
      description: 'نبدأ بمكالمة مدتها 30 دقيقة لفهم عملياتك الحالية، تحديد المهام المتكررة، ورسم خريطة فرص الأتمتة التي ستوفر لك أكبر قدر من الوقت.'
    },
    step2: {
      title: 'التصميم والبناء المخصص',
      description: 'يبني فريقنا مسارات عمل الأتمتة باستخدام أدوات الذكاء الاصطناعي المثبتة، يدمجها مع برامجك الموجودة، ويختبر كل شيء بدقة قبل الإطلاق.'
    },
    step3: {
      title: 'التكامل والاختبار',
      description: 'ننشر مسارات عمل الذكاء الاصطناعي المخصصة، نجري اختبارات شاملة، ونتأكد من أن كل شيء يعمل بشكل مثالي مع البنية التحتية الحالية.'
    },
    step4: {
      title: 'الإطلاق والدعم',
      description: 'أتمتة الذكاء الاصطناعي تعمل! راقب الأداء من خلال بوابة العملاء، شغل مسارات العمل عند الطلب، واحصل على دعم مستمر.'
    }
  },

  // FAQ
  faq: {
    chip: 'الأسئلة الشائعة',
    title: 'الأسئلة المتكررة',
    subtitle: 'كل ما تحتاج معرفته عن أتمتة الذكاء الاصطناعي وكيف يمكن لواصلِفاي تحويل مسارات عمل عملك.',
    q1: {
      question: 'كم من الوقت يستغرق بناء الأتمتة؟',
      answer: 'معظم مسارات العمل جاهزة في 7-14 يوماً. الأتمتة البسيطة مثل تسلسلات البريد الإلكتروني يمكن أن تكون حية في 3-5 أيام، بينما التكاملات المعقدة مع منصات متعددة قد تستغرق 3-4 أسابيع. نبدأ بمكالمة اكتشاف، ثم نبني ونختبر بدقة قبل الإطلاق لضمان عمل كل شيء بشكل مثالي.'
    },
    q2: {
      question: 'كم تكلفة الأتمتة؟',
      answer: 'نقدم تسعيراً شفافاً مع رسوم إعداد لمرة واحدة تتدرج مع التعقيد. مسارات العمل البسيطة تبدأ من 1,500 ريال إعداد، التعقيد المتوسط يتراوح من 3,000-5,000 ريال إعداد، بينما مسارات العمل عالية التعقيد يتم تسعيرها مخصصاً. الرسوم الشهرية تبدأ من الشهر الثاني وتشمل الصيانة الشاملة، استضافة المنصة، النسخ الاحتياطي للبيانات، وتكاليف الخادم—عادة حوالي 500 ريال شهرياً لمسارات العمل البسيطة، تتدرج بناءً على التعقيد والتكاملات المطلوبة.'
    },
    q3: {
      question: 'ما الأدوات التي تتكامل معها؟',
      answer: 'نتكامل مع أكثر من 100 أداة تجارية شائعة بما في ذلك واتساب، جيميل، جوجل شيتس، نوتيون، إيرتابل، سلاك، تريلو، أسانا، زابير، ومعظم أنظمة إدارة علاقات العملاء. إذا كان لديك أداة محددة تستخدمها، يمكننا على الأرجح التكامل معها. نبني أيضاً تكاملات مخصصة عند الحاجة.'
    },
    q4: {
      question: 'هل أحتاج معرفة تقنية؟',
      answer: 'لا على الإطلاق! نتعامل مع كل الإعداد التقني ونوفر لك بوابة عملاء بسيطة لمراقبة وتشغيل مسارات عملك. نحن متاحون دائماً للدعم. الهدف هو جعل الأتمتة متاحة للجميع.'
    },
    q5: {
      question: 'ماذا يحدث بعد الإطلاق؟',
      answer: 'بعد الإطلاق، تحصل على دعم ومراقبة على مدار الساعة. يمكننا إجراء تعديلات حسب الحاجة. ستحصل على وصول لقناة الدعم للمساعدة المستمرة، ونقدم حزم صيانة للتحسين المستمر.'
    },
    q6: {
      question: 'ما مدى سرعة رؤية النتائج؟',
      answer: 'معظم العملاء يرون توفيراً فورياً في الوقت خلال الأسبوع الأول. أتمتة البريد الإلكتروني ومسارات دعم العملاء تظهر نتائج فورية. لتوليد العملاء المحتملين وعمليات المبيعات، سترى عادة تحسين الكفاءة خلال 2-4 أسابيع حيث تتعلم الأتمتة وتحسن.'
    },
    q7: {
      question: 'ماذا لو حدث خطأ ما؟',
      answer: 'نراقب جميع مسارات العمل على مدار الساعة ونوفر تنبيهات فورية إذا احتاج أي شيء للاهتمام. تحصل على قناة دعم مخصصة للمساعدة الفورية. معظم المشاكل يتم حلها خلال ساعات، ولدينا أنظمة احتياطية لضمان استمرار أتمتتك في العمل بسلاسة.'
    },
    q8: {
      question: 'هل يمكنني تعديل الأتمتة لاحقاً؟',
      answer: 'بالتأكيد! أتمتتك مصممة لتنمو مع عملك. يمكننا إضافة ميزات جديدة، أو تكامل أدوات إضافية، أو تعديل مسارات العمل مع تغير احتياجاتك. معظم التعديلات سريعة وبأسعار معقولة.'
    },
    q9: {
      question: 'هل بياناتي آمنة؟',
      answer: 'نعم، الأمان هو أولويتنا القصوى. نستخدم تشفيراً على مستوى المؤسسات واتصالات آمنة لجميع التكاملات. بوابة العملاء محمية بكلمة مرور، ونتبع بروتوكولات حماية البيانات الصارمة. لا نخزن المعلومات الحساسة بشكل غير ضروري ويمكننا العمل مع متطلبات الأمان الحالية.'
    },
  },

  // Additional Workflows Section (AR)
  additionalWorkflows: {
    chip: 'حلول إضافية',
    title: 'حلول أتمتة متخصصة',
    subtitle: 'إلى جانب مساراتنا الأساسية، نقدم حلول أتمتة متخصصة لكل احتياج تجاري.',
    categories: {
      sales: { title: 'المبيعات والتسويق' },
      support: { title: 'الدعم' },
      finance: { title: 'المالية والمحاسبة' },
      hr: { title: 'الموارد البشرية' },
      crm: { title: 'CRM والعمليات' }
    },
    learnMore: 'اعرف المزيد →',
    note: 'جميع المسارات قابلة للتخصيص بالكامل ويمكن دمجها مع أدواتك الحالية.',
    getQuote: 'احصل على عرض مخصص'
  },

  // Made By Humans
  madeByHumans: {
    title: 'صنع بواسطة الذكاء الاصطناعي والإنسان'
  },

  // CTA Section
  cta: {
    chip: 'ابدأ',
    title: 'هل أنت مستعد لأتمتة عملك؟',
    subtitle: 'انضم إلى القائمة المتزايدة من الشركات التي أتمتت عملياتها مع واصلِفاي. ابدأ رحلتك نحو الكفاءة اليوم.',
    primaryButton: 'احصل على استشارة مجانية',
    secondaryButton: 'ابق محدثاً'
  },

  // Contact
  contact: {
    title: 'تواصل معنا',
    subtitle: 'مستعد لأتمتة عملك؟ دعنا نتحدث عن احتياجاتك.',
    form: {
      name: 'الاسم الكامل',
      email: 'عنوان البريد الإلكتروني',
      company: 'اسم الشركة',
      message: 'أخبرنا عن احتياجات الأتمتة الخاصة بك',
      submit: 'إرسال الرسالة',
      sending: 'جاري الإرسال...'
    },
    success: {
      title: 'تم إرسال الرسالة!',
      description: 'سنرد عليك خلال 24 ساعة.'
    }
  },

  // Common
  common: {
    loading: 'جاري التحميل...',
    saving: 'جاري الحفظ...',
    error: 'حدث خطأ ما',
    success: 'نجاح',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    view: 'عرض',
    close: 'إغلاق',
    securityNotice: 'اتصال آمن • بياناتك محمية بتشفير على مستوى المؤسسات',
    warning: 'تحذير',
    send: 'إرسال',
    active: 'نشط',
    never: 'أبدًا',
    openDashboard: 'فتح لوحة التحكم',
    backToDashboard: 'العودة إلى لوحة التحكم'
  },

  // Notifications
  notifications: {
    title: 'الإشعارات',
    markAllRead: 'تحديد الكل كمقروء',
    noNotifications: 'لا توجد إشعارات',
    noNotificationsDesc: 'أنت محدث بالكامل! تحقق لاحقاً للتحديثات.',
    loading: 'جاري تحميل الإشعارات...',
    type: {
      success: 'نجاح',
      error: 'خطأ',
      warning: 'تحذير',
      info: 'معلومة'
    },
    time: {
      justNow: 'الآن',
      hoursAgo: 'قبل {{count}} ساعة',
      dayAgo: 'قبل يوم',
      daysAgo: 'قبل {{count}} يومًا'
    }
  },

  // Messages
  messages: {
    title: 'الرسائل',
    loading: 'جاري التحميل...',
    noRequests: 'لا توجد طلبات بعد.',
    customRequest: 'طلب مسار عمل مخصص',
    awaitingResponse: 'بانتظار الرد',
    status: {
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      denied: 'مرفوض',
      expired: 'منتهي الصلاحية'
    },
    workflow: 'مسار العمل',
    selectConversation: 'اختر محادثة',
    markAsRead: 'تحديد كمقروء',
    noMessagesYet: 'لا توجد رسائل بعد.',
    inputPlaceholder: 'اكتب رسالتك... ',
    toast: {
      newFromAdminTitle: 'رسالة جديدة من المشرف',
      newFromAdminDesc: 'لديك رسالة جديدة بخصوص "{{workflow}}": {{preview}}'
    }
  },

  // Services
  services: {
    globalNotificationService: {
      title: 'خدمة الإشعارات فعّالة',
      description: 'يتم مراقبة الإشعارات الجديدة'
    }
  },

  // Settings
  settings: {
    title: 'الإعدادات',
    profileLabel: 'الملف الشخصي',
    notificationsLabel: 'الإشعارات',
    securityLabel: 'الأمان',
    appearanceLabel: 'المظهر',
    signOut: 'تسجيل الخروج',
    close: 'إغلاق',
    loading: 'جاري تحميل الإعدادات...',
    profileSettings: {
      title: 'إعدادات الملف الشخصي',
      fullName: 'الاسم الكامل',
      email: 'عنوان البريد الإلكتروني',
      company: 'الشركة',
      phone: 'رقم الهاتف',
      position: 'الوظيفة',
      save: 'حفظ التغييرات',
      updatedToastTitle: 'تم تحديث الملف الشخصي',
      updatedToastDesc: 'تم تحديث ملفك الشخصي بنجاح.',
      updateErrorTitle: 'خطأ',
      updateErrorDesc: 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.',
      signedOutTitle: 'تم تسجيل الخروج',
      signedOutDesc: 'تم تسجيل خروجك بنجاح.',
      notSet: 'غير محدد'
    },
    notificationSettings: {
      title: 'تفضيلات الإشعارات',
      emailNotifications: 'إشعارات البريد الإلكتروني',
      emailNotificationsDesc: 'استلام الإشعارات عبر البريد الإلكتروني',
      workflowAlerts: 'تنبيهات مسارات العمل',
      workflowAlertsDesc: 'الحصول على إشعارات حول تغييرات حالة مسارات العمل',
      systemUpdates: 'تحديثات النظام',
      systemUpdatesDesc: 'استلام تحديثات حول الميزات الجديدة والصيانة'
    },
    securitySettings: {
      title: 'إعدادات الأمان',
      twoFactorAuth: 'المصادقة الثنائية',
      twoFactorAuthDesc: 'إضافة طبقة أمان إضافية لحسابك',
      sessionTimeout: 'مهلة الجلسة',
      timeouts: {
        '1h': 'ساعة واحدة',
        '8h': '8 ساعات',
        '24h': '24 ساعة',
        '7d': '7 أيام'
      }
    },
    appearanceSettings: {
      title: 'إعدادات المظهر',
      language: 'اللغة',
      compactMode: 'الوضع المضغوط',
      compactModeDesc: 'استخدام تخطيط أكثر ضغطاً'
    }
  },

  // 404 Not Found
  notFound: {
    title: '404',
    subtitle: 'عذراً! الصفحة غير موجودة',
    returnHome: 'العودة إلى الرئيسية'
  },

  // أسماء الفئات (لوسوم السوق الديناميكية)
  categories: {
    marketing: 'التسويق',
    finance: 'المالية',
    support: 'الدعم',
    data: 'البيانات',
    hr: 'الموارد البشرية',
    operations: 'العمليات',
    sales: 'المبيعات',
    ai: 'AI',
    crm: 'CRM',
    'social-media': 'وسائل التواصل الاجتماعي'
  },

  // أسماء/أوصاف المسارات (اختياري؛ تُستخدم عند توفرها)
  workflows: {
    'ai-powered-social-media-content-generator-publisher': {
      name: 'منشئ ونشر محتوى وسائل التواصل الاجتماعي بالذكاء الاصطناعي',
      description: 'أنشئ وانشر محتوى المنصات بسهولة عبر سير عمل مدعوم بالذكاء الاصطناعي.'
    },
    'smart-invoice-collection-system': {
      name: 'نظام تحصيل الفواتير الذكي',
      description: 'أتمتة متابعة الفواتير وتذكيرات الدفع بالذكاء الاصطناعي.'
    },
    'client-onboarding-automation': {
      name: 'أتمتة استقبال العملاء',
      description: 'أتمتة استقبال العملاء من التسجيل إلى CRM عبر البريد وواتساب.'
    },
    'automated-hr-service-system': {
      name: 'نظام أتمتة الموارد البشرية',
      description: 'تبسيط طلبات وإجراءات الموارد البشرية بالأتمتة.'
    },
    'handling-job-application-submissions-with-ai': {
      name: 'التعامل مع طلبات التوظيف بالذكاء الاصطناعي',
      description: 'جمع وفرز وتوجيه طلبات التوظيف باستخدام الذكاء الاصطناعي.'
    },
    'automated-customer-support': {
      name: 'دعم العملاء المؤتمت',
      description: 'دعم عملاء مدعوم بالذكاء الاصطناعي وأتمتة التذاكر.'
    },

    // المتبقي:
    'automated-lead-generation': {
      name: 'توليد العملاء المحتملين تلقائياً',
      description: 'أتمتة العثور على العملاء المحتملين وجمع بياناتهم.'
    },
    'gmail-ai-auto-responder': {
      name: 'مجيب جيميل التلقائي بالذكاء الاصطناعي',
      description: 'يرد على رسائل جيميل تلقائياً بردود ذكية.'
    },
    'ai-chatbot-for-odoo-sales': {
      name: 'شات بوت ذكاء اصطناعي لمبيعات أودو',
      description: 'يساعد في الاستفسارات والمبيعات داخل Odoo.'
    },
    'generate-monthly-financial-reports': {
      name: 'توليد التقارير المالية الشهرية',
      description: 'إعداد تقارير مالية شهرية تلقائياً.'
    },
    'gmail-email-labelling': {
      name: 'تصنيف رسائل جيميل تلقائياً',
      description: 'تصنيف/وسم البريد تلقائياً حسب القواعد والمحتوى.'
    },
    'automatic-email-labelling': {
      name: 'تصنيف رسائل جيميل تلقائياً',
      description: 'تصنيف/وسم البريد تلقائياً حسب القواعد والمحتوى.'
    },
    'local-ai-chatbot-for-documents-powered-by-rag': {
      name: 'شات بوت محلي للوثائق (مدعوم بـ RAG)',
      description: 'اسأل وثائقك محلياً بدون إرسال البيانات إلى السحابة.'
    },
    'ai-website-chatbot': {
      name: 'شات بوت ذكاء اصطناعي لموقع الويب',
      description: 'مساعد دردشة لموقعك يجيب العملاء ويجمع البيانات.'
    },
    'automated-whatsapp-chat-assistant': {
      name: 'مساعد دردشة واتساب مؤتمت',
      description: 'أتمتة الردود والحوارات على واتساب.'
    },
    'talk-to-your-database-with-ai': {
      name: 'تحدّث إلى قاعدة بياناتك بالذكاء الاصطناعي',
      description: 'اكتب أسئلة طبيعية لتحصل على استعلامات ونتائج مباشرة.'
    },
    'email-summary-agent': {
      name: 'وكيل تلخيص البريد الإلكتروني',
      description: 'يلخص رسائل البريد ويبرز أهم النقاط والإجراءات.'
    },
    'ai-chatbot-for-company-documents': {
      name: 'شات بوت ذكاء اصطناعي لوثائق الشركة',
      description: 'يجيب على أسئلة الموظفين من وثائقكم الداخلية.'
    },
    'whatsapp-product-catalog-bot': {
      name: 'بوت كتالوج منتجات واتساب',
      description: 'استعراض المنتجات واستلام الطلبات عبر واتساب.'
    },
    'whatsapp-sales-automation': {
      name: 'أتمتة مبيعات واتساب',
      description: 'أتمتة مراحل دورة المبيعات عبر واتساب.'
    },
    'whatsapp-responder': {
      name: 'مستجيب واتساب',
      description: 'ردود تلقائية ذكية على رسائل واتساب.'
    },
    'whatsapp-dietitian-assistant': {
      name: 'مساعد تغذية على واتساب',
      description: 'بوت يقدم إرشادات غذائية مخصصة.'
    },
    'local-chatbot': {
      name: 'شات بوت محلي',
      description: 'تشغيل شات بوت على جهازك أو خادمك المحلي.'
    },
    'gmail-outreach-with-auto-follow-up': {
      name: 'حملات تواصل عبر جيميل مع متابعة تلقائية',
      description: 'إرسال رسائل موجهة مع متابعات تلقائية لتعزيز الاستجابة.'
    },
    'generate-leads-with-google-maps': {
      name: 'توليد عملاء محتملين عبر خرائط جوجل',
      description: 'جمع بيانات جهات الاتصال من خرائط جوجل بشكل منظم.'
    }
  }
};

const resources = {
  en: { translation: en },
  ar: { translation: ar }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;