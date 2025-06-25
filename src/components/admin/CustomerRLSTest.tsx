
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Users, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

interface TestResult {
  test: string;
  result: 'pass' | 'fail' | 'pending';
  message: string;
  expected: string;
}

const CustomerRLSTest: React.FC = () => {
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

  const getResultIcon = (result: 'pass' | 'fail' | 'pending') => {
    switch (result) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Eye className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getResultBadge = (result: 'pass' | 'fail' | 'pending') => {
    switch (result) {
      case 'pass': return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'fail': return <Badge className="bg-red-100 text-red-800">FAIL</Badge>;
      default: return <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Customer RLS Policy Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Test Row Level Security policies on the customers table
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Current user: {user?.email} ({profile?.role || 'customer'})
            </p>
          </div>
          <Button 
            onClick={runRLSTests} 
            disabled={isRunning || !user}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            {isRunning ? 'Running Tests...' : 'Test RLS Policies'}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getResultIcon(result.result)}
                    <span className="font-medium text-sm">{result.test}</span>
                  </div>
                  {getResultBadge(result.result)}
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Expected:</strong> {result.expected}</p>
                  <p><strong>Result:</strong> {result.message}</p>
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-sm mb-2">RLS Policy Summary:</h5>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Users can only read their own customer record (user_id = auth.uid())</li>
                <li>• Only admins can insert new customer records</li>
                <li>• Only admins can update any customer record</li>
                <li>• Admins can read all customer records</li>
              </ul>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Note:</strong> To fully test non-admin access, log in with a customer account and run these tests.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerRLSTest;
