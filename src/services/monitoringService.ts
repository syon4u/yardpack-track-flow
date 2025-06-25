import { supabase } from '@/integrations/supabase/client';

export interface ErrorLog {
  id?: string;
  user_id?: string;
  error_type: 'javascript' | 'api' | 'auth' | 'database' | 'network';
  error_message: string;
  error_stack?: string;
  url: string;
  user_agent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

export interface PerformanceMetric {
  id?: string;
  user_id?: string;
  metric_name: string;
  metric_value: number;
  url: string;
  timestamp: string;
  context?: Record<string, any>;
}

export interface UserActivity {
  id?: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent: string;
  timestamp: string;
}

export class MonitoringService {
  private static performanceObserver: PerformanceObserver | null = null;

  static async logError(error: Error | string, context?: Record<string, any>, severity: ErrorLog['severity'] = 'medium'): Promise<void> {
    try {
      const errorLog: Omit<ErrorLog, 'id'> = {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        error_type: 'javascript',
        error_message: typeof error === 'string' ? error : error.message,
        error_stack: typeof error === 'object' ? error.stack : undefined,
        url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity,
        context
      };

      // Log to console for development
      if (severity === 'critical' || severity === 'high') {
        console.error('Critical/High Error:', errorLog);
      } else {
        console.warn('Error logged:', errorLog);
      }

      // Store in local storage as backup (with size limit)
      this.storeLocalError(errorLog);

      // TODO: In production, send to external logging service
      // await this.sendToLogService(errorLog);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  static async logPerformanceMetric(metricName: string, value: number, context?: Record<string, any>): Promise<void> {
    try {
      const metric: Omit<PerformanceMetric, 'id'> = {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        metric_name: metricName,
        metric_value: value,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        context
      };

      console.log('Performance metric:', metric);
      
      // Store locally for analysis
      this.storeLocalMetric(metric);
    } catch (error) {
      console.error('Failed to log performance metric:', error);
    }
  }

  static async logUserActivity(action: string, resourceType?: string, resourceId?: string, details?: Record<string, any>): Promise<void> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const activity: Omit<UserActivity, 'id'> = {
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      console.log('User activity:', activity);
      
      // Store in local storage for audit trail
      this.storeLocalActivity(activity);
    } catch (error) {
      console.error('Failed to log user activity:', error);
    }
  }

  static initializePerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Cumulative Layout Shift
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            this.logPerformanceMetric('CLS', (entry as any).value);
          }
        }
      });

      try {
        this.performanceObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Could not observe layout shifts:', error);
      }

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.logPerformanceMetric('LCP', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.logPerformanceMetric('FID', (entry as any).processingStart - entry.startTime);
        }
      }).observe({ entryTypes: ['first-input'] });
    }

    // Monitor page load times
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.logPerformanceMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
          this.logPerformanceMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          this.logPerformanceMetric('first_byte', navigation.responseStart - navigation.fetchStart);
        }
      }, 0);
    });
  }

  static getHealthStatus(): Record<string, any> {
    const errors = this.getLocalErrors();
    const metrics = this.getLocalMetrics();
    const activities = this.getLocalActivities();

    return {
      timestamp: new Date().toISOString(),
      errors: {
        total: errors.length,
        critical: errors.filter(e => e.severity === 'critical').length,
        high: errors.filter(e => e.severity === 'high').length,
        recent: errors.filter(e => Date.now() - new Date(e.timestamp).getTime() < 60000).length
      },
      performance: {
        recent_metrics: metrics.slice(-10),
        avg_page_load: this.calculateAverageMetric(metrics, 'page_load_time')
      },
      user_activity: {
        total: activities.length,
        recent: activities.filter(a => Date.now() - new Date(a.timestamp).getTime() < 300000).length
      }
    };
  }

  private static storeLocalError(error: Omit<ErrorLog, 'id'>): void {
    try {
      const errors = this.getLocalErrors();
      errors.unshift({ ...error, id: crypto.randomUUID() });
      
      // Keep only last 100 errors
      if (errors.length > 100) {
        errors.splice(100);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (error) {
      console.error('Failed to store error locally:', error);
    }
  }

  private static storeLocalMetric(metric: Omit<PerformanceMetric, 'id'>): void {
    try {
      const metrics = this.getLocalMetrics();
      metrics.unshift({ ...metric, id: crypto.randomUUID() });
      
      // Keep only last 50 metrics
      if (metrics.length > 50) {
        metrics.splice(50);
      }
      
      localStorage.setItem('app_metrics', JSON.stringify(metrics));
    } catch (error) {
      console.error('Failed to store metric locally:', error);
    }
  }

  private static storeLocalActivity(activity: Omit<UserActivity, 'id'>): void {
    try {
      const activities = this.getLocalActivities();
      activities.unshift({ ...activity, id: crypto.randomUUID() });
      
      // Keep only last 200 activities
      if (activities.length > 200) {
        activities.splice(200);
      }
      
      localStorage.setItem('app_activities', JSON.stringify(activities));
    } catch (error) {
      console.error('Failed to store activity locally:', error);
    }
  }

  private static getLocalErrors(): ErrorLog[] {
    try {
      const stored = localStorage.getItem('app_errors');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static getLocalMetrics(): PerformanceMetric[] {
    try {
      const stored = localStorage.getItem('app_metrics');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static getLocalActivities(): UserActivity[] {
    try {
      const stored = localStorage.getItem('app_activities');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static calculateAverageMetric(metrics: PerformanceMetric[], metricName: string): number {
    const relevantMetrics = metrics.filter(m => m.metric_name === metricName);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.metric_value, 0);
    return sum / relevantMetrics.length;
  }

  static cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  MonitoringService.logError(event.error || event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  }, 'high');
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  MonitoringService.logError(event.reason, {
    type: 'unhandled_promise_rejection'
  }, 'high');
});
