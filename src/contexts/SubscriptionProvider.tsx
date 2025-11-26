import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';
export type AccessLevel = 'demo' | 'limited' | 'full';

interface SubscriptionStatus {
  tier: SubscriptionTier;
  accessLevel: AccessLevel;
  isActive: boolean;
  expiresAt: Date | null;
  workflows: string[]; // List of approved workflow IDs
}

interface SubscriptionContextType {
  subscription: SubscriptionStatus;
  isLoading: boolean;
  hasAccess: (workflowId: string) => boolean;
  isDemoMode: () => boolean;
  requestWorkflowAccess: (workflowId: string) => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

interface SubscriptionProviderProps { children: ReactNode; }

export default function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    tier: 'free',
    accessLevel: 'demo',
    isActive: false,
    expiresAt: null,
    workflows: []
  });
  const [isLoading, setIsLoading] = useState(false); // Start as false since we're not loading anything

  const hasAccess = (workflowId: string): boolean => {
    // For now, no one has access to any workflows
    return false;
  };

  const isDemoMode = (): boolean => {
    // Everyone is in demo mode for now
    return true;
  };

  const requestWorkflowAccess = async (workflowId: string) => {
    // Just log the request for now
    console.log('Workflow access requested for:', workflowId);
  };

  const refreshSubscription = async () => {
    // Do nothing for now
  };

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    hasAccess,
    isDemoMode,
    requestWorkflowAccess,
    refreshSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
} 