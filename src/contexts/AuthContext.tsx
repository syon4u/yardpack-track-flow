
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SecurityService } from '@/services/securityService';
import { MonitoringService } from '@/services/monitoringService';
import { AuthContextType, AuthProviderProps } from '@/types/auth';
import { useProfileFetch } from '@/hooks/useProfileFetch';
import { refreshJWT, forceReauth, signUpUser, signInUser, signOutUser } from '@/utils/authUtils';
import { logSessionDetails } from '@/utils/sessionUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, setProfile, fetchProfile } = useProfileFetch();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔄 AuthProvider useEffect running - initializing auth...');
    }

    // Initialize monitoring
    MonitoringService.initializePerformanceMonitoring();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (import.meta.env.DEV) {
          console.log('🔐 Auth state changed:', event, 'Session:', session?.user?.email || 'No session');
        }
        
        // Log session details whenever auth state changes
        await logSessionDetails();
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Generate CSRF token for authenticated users
          SecurityService.setCSRFToken();
          
          if (import.meta.env.DEV) {
            console.log('👤 User set:', session.user.email);
          }
          
          // Defer profile fetching to avoid blocking
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);

          await MonitoringService.logUserActivity('auth_state_changed', 'auth', session.user.id, { event });
        } else {
          setProfile(null);
          SecurityService.clearSecurityData();
          if (import.meta.env.DEV) {
            console.log('🚪 User logged out, profile cleared');
          }
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (import.meta.env.DEV) {
          console.log('🔍 Initial session check:', session?.user?.email || 'No existing session');
        }
        
        // Log initial session details
        logSessionDetails();
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          SecurityService.setCSRFToken();
          if (import.meta.env.DEV) {
            console.log('👤 Initial user set:', session.user.email);
          }
          fetchProfile(session.user.id);
        } else {
          if (import.meta.env.DEV) {
            console.log('❌ No initial session found');
          }
        }
      })
      .catch((error) => {
        console.error('Error getting initial session:', error);
      })
      .finally(() => {
        setIsLoading(false);
        if (import.meta.env.DEV) {
          console.log('✅ Auth initialization complete, loading set to false');
        }
      });

    return () => {
      subscription.unsubscribe();
      MonitoringService.cleanup();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string, phoneNumber?: string) => {
    return await signUpUser(email, password, fullName, phoneNumber);
  };

  const signIn = async (email: string, password: string) => {
    return await signInUser(email, password);
  };

  const signOut = async () => {
    await signOutUser(user?.id);
    setProfile(null);
  };

  const handleRefreshJWT = async (): Promise<{ session: Session | null; error: any }> => {
    const result = await refreshJWT();
    if (result.session) {
      setSession(result.session);
      setUser(result.session.user);
    }
    return result;
  };

  const handleForceReauth = async (): Promise<void> => {
    setSession(null);
    setUser(null);
    setProfile(null);
    await forceReauth();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      signUp, 
      signIn, 
      signOut, 
      refreshJWT: handleRefreshJWT,
      forceReauth: handleForceReauth,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
