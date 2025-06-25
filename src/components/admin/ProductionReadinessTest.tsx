
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutomatedTestRunner } from '@/tests/utils/testRunner';
import { toast } from 'sonner';

export const ProductionReadinessTest: React.FC = () => {
  const runFullTestSuite = async () => {
    try {
      toast.info('Starting comprehensive test suite...');
      const results = await AutomatedTestRunner.runFullTestSuite();
      
      if (results.overall === 'pass') {
        toast.success('✅ All tests passed! Application is ready for production.');
      } else if (results.overall === 'warning') {
        toast.warning('⚠️ Tests completed with warnings. Review recommendations before deploying.');
      } else {
        toast.error('❌ Some tests failed. Address issues before production deployment.');
      }
      
      console.log('Full Test Suite Results:', results);
    } catch (error) {
      toast.error('Test suite execution failed');
      console.error('Test suite error:', error);
    }
  };

  const enableAutoTesting = () => {
    localStorage.setItem('runFullTestSuite', 'true');
    toast.success('Auto-testing enabled. Test suite will run automatically in development.');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const disableAutoTesting = () => {
    localStorage.removeItem('runFullTestSuite');
    toast.success('Auto-testing disabled.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Testing Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button onClick={runFullTestSuite} variant="default">
            Run Full Test Suite
          </Button>
          <Button onClick={enableAutoTesting} variant="outline">
            Enable Auto-Testing
          </Button>
          <Button onClick={disableAutoTesting} variant="outline">
            Disable Auto-Testing
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          The full test suite validates critical user flows, performance metrics, and production configuration.
          Auto-testing runs the suite automatically in development mode.
        </p>
      </CardContent>
    </Card>
  );
};
