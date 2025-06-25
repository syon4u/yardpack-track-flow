
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

interface QueryRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export const useQueryWithRetry = () => {
  const { refreshJWT, forceReauth } = useAuth();

  const executeWithRetry = async <T>(
    queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
    options: QueryRetryOptions = {}
  ): Promise<{ data: T | null; error: PostgrestError | null }> => {
    const { maxRetries = 2, retryDelay = 1000 } = options;
    let lastError: PostgrestError | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Query attempt ${attempt + 1}/${maxRetries + 1}`);
      
      try {
        const result = await queryFn();
        
        // If successful, return the result
        if (!result.error) {
          if (attempt > 0) {
            console.log('✅ Query succeeded after retry');
          }
          return result;
        }
        
        lastError = result.error;
        console.error(`❌ Query failed on attempt ${attempt + 1}:`, result.error);
        
        // Check if it's an auth-related error
        const isAuthError = result.error.code === 'PGRST301' || 
                           result.error.message?.includes('JWT') ||
                           result.error.message?.includes('auth') ||
                           result.error.message?.includes('permission');
        
        if (isAuthError && attempt < maxRetries) {
          console.log('🔑 Auth error detected, attempting JWT refresh...');
          
          // Try to refresh the JWT token
          const refreshResult = await refreshJWT();
          
          if (refreshResult.error) {
            console.error('❌ JWT refresh failed, forcing re-authentication...');
            await forceReauth();
            return { data: null, error: result.error };
          }
          
          console.log('✅ JWT refreshed, retrying query...');
          
          // Wait before retrying
          if (retryDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
          
          continue; // Retry the query
        }
        
        // If not an auth error or max retries reached, return the error
        break;
        
      } catch (exception) {
        console.error(`💥 Query exception on attempt ${attempt + 1}:`, exception);
        lastError = {
          code: 'UNKNOWN_ERROR',
          message: exception instanceof Error ? exception.message : 'Unknown error',
          details: null,
          hint: null
        } as PostgrestError;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    console.error('❌ All query attempts failed');
    return { data: null, error: lastError };
  };

  return { executeWithRetry };
};
