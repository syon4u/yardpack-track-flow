
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SecurityService } from '@/services/securityService';
import { MonitoringService } from '@/services/monitoringService';
import { EnvironmentService } from '@/services/environmentService';
import { toast } from '@/hooks/use-toast';

export const refreshJWT = async (): Promise<{ session: Session | null; error: any }> => {
  try {
    console.log('🔄 Attempting to refresh JWT token...');
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('❌ JWT refresh failed:', error);
      await MonitoringService.logError(error, { operation: 'jwt_refresh_failed' });
      return { session: null, error };
    }
    
    if (data.session) {
      console.log('✅ JWT token refreshed successfully');
      await MonitoringService.logUserActivity('jwt_refreshed', 'auth', data.session.user.id);
      return { session: data.session, error: null };
    }
    
    console.warn('⚠️ JWT refresh returned no session');
    return { session: null, error: 'No session returned from refresh' };
  } catch (error) {
    console.error('💥 Exception during JWT refresh:', error);
    await MonitoringService.logError(error as Error, { operation: 'jwt_refresh_exception' });
    return { session: null, error };
  }
};

export const forceReauth = async (): Promise<void> => {
  try {
    console.log('🚪 Forcing re-authentication...');
    
    // Clear security data
    SecurityService.clearSecurityData();
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Show toast to user
    toast({
      title: "Session Expired",
      description: "Please log in again to continue.",
      variant: "destructive"
    });
    
    console.log('✅ Forced logout completed');
    await MonitoringService.logUserActivity('forced_logout', 'auth');
  } catch (error) {
    console.error('💥 Exception during forced logout:', error);
    await MonitoringService.logError(error as Error, { operation: 'forced_logout_exception' });
  }
};

export const signUpUser = async (email: string, password: string, fullName: string, phoneNumber?: string) => {
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

export const signInUser = async (email: string, password: string) => {
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

export const signOutUser = async (userId?: string) => {
  try {
    await supabase.auth.signOut();
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
