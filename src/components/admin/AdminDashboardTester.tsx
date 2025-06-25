
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminTestRunner } from './testing/AdminTestRunner';
import { TestResultItem } from './testing/TestResultItem';
import { TestResult } from '@/types/testing';

const AdminDashboardTester: React.FC = () => {
  const { profile, isLoading: authLoading } = useAuth();
  const [displayTests, setDisplayTests] = React.useState<TestResult[]>([]);

  const { tests, runTests } = useAdminTestRunner({
    authLoading,
    userRole: profile?.role,
    onTestUpdate: setDisplayTests
  });

  React.useEffect(() => {
    setDisplayTests(tests);
  }, [tests]);

  if (authLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard Test Suite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span>Waiting for authentication...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard Test Suite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Admin access required to run tests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Admin Dashboard Test Suite
          <Button onClick={runTests} size="sm">Re-run Tests</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayTests.map((test, index) => (
            <TestResultItem key={index} test={test} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboardTester;
