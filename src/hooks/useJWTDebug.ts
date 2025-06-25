
import { useEffect } from 'react';

export const useJWTDebug = () => {
  useEffect(() => {
    // Add disabled JWT test functions to window
    (window as any).testJWTRefresh = async () => {
      console.log('🚫 JWT refresh disabled');
      return { session: null, error: 'JWT disabled' };
    };

    (window as any).testForceReauth = async () => {
      console.log('🚫 Force re-authentication disabled');
    };

    (window as any).testQueryWithRetry = async () => {
      console.log('🚫 Query with retry disabled');
      return { data: null, error: 'JWT disabled' };
    };

    (window as any).checkJWTExpiry = () => {
      console.log('🚫 JWT expiry check disabled');
    };

    console.log('🛠️ JWT debug functions (all disabled):');
    console.log('- JWT refresh: DISABLED');
    console.log('- Force reauth: DISABLED'); 
    console.log('- Query retry: DISABLED');
    console.log('- JWT expiry check: DISABLED');

    // Cleanup
    return () => {
      delete (window as any).testJWTRefresh;
      delete (window as any).testForceReauth;
      delete (window as any).testQueryWithRetry;
      delete (window as any).checkJWTExpiry;
    };
  }, []);
};
