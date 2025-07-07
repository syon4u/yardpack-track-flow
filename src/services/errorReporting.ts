import { config, isFeatureEnabled } from '@/config/environment';
import { getSecurityContext } from '@/utils/security';

interface ErrorReport {
  error: Error;
  errorInfo?: any;
  userId?: string;
  userAgent: string;
  url: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  sessionId: string;
  environment: string;
  securityContext: any;
}

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private reportQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;
  private sessionId: string;
  private retryAttempts = 0;
  private maxRetries = 3;

  private constructor() {
    this.sessionId = this.generateSessionId();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Setup periodic queue flush
    setInterval(() => {
      if (this.isOnline && this.reportQueue.length > 0) {
        this.flushQueue();
      }
    }, 30000); // Try every 30 seconds
  }

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  public async reportError(
    error: Error,
    severity: ErrorReport['severity'] = 'medium',
    context?: Record<string, any>,
    errorInfo?: any
  ): Promise<void> {
    // Skip if error reporting is disabled
    if (!isFeatureEnabled('enableErrorReporting')) {
      console.warn('Error reporting disabled:', error);
      return;
    }

    const report: ErrorReport = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as Error,
      errorInfo,
      userId: this.getCurrentUserId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      severity,
      context: {
        ...context,
        userInteraction: this.getUserInteractionContext(),
        performance: this.getPerformanceContext(),
      },
      sessionId: this.sessionId,
      environment: config.environment,
      securityContext: getSecurityContext(),
    };

    // Always log critical errors
    if (severity === 'critical') {
      console.error('🚨 CRITICAL ERROR:', report);
    } else if (config.isDevelopment) {
      console.error('Error Report:', report);
    }

    if (this.isOnline) {
      try {
        await this.sendReport(report);
        this.retryAttempts = 0; // Reset on success
      } catch (sendError) {
        console.error('Failed to send error report:', sendError);
        this.queueReport(report);
      }
    } else {
      this.queueReport(report);
    }
  }

  private async sendReport(report: ErrorReport): Promise<void> {
    try {
      // In production, this would send to your error tracking service (Sentry, etc.)
      // For now, we'll enhance the local storage approach
      
      if (config.isProduction) {
        // Simulate sending to external service
        const response = await this.sendToExternalService(report);
        if (!response.ok) {
          throw new Error(`Error service responded with status: ${response.status}`);
        }
      }
      
      // Store locally for debugging and offline support
      await this.storeReportLocally(report);
      
    } catch (error) {
      console.error('Error in sendReport:', error);
      throw error;
    }
  }

  private async sendToExternalService(report: ErrorReport): Promise<Response> {
    // This would typically send to Sentry, LogRocket, or similar service
    // Simulating the request for now
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(new Response('OK', { status: 200, statusText: 'OK' }));
      }, 1000);
    });
  }

  private async storeReportLocally(report: ErrorReport): Promise<void> {
    try {
      const existingReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
      existingReports.push(report);
      
      // Keep only the last 100 reports to prevent storage bloat
      if (existingReports.length > 100) {
        existingReports.splice(0, existingReports.length - 100);
      }
      
      localStorage.setItem('errorReports', JSON.stringify(existingReports));
      
      // Also store a summary for quick access
      const summary = {
        totalErrors: existingReports.length,
        criticalErrors: existingReports.filter((r: ErrorReport) => r.severity === 'critical').length,
        lastError: report.timestamp,
        sessionId: this.sessionId,
      };
      
      localStorage.setItem('errorSummary', JSON.stringify(summary));
      
    } catch (storageError) {
      console.error('Failed to store error report locally:', storageError);
    }
  }

  private queueReport(report: ErrorReport): void {
    this.reportQueue.push(report);
    
    // Limit queue size to prevent memory issues
    if (this.reportQueue.length > 200) {
      this.reportQueue.shift();
    }
  }

  private async flushQueue(): Promise<void> {
    if (this.retryAttempts >= this.maxRetries) {
      console.warn('Max retry attempts reached, clearing queue');
      this.reportQueue = [];
      this.retryAttempts = 0;
      return;
    }

    while (this.reportQueue.length > 0 && this.isOnline) {
      const report = this.reportQueue.shift();
      if (report) {
        try {
          await this.sendReport(report);
        } catch (error) {
          console.error('Failed to flush error report:', error);
          // Put it back at the front of the queue
          this.reportQueue.unshift(report);
          this.retryAttempts++;
          break;
        }
      }
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Try multiple auth storage keys
      const authKeys = ['supabase.auth.token', 'sb-auth-token'];
      
      for (const key of authKeys) {
        const authData = localStorage.getItem(key);
        if (authData) {
          const parsed = JSON.parse(authData);
          const userId = parsed?.user?.id || parsed?.access_token;
          if (userId) return userId;
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return undefined;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserInteractionContext() {
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY,
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
    };
  }

  private getPerformanceContext() {
    if (!isFeatureEnabled('enablePerformanceMonitoring')) {
      return {};
    }

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        memoryUsage: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit,
        } : undefined,
      };
    } catch (error) {
      return {};
    }
  }

  public getStoredReports(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('errorReports') || '[]');
    } catch (error) {
      return [];
    }
  }

  public getErrorSummary() {
    try {
      return JSON.parse(localStorage.getItem('errorSummary') || '{}');
    } catch (error) {
      return {};
    }
  }

  public clearReports(): void {
    localStorage.removeItem('errorReports');
    localStorage.removeItem('errorSummary');
    this.reportQueue = [];
  }
}

export const errorReporter = ErrorReportingService.getInstance();
