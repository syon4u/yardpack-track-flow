
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
  // Authentication disabled - provide mock values
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false); // No loading needed
  const [profile, setProfile] = useState<any>({
    id: 'mock-admin-id',
    email: 'admin@example.com',
    full_name: 'Mock Admin',
    role: 'admin'
  });

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🚫 AuthProvider: Authentication disabled, using mock admin profile');
    }
    
    // Initialize monitoring without auth requirements
    MonitoringService.initializePerformanceMonitoring();

    return () => {
      MonitoringService.cleanup();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phoneNumber?: string) => {
    console.log('🚫 SignUp disabled');
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🚫 SignIn disabled');
    return { error: null };
  };

  const signOut = async () => {
    console.log('🚫 SignOut disabled');
  };

  const handleRefreshJWT = async (): Promise<{ session: Session | null; error: any }> => {
    console.log('🚫 JWT refresh disabled');
    return { session: null, error: 'JWT disabled' };
  };

  const handleForceReauth = async (): Promise<void> => {
    console.log('🚫 Force reauth disabled');
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
