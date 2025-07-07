/**
 * Production Readiness Hook
 * Monitors and reports on production readiness status
 */

import { useState, useEffect } from 'react';
import { config, validateConfig } from '@/config/environment';
import { errorReporter } from '@/services/errorReporting';
import { performanceMonitor } from '@/utils/performance';

interface ProductionReadinessStatus {
  overall: 'ready' | 'warning' | 'critical';
  score: number; // 0-100
  checks: {
    environment: boolean;
    security: boolean;
    performance: boolean;
    errorReporting: boolean;
    database: boolean;
  };
  recommendations: string[];
  metrics: {
    errorCount: number;
    avgResponseTime: number;
    uptime: number;
  };
}

export const useProductionReadiness = () => {
  const [status, setStatus] = useState<ProductionReadinessStatus>({
    overall: 'warning',
    score: 0,
    checks: {
      environment: false,
      security: false,
      performance: false,
      errorReporting: false,
      database: false,
    },
    recommendations: [],
    metrics: {
      errorCount: 0,
      avgResponseTime: 0,
      uptime: 100,
    },
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProductionReadiness = async () => {
      setIsLoading(true);
      
      try {
        const checks = await performReadinessChecks();
        const score = calculateReadinessScore(checks);
        const overall = getOverallStatus(score);
        const recommendations = generateRecommendations(checks);
        const metrics = await getMetrics();

        setStatus({
          overall,
          score,
          checks,
          recommendations,
          metrics,
        });
      } catch (error) {
        console.error('Failed to check production readiness:', error);
        errorReporter.reportError(error as Error, 'medium', {
          context: 'production-readiness-check',
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkProductionReadiness();
    
    // Re-check every 5 minutes
    const interval = setInterval(checkProductionReadiness, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const performReadinessChecks = async () => {
    const checks = {
      environment: checkEnvironmentConfig(),
      security: checkSecurityConfig(),
      performance: await checkPerformanceMetrics(),
      errorReporting: checkErrorReporting(),
      database: await checkDatabaseHealth(),
    };

    return checks;
  };

  const checkEnvironmentConfig = (): boolean => {
    try {
      return (
        validateConfig() &&
        config.supabase.url.length > 0 &&
        config.supabase.anonKey.length > 0 &&
        config.app.name.length > 0
      );
    } catch {
      return false;
    }
  };

  const checkSecurityConfig = (): boolean => {
    // Check if security headers are properly configured
    const hasCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
    const isHTTPS = window.location.protocol === 'https:' || config.isDevelopment;
    
    return hasCSP && isHTTPS;
  };

  const checkPerformanceMetrics = async (): Promise<boolean> => {
    try {
      // Check Core Web Vitals
      const lcpMetric = performanceMonitor.getAverageMetric('largest-contentful-paint');
      const fcpMetric = performanceMonitor.getAverageMetric('first-contentful-paint');
      
      // LCP should be under 2.5s, FCP under 1.8s
      const performanceGood = (lcpMetric === 0 || lcpMetric < 2500) && 
                             (fcpMetric === 0 || fcpMetric < 1800);
      
      return performanceGood;
    } catch {
      return false;
    }
  };

  const checkErrorReporting = (): boolean => {
    try {
      const summary = errorReporter.getErrorSummary();
      const recentErrors = errorReporter.getStoredReports()
        .filter(report => {
          const reportTime = new Date(report.timestamp).getTime();
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          return reportTime > oneHourAgo;
        });

      // No critical errors in the last hour
      const noCriticalErrors = recentErrors.filter(r => r.severity === 'critical').length === 0;
      const lowErrorRate = recentErrors.length < 10; // Less than 10 errors per hour
      
      return noCriticalErrors && lowErrorRate;
    } catch {
      return false;
    }
  };

  const checkDatabaseHealth = async (): Promise<boolean> => {
    try {
      // Simple health check - try to connect to Supabase
      const response = await fetch(`${config.supabase.url}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': config.supabase.anonKey,
        },
      });
      
      return response.ok;
    } catch {
      return false;
    }
  };

  const calculateReadinessScore = (checks: typeof status.checks): number => {
    const weights = {
      environment: 25,
      security: 25,
      performance: 20,
      errorReporting: 15,
      database: 15,
    };

    let score = 0;
    Object.entries(checks).forEach(([key, passed]) => {
      if (passed) {
        score += weights[key as keyof typeof weights];
      }
    });

    return score;
  };

  const getOverallStatus = (score: number): 'ready' | 'warning' | 'critical' => {
    if (score >= 90) return 'ready';
    if (score >= 70) return 'warning';
    return 'critical';
  };

  const generateRecommendations = (checks: typeof status.checks): string[] => {
    const recommendations: string[] = [];

    if (!checks.environment) {
      recommendations.push('Configure environment variables and validate application settings');
    }

    if (!checks.security) {
      recommendations.push('Implement security headers (CSP, HTTPS) and review security policies');
    }

    if (!checks.performance) {
      recommendations.push('Optimize performance metrics - target LCP < 2.5s and FCP < 1.8s');
    }

    if (!checks.errorReporting) {
      recommendations.push('Reduce error rate and resolve critical errors');
    }

    if (!checks.database) {
      recommendations.push('Check database connectivity and resolve connection issues');
    }

    // Additional recommendations based on environment
    if (config.isProduction && checks.errorReporting) {
      recommendations.push('Set up external error monitoring service (Sentry, LogRocket)');
    }

    if (config.isProduction && checks.performance) {
      recommendations.push('Implement CDN and advanced caching strategies');
    }

    return recommendations;
  };

  const getMetrics = async () => {
    const errorSummary = errorReporter.getErrorSummary();
    const avgResponseTime = performanceMonitor.getAverageMetric('page-load-total') || 0;
    
    return {
      errorCount: errorSummary.totalErrors || 0,
      avgResponseTime: Math.round(avgResponseTime),
      uptime: 100, // Would come from external monitoring in production
    };
  };

  const refreshStatus = () => {
    setIsLoading(true);
    // Trigger re-check
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return {
    status,
    isLoading,
    refreshStatus,
  };
};