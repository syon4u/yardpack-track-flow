
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDebugQueries = () => {
  useEffect(() => {
    // Add a function to window for manual testing
    (window as any).testSupabaseQuery = async () => {
      console.log('🧪 Testing Supabase query with current session...');
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('📋 Current session state:', {
        hasSession: !!session,
        accessToken: session?.access_token ? 'Present' : 'Missing',
        user: session?.user?.email || 'No user',
        error: sessionError
      });

      // Test a simple query to profiles table
      try {
        console.log('🔍 Making test query to profiles table...');
        
        const { data, error, status, statusText } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .limit(1);

        console.log('📊 Query result:', {
          data,
          error,
          status,
          statusText,
          recordCount: data?.length || 0
        });

        if (error) {
          console.error('❌ Query error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
        }

      } catch (queryError) {
        console.error('💥 Query exception:', queryError);
      }
    };

    // Add function to check headers being sent
    (window as any).checkSupabaseHeaders = async () => {
      console.log('🔍 Checking Supabase client headers...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        console.log('🎟️ Authorization header that would be sent:');
        console.log(`Bearer ${session.access_token.substring(0, 50)}...`);
        
        console.log('📡 Full headers that Supabase client sends:');
        console.log({
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // truncated for display
          'authorization': `Bearer ${session.access_token.substring(0, 50)}...`,
          'x-client-info': 'supabase-js-web/2.50.0',
          'content-type': 'application/json'
        });
      } else {
        console.warn('⚠️ No access token available - requests will use anon key only');
      }
    };

    console.log('🛠️ Debug functions added to window:');
    console.log('- Call window.testSupabaseQuery() to test a query');
    console.log('- Call window.checkSupabaseHeaders() to check headers');

    // Cleanup
    return () => {
      delete (window as any).testSupabaseQuery;
      delete (window as any).checkSupabaseHeaders;
    };
  }, []);
};
