
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Eye } from 'lucide-react';

interface TestResult {
  test: string;
  result: 'pass' | 'fail' | 'pending';
  message: string;
  expected: string;
}

interface RLSTestResultDisplayProps {
  testResults: TestResult[];
}

export const RLSTestResultDisplay: React.FC<RLSTestResultDisplayProps> = ({ testResults }) => {
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

  if (testResults.length === 0) {
    return null;
  }

  return (
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
    </div>
  );
};
