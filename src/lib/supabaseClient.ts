import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseConfig } from './config';

console.log('✅ Loading Supabase configuration...');

// Remember me functionality
let usePersistentStorage = true;

export const setRememberMe = (remember: boolean) => {
  usePersistentStorage = remember;
  console.log('Remember me set to:', remember);
};

// Create custom storage that switches between localStorage and sessionStorage
const createStorage = () => {
  if (typeof window === 'undefined') return undefined;
  
  return {
    getItem: (key: string) => {
      // Try localStorage first, then sessionStorage
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
      // Clear both storages first
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      
      // Store in appropriate storage based on remember me setting
      if (usePersistentStorage) {
        localStorage.setItem(key, value);
        console.log('Stored in localStorage:', key);
      } else {
        sessionStorage.setItem(key, value);
        console.log('Stored in sessionStorage:', key);
      }
    },
    removeItem: (key: string) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  };
};

// Create Supabase client
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: createStorage()
  }
});

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('Supabase connected successfully');
  }
});

// Types for our database tables
export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
} 