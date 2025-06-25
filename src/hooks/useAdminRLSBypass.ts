
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Create a service role client for bypassing RLS (TEMPORARY TESTING ONLY)
const createServiceRoleClient = () => {
  const SUPABASE_URL = 'https://lkvelwwrztkmnvgeknpa.supabase.co';
  const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrdmVsd3dyenRrbW52Z2VrbnBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDcwNTkwOSwiZXhwIjoyMDY2MjgxOTA5fQ.X8RMBMU6t3MFEWlRLbEHJRvgJ9g6R-D4i1KjL6_XvHE';
  
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export const useAdminRLSBypass = () => {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    result: 'pass' | 'fail' | 'pending';
    message: string;
    data?: any;
  }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (test: string, result: 'pass' | 'fail', message: string, data?: any) => {
    setTestResults(prev => [...prev, { test, result, message, data }]);
  };

  const runServiceRoleTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    console.log('🔧 Starting Service Role RLS Bypass Tests...');
    
    try {
      const serviceClient = createServiceRoleClient();
      
      // Test 1: Query profiles table with service role (bypasses RLS)
      console.log('🧪 Testing profiles access with service role...');
      try {
        const { data: profiles, error } = await serviceClient
          .from('profiles')
          .select('*')
          .limit(5);
        
        if (error) {
          addTestResult('Service Role Profiles Access', 'fail', `Error: ${error.message}`, error);
        } else {
          addTestResult('Service Role Profiles Access', 'pass', `Successfully fetched ${profiles.length} profiles`, profiles);
        }
      } catch (err) {
        addTestResult('Service Role Profiles Access', 'fail', `Exception: ${err}`, err);
      }
      
      // Test 2: Query customers table with service role
      console.log('🧪 Testing customers access with service role...');
      try {
        const { data: customers, error } = await serviceClient
          .from('customers')
          .select('*')
          .limit(5);
        
        if (error) {
          addTestResult('Service Role Customers Access', 'fail', `Error: ${error.message}`, error);
        } else {
          addTestResult('Service Role Customers Access', 'pass', `Successfully fetched ${customers.length} customers`, customers);
        }
      } catch (err) {
        addTestResult('Service Role Customers Access', 'fail', `Exception: ${err}`, err);
      }
      
      // Test 3: Query packages table with service role
      console.log('🧪 Testing packages access with service role...');
      try {
        const { data: packages, error } = await serviceClient
          .from('packages')
          .select('*')
          .limit(5);
        
        if (error) {
          addTestResult('Service Role Packages Access', 'fail', `Error: ${error.message}`, error);
        } else {
          addTestResult('Service Role Packages Access', 'pass', `Successfully fetched ${packages.length} packages`, packages);
        }
      } catch (err) {
        addTestResult('Service Role Packages Access', 'fail', `Exception: ${err}`, err);
      }
      
      // Test 4: Try to create a test customer with service role
      console.log('🧪 Testing customer creation with service role...');
      try {
        const testCustomer = {
          full_name: 'Test Customer (Service Role)',
          email: 'test-service@example.com',
          customer_type: 'guest' as const
        };
        
        const { data: newCustomer, error } = await serviceClient
          .from('customers')
          .insert(testCustomer)
          .select()
          .single();
        
        if (error) {
          addTestResult('Service Role Customer Creation', 'fail', `Error: ${error.message}`, error);
        } else {
          addTestResult('Service Role Customer Creation', 'pass', `Successfully created customer: ${newCustomer.id}`, newCustomer);
          
          // Clean up - delete the test customer
          await serviceClient
            .from('customers')
            .delete()
            .eq('id', newCustomer.id);
        }
      } catch (err) {
        addTestResult('Service Role Customer Creation', 'fail', `Exception: ${err}`, err);
      }
      
      // Test 5: Check if RLS policies exist
      console.log('🧪 Checking RLS policy information...');
      try {
        const { data: rlsPolicies, error } = await serviceClient
          .rpc('sql', { 
            query: `
              SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
              FROM pg_policies 
              WHERE schemaname = 'public' 
              ORDER BY tablename, policyname;
            `
          } as any);
        
        if (error) {
          addTestResult('RLS Policies Check', 'fail', `Error checking policies: ${error.message}`, error);
        } else {
          addTestResult('RLS Policies Check', 'pass', `Found ${rlsPolicies?.length || 0} RLS policies`, rlsPolicies);
        }
      } catch (err) {
        addTestResult('RLS Policies Check', 'fail', `Exception: ${err}`, err);
      }
      
    } catch (error) {
      addTestResult('Service Role Test Suite', 'fail', `Test suite failed: ${error}`, error);
    } finally {
      setIsRunning(false);
      console.log('🔧 Service Role RLS Bypass Tests Complete');
    }
  };

  // Add window functions for manual testing
  useEffect(() => {
    (window as any).runServiceRoleTests = runServiceRoleTests;
    (window as any).testServiceRoleAccess = async () => {
      const serviceClient = createServiceRoleClient();
      
      console.log('🔧 Quick Service Role Test...');
      
      try {
        const { data, error } = await serviceClient
          .from('profiles')
          .select('id, email, role')
          .limit(3);
        
        console.log('Service Role Query Result:', { data, error });
        return { data, error };
      } catch (err) {
        console.error('Service Role Query Exception:', err);
        return { error: err };
      }
    };

    console.log('🔧 Service Role test functions added to window:');
    console.log('- Call window.runServiceRoleTests() for full test suite');
    console.log('- Call window.testServiceRoleAccess() for quick test');

    return () => {
      delete (window as any).runServiceRoleTests;
      delete (window as any).testServiceRoleAccess;
    };
  }, []);

  return {
    testResults,
    isRunning,
    runServiceRoleTests
  };
};
