
import { PostgrestError } from '@supabase/supabase-js';

interface QueryRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export const useQueryWithRetry = () => {
  const executeWithRetry = async <T>(
    queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
    options: QueryRetryOptions = {}
  ): Promise<{ data: T | null; error: PostgrestError | null }> => {
    const { maxRetries = 2, retryDelay = 1000 } = options;
    let lastError: PostgrestError | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Query attempt ${attempt + 1}/${maxRetries + 1} (JWT disabled)`);
      
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
        
        // Since JWT is disabled, just retry without auth refresh
        if (attempt < maxRetries) {
          console.log('🔄 Retrying query without JWT refresh...');
          
          // Wait before retrying
          if (retryDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
          
          continue; // Retry the query
        }
        
        // If max retries reached, return the error
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
