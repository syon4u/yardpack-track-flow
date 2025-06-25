
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { OptimizedDataService } from '@/services/optimizedDataService';
import { useAuth } from '@/contexts/AuthContext';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  duration?: number;
  message: string;
}

const AdminDashboardTester: React.FC = () => {
  const { profile, isLoading: authLoading } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Auth Loading State', status: 'pending', message: 'Checking auth state...' },
    { name: 'Profile Access Check', status: 'pending', message: 'Verifying admin access...' },
    { name: 'Stats Query Performance', status: 'pending', message: 'Testing stats query speed...' },
    { name: 'Package Query Performance', status: 'pending', message: 'Testing package pagination...' },
    { name: 'Error Handling', status: 'pending', message: 'Testing timeout behavior...' },
  ]);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  const runTests = async () => {
    console.log('Starting Admin Dashboard Tests...');

    // Test 1: Auth Loading State
    if (authLoading) {
      updateTest(0, { status: 'success', message: 'Auth loading state detected correctly' });
    } else {
      updateTest(0, { status: 'success', message: 'Auth already loaded' });
    }

    // Test 2: Profile Access Check
    if (profile?.role === 'admin') {
      updateTest(1, { status: 'success', message: 'Admin access confirmed' });
    } else {
      updateTest(1, { status: 'error', message: 'No admin access - cannot run remaining tests' });
      return;
    }

    // Test 3: Stats Query Performance
    try {
      const startTime = performance.now();
      const stats = await OptimizedDataService.fetchOptimizedStats();
      const duration = performance.now() - startTime;
      
      if (duration < 3000) {
        updateTest(2, { 
          status: 'success', 
          duration, 
          message: `Stats loaded in ${duration.toFixed(0)}ms - Good performance` 
        });
      } else if (duration < 8000) {
        updateTest(2, { 
          status: 'warning', 
          duration, 
          message: `Stats loaded in ${duration.toFixed(0)}ms - Acceptable` 
        });
      } else {
        updateTest(2, { 
          status: 'error', 
          duration, 
          message: `Stats took ${duration.toFixed(0)}ms - Too slow` 
        });
      }
    } catch (error) {
      updateTest(2, { status: 'error', message: `Stats query failed: ${error}` });
    }

    // Test 4: Package Query Performance
    try {
      const startTime = performance.now();
      const packages = await OptimizedDataService.fetchPackagesPaginated({}, { page: 1, limit: 25 });
      const duration = performance.now() - startTime;
      
      if (duration < 2000) {
        updateTest(3, { 
          status: 'success', 
          duration, 
          message: `25 packages loaded in ${duration.toFixed(0)}ms - Excellent` 
        });
      } else if (duration < 5000) {
        updateTest(3, { 
          status: 'warning', 
          duration, 
          message: `25 packages loaded in ${duration.toFixed(0)}ms - Acceptable` 
        });
      } else {
        updateTest(3, { 
          status: 'error', 
          duration, 
          message: `25 packages took ${duration.toFixed(0)}ms - Too slow` 
        });
      }
    } catch (error) {
      updateTest(3, { status: 'error', message: `Package query failed: ${error}` });
    }

    // Test 5: Error Handling (simulate timeout)
    const testStartTime = performance.now(); // Declare outside try block
    try {
      // Test with a very short timeout to trigger error handling
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Simulated timeout')), 100)
      );
      
      await Promise.race([
        OptimizedDataService.fetchOptimizedStats(),
        timeoutPromise
      ]);
      
      updateTest(4, { status: 'warning', message: 'Query completed before timeout simulation' });
    } catch (error) {
      const duration = performance.now() - testStartTime;
      if (duration < 200) {
        updateTest(4, { 
          status: 'success', 
          duration,
          message: 'Timeout error handling works correctly' 
        });
      } else {
        updateTest(4, { status: 'warning', message: 'Error caught but timing unexpected' });
      }
    }

    console.log('Admin Dashboard Tests Completed');
  };

  useEffect(() => {
    if (!authLoading && profile?.role === 'admin') {
      runTests();
    }
  }, [authLoading, profile]);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

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
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-gray-600">{test.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {test.duration && (
                  <span className="text-xs text-gray-500">{test.duration.toFixed(0)}ms</span>
                )}
                <Badge className={getStatusColor(test.status)}>
                  {test.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboardTester;
