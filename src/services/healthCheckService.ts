import { supabase } from '@/integrations/supabase/client';
import { MonitoringService } from './monitoringService';
import { SecurityService } from './securityService';

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  details?: Record<string, any>;
  lastChecked: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: HealthCheck[];
  summary: {
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

export class HealthCheckService {
  private static readonly HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds

  static async performHealthCheck(): Promise<SystemHealth> {
    const startTime = Date.now();
    const checks: HealthCheck[] = [];

    try {
      // Database connectivity check
      checks.push(await this.checkDatabase());

      // Authentication service check
      checks.push(await this.checkAuthentication());

      // Storage availability check
      checks.push(await this.checkStorage());

      // Performance metrics check
      checks.push(await this.checkPerformance());

      // Security status check
      checks.push(await this.checkSecurity());

      // Frontend availability check
      checks.push(await this.checkFrontend());

      const summary = {
        healthy: checks.filter(c => c.status === 'healthy').length,
        degraded: checks.filter(c => c.status === 'degraded').length,
        unhealthy: checks.filter(c => c.status === 'unhealthy').length,
      };

      let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (summary.unhealthy > 0) {
        overall = 'unhealthy';
      } else if (summary.degraded > 0) {
        overall = 'degraded';
      }

      const systemHealth: SystemHealth = {
        overall,
        timestamp: new Date().toISOString(),
        checks,
        summary
      };

      // Log health check results
      await MonitoringService.logUserActivity('health_check_performed', 'system', 'health', {
        overall,
        duration: Date.now() - startTime,
        summary
      });

      return systemHealth;

    } catch (error) {
      await MonitoringService.logError(error as Error, {
        operation: 'health_check'
      }, 'critical');

      return {
        overall: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: [{
          service: 'health_check_system',
          status: 'unhealthy',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          lastChecked: new Date().toISOString()
        }],
        summary: { healthy: 0, degraded: 0, unhealthy: 1 }
      };
    }
  }

  private static async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await Promise.race([
        supabase.from('profiles').select('count').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), this.HEALTH_CHECK_TIMEOUT)
        )
      ]) as any;

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          service: 'database',
          status: 'unhealthy',
          responseTime,
          details: { error: error.message },
          lastChecked: new Date().toISOString()
        };
      }

      return {
        service: 'database',
        status: responseTime > 2000 ? 'degraded' : 'healthy',
        responseTime,
        details: { connectionTest: 'passed' },
        lastChecked: new Date().toISOString()
      };

    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Connection failed' },
        lastChecked: new Date().toISOString()
      };
    }
  }

  private static async checkAuthentication(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const { valid, session } = await SecurityService.validateSession();
      const responseTime = Date.now() - startTime;

      return {
        service: 'authentication',
        status: 'healthy',
        responseTime,
        details: { 
          sessionValid: valid,
          hasActiveSession: !!session 
        },
        lastChecked: new Date().toISOString()
      };

    } catch (error) {
      return {
        service: 'authentication',
        status: 'degraded',
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Auth check failed' },
        lastChecked: new Date().toISOString()
      };
    }
  }

  private static async checkStorage(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Test localStorage availability
      const testKey = 'health_check_test';
      const testValue = Date.now().toString();
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      const responseTime = Date.now() - startTime;

      if (retrieved !== testValue) {
        return {
          service: 'storage',
          status: 'unhealthy',
          responseTime,
          details: { error: 'localStorage read/write failed' },
          lastChecked: new Date().toISOString()
        };
      }

      return {
        service: 'storage',
        status: 'healthy',
        responseTime,
        details: { localStorageTest: 'passed' },
        lastChecked: new Date().toISOString()
      };

    } catch (error) {
      return {
        service: 'storage',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Storage test failed' },
        lastChecked: new Date().toISOString()
      };
    }
  }

  private static async checkPerformance(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const healthStatus = MonitoringService.getHealthStatus();
      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (healthStatus.errors.critical > 0) {
        status = 'unhealthy';
      } else if (healthStatus.errors.high > 5 || healthStatus.errors.recent > 10) {
        status = 'degraded';
      }

      return {
        service: 'performance',
        status,
        responseTime,
        details: {
          recentErrors: healthStatus.errors.recent,
          criticalErrors: healthStatus.errors.critical,
          averagePageLoad: healthStatus.performance.avg_page_load
        },
        lastChecked: new Date().toISOString()
      };

    } catch (error) {
      return {
        service: 'performance',
        status: 'degraded',
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Performance check failed' },
        lastChecked: new Date().toISOString()
      };
    }
  }

  private static async checkSecurity(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check if security measures are in place
      const csrfToken = sessionStorage.getItem('csrf_token');
      const hasRateLimitData = Object.keys(localStorage).some(key => key.startsWith('security_'));
      
      const responseTime = Date.now() - startTime;

      return {
        service: 'security',
        status: 'healthy',
        responseTime,
        details: {
          csrfTokenPresent: !!csrfToken,
          rateLimitingActive: hasRateLimitData,
          httpsEnabled: location.protocol === 'https:'
        },
        lastChecked: new Date().toISOString()
      };

    } catch (error) {
      return {
        service: 'security',
        status: 'degraded',
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Security check failed' },
        lastChecked: new Date().toISOString()
      };
    }
  }

  private static async checkFrontend(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check critical DOM elements and app state
      const appRoot = document.getElementById('root');
      const hasReactRoot = !!appRoot;
      const hasReactErrors = false; // Remove data-reactroot logic for React 18+ compatibility
      
      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (!hasReactRoot) {
        status = 'unhealthy';
      }

      return {
        service: 'frontend',
        status,
        responseTime,
        details: {
          domLoaded: hasReactRoot,
          reactMounted: !hasReactErrors,
          userAgent: navigator.userAgent.substring(0, 50)
        },
        lastChecked: new Date().toISOString()
      };

    } catch (error) {
      return {
        service: 'frontend',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Frontend check failed' },
        lastChecked: new Date().toISOString()
      };
    }
  }

  static async generateHealthReport(): Promise<string> {
    const health = await this.performHealthCheck();
    
    const report = [
      `# System Health Report`,
      `Generated: ${health.timestamp}`,
      `Overall Status: ${health.overall.toUpperCase()}`,
      ``,
      `## Summary`,
      `- Healthy Services: ${health.summary.healthy}`,
      `- Degraded Services: ${health.summary.degraded}`,
      `- Unhealthy Services: ${health.summary.unhealthy}`,
      ``,
      `## Service Details`,
      ...health.checks.map(check => [
        `### ${check.service}`,
        `- Status: ${check.status.toUpperCase()}`,
        `- Response Time: ${check.responseTime}ms`,
        `- Last Checked: ${check.lastChecked}`,
        check.details ? `- Details: ${JSON.stringify(check.details, null, 2)}` : '',
        ``
      ].filter(Boolean).join('\n'))
    ].join('\n');

    return report;
  }

  static startPeriodicHealthChecks(intervalMinutes: number = 5): void {
    setInterval(async () => {
      const health = await this.performHealthCheck();
      
      if (health.overall === 'unhealthy') {
        await MonitoringService.logError(
          'System health check failed',
          { healthStatus: health },
          'critical'
        );
      }
    }, intervalMinutes * 60 * 1000);
  }
}
