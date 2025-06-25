
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { SecurityService } from '@/services/securityService';
import { MonitoringService } from '@/services/monitoringService';
import { EnvironmentService } from '@/services/environmentService';
import { toast } from '@/hooks/use-toast';

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

// Helper function to log session details
const logSessionDetails = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('🔐 Session Debug Info:', {
      hasSession: !!session,
      sessionId: session?.access_token ? 'Present' : 'Missing',
      tokenLength: session?.access_token?.length || 0,
      expiresAt: session?.expires_at,
      refreshToken: session?.refresh_token ? 'Present' : 'Missing',
      user: session?.user?.email || 'No user',
      error: error
    });

    if (session?.access_token) {
      console.log('🎟️ JWT Access Token (first 50 chars):', session.access_token.substring(0, 50) + '...');
      
      // Decode JWT payload for debugging (without verification)
      try {
        const base64Payload = session.access_token.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        console.log('🔍 JWT Payload:', {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
          exp: payload.exp,
          iat: payload.iat,
          aud: payload.aud
        });
      } catch (jwtError) {
        console.error('❌ Failed to decode JWT:', jwtError);
      }
    }

    return session;
  } catch (error) {
    console.error('❌ Error getting session:', error);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      if (import.meta.env.DEV) {
        console.log('🔍 Fetching profile for user:', userId);
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (import.meta.env.DEV) {
        console.log('📊 Profile query result:', { data, error, userId });
      }
      
      if (error) {
        console.error('❌ Error fetching profile:', error);
        await MonitoringService.logError(error, { operation: 'fetch_profile', userId });
        
        if (error.code === 'PGRST116') {
          // No rows returned
          console.warn('⚠️ No profile found for user:', userId);
          toast({
            title: "Profile Not Found",
            description: "No profile found for your account. Please contact support if this persists.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Profile Load Error",
            description: "Failed to load your profile. Please try refreshing the page.",
            variant: "destructive"
          });
        }
        return;
      }
      
      if (!data) {
        console.warn('⚠️ Profile query returned null data for user:', userId);
        toast({
          title: "No Profile Found",
          description: "Your profile could not be loaded. Please contact support.",
          variant: "destructive"
        });
        return;
      }
      
      setProfile(data);
      if (import.meta.env.DEV) {
        console.log('✅ Profile loaded successfully:', data);
      }
      await MonitoringService.logUserActivity('profile_loaded', 'profile', userId);
    } catch (error) {
      console.error('💥 Exception in fetchProfile:', error);
      await MonitoringService.logError(error as Error, { operation: 'fetch_profile', userId });
      toast({
        title: "Profile Load Failed",
        description: "An unexpected error occurred while loading your profile.",
        variant: "destructive"
      });
    }
  };

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

      // Use environment-aware redirect URL
      const redirectUrl = EnvironmentService.getRedirectUrl('/');
      
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
          email,
          redirectUrl 
        });
      } else {
        await MonitoringService.logUserActivity('signup_attempted', 'auth', undefined, { 
          email,
          redirectUrl 
        });
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
