
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryWithRetry } from './useQueryWithRetry';

export const useJWTDebug = () => {
  const { refreshJWT, forceReauth, session } = useAuth();
  const { executeWithRetry } = useQueryWithRetry();

  useEffect(() => {
    // Add JWT test functions to window for manual testing
    (window as any).testJWTRefresh = async () => {
      console.log('🔄 Testing JWT refresh...');
      const result = await refreshJWT();
      console.log('JWT refresh result:', result);
      return result;
    };

    (window as any).testForceReauth = async () => {
      console.log('🚪 Testing force re-authentication...');
      await forceReauth();
      console.log('Force re-auth completed');
    };

    (window as any).testQueryWithRetry = async () => {
      console.log('🧪 Testing query with retry logic...');
      
      const result = await executeWithRetry(async () => {
        return await supabase
          .from('profiles')
          .select('id, email, role')
          .limit(3);
      });
      
      console.log('Query with retry result:', result);
      return result;
    };

    (window as any).checkJWTExpiry = () => {
      if (!session?.access_token) {
        console.log('❌ No JWT token available');
        return;
      }

      try {
        const base64Payload = session.access_token.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = payload.exp;
        const timeUntilExpiry = expiresAt - now;
        
        console.log('🕐 JWT Expiry Info:', {
          currentTime: now,
          expiresAt: expiresAt,
          timeUntilExpiry: timeUntilExpiry,
          timeUntilExpiryMinutes: Math.floor(timeUntilExpiry / 60),
          isExpired: timeUntilExpiry <= 0,
          willExpireSoon: timeUntilExpiry < 600 // Less than 10 minutes
        });
      } catch (error) {
        console.error('❌ Failed to decode JWT:', error);
      }
    };

    console.log('🛠️ JWT debug functions added to window:');
    console.log('- Call window.testJWTRefresh() to test token refresh');
    console.log('- Call window.testForceReauth() to test forced logout');
    console.log('- Call window.testQueryWithRetry() to test query retry logic');
    console.log('- Call window.checkJWTExpiry() to check token expiry');

    // Cleanup
    return () => {
      delete (window as any).testJWTRefresh;
      delete (window as any).testForceReauth;
      delete (window as any).testQueryWithRetry;
      delete (window as any).checkJWTExpiry;
    };
  }, [refreshJWT, forceReauth, executeWithRetry, session]);
};
