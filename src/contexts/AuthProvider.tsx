import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error refreshing user:', error);
        setUser(null);
      } else {
        setUser(user);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  const signOut = async () => {
    try {
      // Clear all Supabase-related storage
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      sessionStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      setLoading(false);
      
      // Force a complete page reload to clear everything
      window.location.replace('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setSession(null);
      setLoading(false);
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      sessionStorage.clear();
      window.location.replace('/login');
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Temporarily disabled profile creation to fix login issue
        // if (event === 'SIGNED_IN') {
        //   // Ensure user profile exists
        //   if (session?.user) {
        //     try {
        //       const { data: profile, error } = await supabase
        //         .from('profiles')
        //         .select('*')
        //         .eq('id', session.user.id)
        //         .single();

        //       if (error && error.code === 'PGRST116') {
        //         // Profile doesn't exist, create it
        //         await supabase
        //           .from('profiles')
        //           .insert({
        //             id: session.user.id,
        //             full_name: session.user.user_metadata?.full_name || ''
        //           });
        //       }
        //     } catch (error) {
        //       console.error('Error ensuring profile exists:', error);
        //     }
        //   }
        // }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider; 