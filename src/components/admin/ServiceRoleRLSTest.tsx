
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Database, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAdminRLSBypass } from '@/hooks/useAdminRLSBypass';

const ServiceRoleRLSTest: React.FC = () => {
  const { testResults, isRunning, runServiceRoleTests } = useAdminRLSBypass();

  const getResultIcon = (result: 'pass' | 'fail' | 'pending') => {
    switch (result) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
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
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Database className="h-5 w-5" />
          Service Role RLS Bypass Test
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
            TEMPORARY TESTING
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-800">⚠️ Testing Mode Only</h4>
              <p className="text-sm text-orange-700 mt-1">
                This test uses the service role key to bypass RLS policies. This helps determine if issues are 
                authentication-related or policy-related. <strong>Remove this component in production!</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Test database access using service role to bypass RLS
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This will help identify if the issue is with RLS policies or authentication
            </p>
          </div>
          <Button 
            onClick={runServiceRoleTests} 
            disabled={isRunning}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
          >
            <Shield className="h-4 w-4" />
            {isRunning ? 'Running Tests...' : 'Run Service Role Tests'}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
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
                <p className="text-xs text-gray-600 mb-2">{result.message}</p>
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Data ({Array.isArray(result.data) ? result.data.length : 'object'} items)
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">What This Test Reveals:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>If service role tests PASS:</strong> The database and tables are working, issue is likely RLS/auth</li>
            <li>• <strong>If service role tests FAIL:</strong> There may be database schema or connection issues</li>
            <li>• <strong>Data access patterns:</strong> Shows what data actually exists in your tables</li>
            <li>• <strong>RLS policy verification:</strong> Confirms which policies are active</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p><strong>Quick Test:</strong> Open browser console and run <code>window.testServiceRoleAccess()</code></p>
          <p><strong>Full Suite:</strong> Open browser console and run <code>window.runServiceRoleTests()</code></p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceRoleRLSTest;
