
import React, { useEffect, useState } from 'react';
import { TestResult } from '@/types/testing';
import { AdminTestUtils } from '@/utils/adminTestUtils';

interface AdminTestRunnerProps {
  authLoading: boolean;
  userRole?: string;
  onTestUpdate: (tests: TestResult[]) => void;
}

export const useAdminTestRunner = ({ authLoading, userRole, onTestUpdate }: AdminTestRunnerProps) => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Auth Loading State', status: 'pending', message: 'Checking auth state...' },
    { name: 'Profile Access Check', status: 'pending', message: 'Verifying admin access...' },
    { name: 'Stats Query Performance', status: 'pending', message: 'Testing stats query speed...' },
    { name: 'Package Query Performance', status: 'pending', message: 'Testing package pagination...' },
    { name: 'Error Handling', status: 'pending', message: 'Testing timeout behavior...' },
  ]);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    const updatedTests = AdminTestUtils.updateTest(tests, index, updates);
    setTests(updatedTests);
    onTestUpdate(updatedTests);
  };

  const runTests = async () => {
    if (import.meta.env.DEV) {
      console.log('Starting Admin Dashboard Tests...');
    }

    // Test 1: Auth Loading State
    const authResult = await AdminTestUtils.runAuthLoadingTest(authLoading);
    updateTest(0, authResult);

    // Test 2: Profile Access Check
    const profileResult = await AdminTestUtils.runProfileAccessTest(userRole);
    updateTest(1, profileResult);

    if (userRole !== 'admin') {
      return;
    }

    // Test 3: Stats Query Performance
    const statsResult = await AdminTestUtils.runStatsPerformanceTest();
    updateTest(2, statsResult);

    // Test 4: Package Query Performance
    const packageResult = await AdminTestUtils.runPackagePerformanceTest();
    updateTest(3, packageResult);

    // Test 5: Error Handling
    const errorResult = await AdminTestUtils.runErrorHandlingTest();
    updateTest(4, errorResult);

    if (import.meta.env.DEV) {
      console.log('Admin Dashboard Tests Completed');
    }
  };

  useEffect(() => {
    if (!authLoading && userRole === 'admin') {
      runTests();
    }
  }, [authLoading, userRole]);

  return { tests, runTests };
};
