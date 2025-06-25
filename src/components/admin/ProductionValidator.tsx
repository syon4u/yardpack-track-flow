
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, Play, FileText } from 'lucide-react';
import { AutomatedTestRunner } from '@/tests/utils/testRunner';
import { HealthCheckService } from '@/services/healthCheckService';

interface ValidationResult {
  category: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: string;
}

export const ProductionValidator: React.FC = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'pass' | 'warning' | 'fail' | null>(null);
  const [report, setReport] = useState<string>('');

  const runValidation = async () => {
    setIsValidating(true);
    setProgress(0);
    setResults([]);
    
    const validationResults: ValidationResult[] = [];

    try {
      // Step 1: Health Check (20% progress)
      setProgress(20);
      const healthCheck = await HealthCheckService.performHealthCheck();
      validationResults.push({
        category: 'System Health',
        status: healthCheck.overall === 'healthy' ? 'pass' : 
                healthCheck.overall === 'degraded' ? 'warning' : 'fail',
        message: `${healthCheck.summary.healthy}/${healthCheck.checks.length} services healthy`,
        details: `Degraded: ${healthCheck.summary.degraded}, Unhealthy: ${healthCheck.summary.unhealthy}`
      });

      // Step 2: Critical User Flows (40% progress)
      setProgress(40);
      const criticalFlows = await AutomatedTestRunner.runCriticalUserFlows();
      validationResults.push({
        category: 'Authentication Flow',
        status: criticalFlows.authentication ? 'pass' : 'fail',
        message: criticalFlows.authentication ? 'Authentication system working' : 'Authentication issues detected'
      });

      validationResults.push({
        category: 'Package Management',
        status: criticalFlows.packageManagement ? 'pass' : 'fail',
        message: criticalFlows.packageManagement ? 'Package system working' : 'Package management issues detected'
      });

      validationResults.push({
        category: 'Customer Management',
        status: criticalFlows.customerManagement ? 'pass' : 'fail',
        message: criticalFlows.customerManagement ? 'Customer system working' : 'Customer management issues detected'
      });

      // Step 3: Performance Tests (60% progress)
      setProgress(60);
      try {
        await AutomatedTestRunner.runPerformanceTests();
        validationResults.push({
          category: 'Performance',
          status: 'pass',
          message: 'Performance tests completed successfully'
        });
      } catch (error) {
        validationResults.push({
          category: 'Performance',
          status: 'warning',
          message: 'Some performance tests had issues',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Step 4: Production Configuration (80% progress)
      setProgress(80);
      try {
        const prodCheck = await AutomatedTestRunner.runProductionReadinessCheck();
        validationResults.push({
          category: 'Production Config',
          status: prodCheck.configuration.ready ? 'pass' : 
                  prodCheck.configuration.recommendations.length > 0 ? 'warning' : 'fail',
          message: prodCheck.configuration.ready ? 'Production configuration valid' : 'Configuration issues found',
          details: prodCheck.configuration.issues.join(', ')
        });
      } catch (error) {
        validationResults.push({
          category: 'Production Config',
          status: 'fail',
          message: 'Production configuration check failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Step 5: Generate Report (100% progress)
      setProgress(100);
      const healthReport = await HealthCheckService.generateHealthReport();
      setReport(healthReport);

      // Determine overall status
      const failedTests = validationResults.filter(r => r.status === 'fail').length;
      const warningTests = validationResults.filter(r => r.status === 'warning').length;

      if (failedTests > 0) {
        setOverallStatus('fail');
      } else if (warningTests > 0) {
        setOverallStatus('warning');
      } else {
        setOverallStatus('pass');
      }

      setResults(validationResults);

    } catch (error) {
      console.error('Validation failed:', error);
      validationResults.push({
        category: 'Validation System',
        status: 'fail',
        message: 'Validation process encountered an error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      setResults(validationResults);
      setOverallStatus('fail');
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: ValidationResult['status'] | null) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'fail': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Production Readiness Validator</CardTitle>
            <div className="flex items-center gap-4">
              {overallStatus && (
                <Badge className={getStatusColor(overallStatus)}>
                  {overallStatus === 'pass' ? '✅ Ready for Production' : 
                   overallStatus === 'warning' ? '⚠️ Ready with Warnings' : '❌ Not Ready'}
                </Badge>
              )}
              <Button 
                onClick={runValidation} 
                disabled={isValidating}
                size="sm"
              >
                {isValidating ? (
                  <>Validating...</>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Validation
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isValidating && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Validation Progress</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {results.length === 0 && !isValidating ? (
            <div className="text-center py-8 text-gray-500">
              Click "Run Validation" to perform a comprehensive production readiness check.
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{result.category}</h4>
                      <Badge variant={result.status === 'pass' ? 'default' : 
                                    result.status === 'warning' ? 'secondary' : 'destructive'}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {report && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" />
                <h4 className="font-medium">System Health Report</h4>
              </div>
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {report}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
