
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  test: string;
  result: 'pass' | 'fail' | 'pending';
  message: string;
  expected: string;
}

export const useCustomerRLSTestRunner = () => {
  const { user, profile } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (test: string, result: 'pass' | 'fail', message: string, expected: string) => {
    setTestResults(prev => [...prev, { test, result, message, expected }]);
  };

  const runRLSTests = async () => {
    if (!user) {
      addTestResult('Authentication', 'fail', 'No user logged in', 'User should be authenticated');
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      const isAdmin = profile?.role === 'admin';
      
      // Test 1: Check if user can read all customers (should only work for admins)
      try {
        const { data: allCustomers, error: allCustomersError } = await supabase
          .from('customers')
          .select('*');
        
        if (isAdmin) {
          if (allCustomersError) {
            addTestResult(
              'Admin Read All Customers', 
              'fail', 
              `Admin cannot read all customers: ${allCustomersError.message}`,
              'Admin should be able to read all customer records'
            );
          } else {
            addTestResult(
              'Admin Read All Customers', 
              'pass', 
              `Admin can read ${allCustomers?.length || 0} customer records`,
              'Admin should be able to read all customer records'
            );
          }
        } else {
          if (allCustomersError || !allCustomers || allCustomers.length === 0) {
            addTestResult(
              'Non-Admin Read Restriction', 
              'pass', 
              'Non-admin user correctly restricted from reading other customers',
              'Non-admin should only see their own customer record'
            );
          } else {
            addTestResult(
              'Non-Admin Read Restriction', 
              'fail', 
              `Non-admin user can see ${allCustomers.length} customer records (should be restricted)`,
              'Non-admin should only see their own customer record'
            );
          }
        }
      } catch (err) {
        addTestResult(
          'Customer Read Test', 
          isAdmin ? 'fail' : 'pass', 
          `Database query error: ${err}`,
          isAdmin ? 'Admin should access all records' : 'Non-admin should be restricted'
        );
      }

      // Test 2: Check if user can read their own customer record
      try {
        const { data: ownCustomer, error: ownCustomerError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id);
        
        if (ownCustomerError) {
          addTestResult(
            'Read Own Customer Record', 
            'fail', 
            `Cannot read own customer record: ${ownCustomerError.message}`,
            'User should be able to read their own customer record'
          );
        } else {
          addTestResult(
            'Read Own Customer Record', 
            'pass', 
            `Successfully read own customer record (${ownCustomer?.length || 0} records found)`,
            'User should be able to read their own customer record'
          );
        }
      } catch (err) {
        addTestResult(
          'Read Own Customer Record', 
          'fail', 
          `Error reading own customer record: ${err}`,
          'User should be able to read their own customer record'
        );
      }

      // Test 3: Test customer creation (should only work for admins)
      if (isAdmin) {
        try {
          const testCustomer = {
            full_name: 'Test Customer RLS',
            email: 'test-rls@example.com',
            customer_type: 'guest' as const,
          };

          const { data: newCustomer, error: insertError } = await supabase
            .from('customers')
            .insert([testCustomer])
            .select()
            .single();

          if (insertError) {
            addTestResult(
              'Admin Customer Creation', 
              'fail', 
              `Admin cannot create customer: ${insertError.message}`,
              'Admin should be able to create customer records'
            );
          } else {
            addTestResult(
              'Admin Customer Creation', 
              'pass', 
              `Admin successfully created test customer`,
              'Admin should be able to create customer records'
            );

            // Clean up test customer
            await supabase
              .from('customers')
              .delete()
              .eq('id', newCustomer.id);
          }
        } catch (err) {
          addTestResult(
            'Admin Customer Creation', 
            'fail', 
            `Error during customer creation test: ${err}`,
            'Admin should be able to create customer records'
          );
        }
      } else {
        try {
          const testCustomer = {
            full_name: 'Test Customer Non-Admin',
            email: 'test-nonadmin@example.com',
            customer_type: 'guest' as const,
          };

          const { error: insertError } = await supabase
            .from('customers')
            .insert([testCustomer]);

          if (insertError) {
            addTestResult(
              'Non-Admin Creation Restriction', 
              'pass', 
              'Non-admin user correctly prevented from creating customers',
              'Non-admin should not be able to create customer records'
            );
          } else {
            addTestResult(
              'Non-Admin Creation Restriction', 
              'fail', 
              'Non-admin user was able to create customer (should be restricted)',
              'Non-admin should not be able to create customer records'
            );
          }
        } catch (err) {
          addTestResult(
            'Non-Admin Creation Restriction', 
            'pass', 
            'Non-admin user correctly prevented from creating customers',
            'Non-admin should not be able to create customer records'
          );
        }
      }

    } catch (error) {
      addTestResult(
        'RLS Test Suite', 
        'fail', 
        `Test suite failed: ${error}`,
        'All tests should complete successfully'
      );
    } finally {
      setIsRunning(false);
    }
  };

  return {
    testResults,
    isRunning,
    runRLSTests,
    user,
    profile
  };
};
