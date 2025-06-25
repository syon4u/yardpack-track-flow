
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users } from 'lucide-react';
import { useCustomerRLSTestRunner } from './testing/CustomerRLSTestRunner';
import { RLSTestResultDisplay } from './testing/RLSTestResultDisplay';
import { RLSTestSummary } from './testing/RLSTestSummary';

const CustomerRLSTest: React.FC = () => {
  const { testResults, isRunning, runRLSTests, user, profile } = useCustomerRLSTestRunner();

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

        <RLSTestResultDisplay testResults={testResults} />
        
        <RLSTestSummary />

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Note:</strong> To fully test non-admin access, log in with a customer account and run these tests.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerRLSTest;
