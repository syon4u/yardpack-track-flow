/**
 * Enhanced Supabase Client with Production Optimizations
 * Wraps the auto-generated client with additional configuration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { config } from '@/config/environment';
import { errorReporter } from '@/services/errorReporting';

// Enhanced client with production-ready configuration
export const createEnhancedSupabaseClient = (): SupabaseClient<Database> => {
  const client = createClient<Database>(
    config.supabase.url,
    config.supabase.anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: window.localStorage,
        storageKey: `sb-${config.environment}-auth-token`,
      },
      global: {
        headers: {
          'X-Application-Name': config.app.name,
          'X-Application-Version': config.app.version,
          'X-Environment': config.environment,
        },
      },
      realtime: {
        params: {
          eventsPerSecond: config.isProduction ? 10 : 5,
        },
      },
      db: {
        schema: 'public',
      },
    }
  );

  // Monitor for errors in requests
  const addErrorMonitoring = () => {
    // Monitor auth errors
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && session === null) {
        // User signed out, could be due to error
        const errorSummary = errorReporter.getErrorSummary();
        if (errorSummary.totalErrors > 0) {
          errorReporter.reportError(
            new Error('User signed out after errors detected'),
            'low',
            { event, previousErrors: errorSummary }
          );
        }
      }
    });
  };

  addErrorMonitoring();

  return client;
};

// Export the enhanced client
export const enhancedSupabase = createEnhancedSupabaseClient();

// Re-export the original client for backward compatibility
export { supabase } from '@/integrations/supabase/client';