
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { TestResult } from '@/types/testing';

interface TestResultItemProps {
  test: TestResult;
}

export const TestResultItem: React.FC<TestResultItemProps> = ({ test }) => {
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

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
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
  );
};
