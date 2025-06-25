
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { SecurityService } from '@/services/securityService';
import { MonitoringService } from '@/services/monitoringService';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        await MonitoringService.logError(error, { operation: 'fetch_profile', userId });
        return;
      }
      
      setProfile(data);
      await MonitoringService.logUserActivity('profile_loaded', 'profile', userId);
    } catch (error) {
      console.error('Error fetching profile:', error);
      await MonitoringService.logError(error as Error, { operation: 'fetch_profile', userId });
    }
  };

  useEffect(() => {
    // Initialize monitoring
    MonitoringService.initializePerformanceMonitoring();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Generate CSRF token for authenticated users
          SecurityService.setCSRFToken();
          
          // Defer profile fetching to avoid blocking
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);

          await MonitoringService.logUserActivity('auth_state_changed', 'auth', session.user.id, { event });
        } else {
          setProfile(null);
          SecurityService.clearSecurityData();
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        SecurityService.setCSRFToken();
        fetchProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      MonitoringService.cleanup();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phoneNumber?: string) => {
    try {
      // Check rate limiting
      const rateLimitCheck = SecurityService.checkRateLimit('signup', email);
      if (!rateLimitCheck.allowed) {
        const error = new Error(`Too many signup attempts. Please try again later.`);
        await MonitoringService.logError(error, { 
          operation: 'signup_rate_limited', 
          email,
          resetTime: rateLimitCheck.resetTime 
        });
        return { error };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone_number: phoneNumber || ''
          }
        }
      });

      // Record the attempt
      SecurityService.recordAttempt('signup', email, !error);

      if (error) {
        await MonitoringService.logError(error, { 
          operation: 'signup_failed', 
          email 
        });
      } else {
        await MonitoringService.logUserActivity('signup_attempted', 'auth', undefined, { email });
      }
      
      return { error };
    } catch (error) {
      await MonitoringService.logError(error as Error, { 
        operation: 'signup_error', 
        email 
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check rate limiting
      const rateLimitCheck = SecurityService.checkRateLimit('login', email);
      if (!rateLimitCheck.allowed) {
        const error = new Error(`Too many login attempts. Please try again later.`);
        await MonitoringService.logError(error, { 
          operation: 'login_rate_limited', 
          email,
          resetTime: rateLimitCheck.resetTime 
        });
        return { error };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // Record the attempt
      SecurityService.recordAttempt('login', email, !error);

      if (error) {
        await MonitoringService.logError(error, { 
          operation: 'login_failed', 
          email 
        });
      } else {
        await MonitoringService.logUserActivity('login_success', 'auth', undefined, { email });
      }
      
      return { error };
    } catch (error) {
      await MonitoringService.logError(error as Error, { 
        operation: 'login_error', 
        email 
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const userId = user?.id;
      await supabase.auth.signOut();
      setProfile(null);
      SecurityService.clearSecurityData();
      
      if (userId) {
        await MonitoringService.logUserActivity('logout', 'auth', userId);
      }
    } catch (error) {
      await MonitoringService.logError(error as Error, { 
        operation: 'logout_error' 
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      signUp, 
      signIn, 
      signOut, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
