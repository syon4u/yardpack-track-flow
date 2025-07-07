/**
 * Enhanced error reporting service for production monitoring
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  userId?: string;
  userRole?: string;
  route?: string;
  userAgent?: string;
  timestamp?: number;
  buildVersion?: string;
  [key: string]: any;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  timestamp: number;
  count: number;
  firstSeen: number;
  lastSeen: number;
}

class ErrorReportingService {
  private errors: Map<string, ErrorReport> = new Map();
  private maxErrors = 100;
  private reportingEnabled = true;
  private buildVersion = '1.0.0'; // Should be set from environment

  /**
   * Report an error with context
   */
  reportError(
    error: Error | string,
    severity: ErrorSeverity = 'medium',
    context: ErrorContext = {}
  ): void {
    if (!this.reportingEnabled) return;

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    const errorId = this.generateErrorId(errorMessage, errorStack);
    
    const now = Date.now();
    const existingError = this.errors.get(errorId);
    
    if (existingError) {
      // Update existing error
      existingError.count++;
      existingError.lastSeen = now;
      existingError.context = { ...existingError.context, ...context };
      
      // Escalate severity if error is recurring rapidly
      if (existingError.count > 10 && (now - existingError.firstSeen) < 60000) {
        existingError.severity = 'critical';
      }
    } else {
      // Create new error report
      const newError: ErrorReport = {
        id: errorId,
        message: errorMessage,
        stack: errorStack,
        severity,
        context: {
          ...this.getDefaultContext(),
          ...context,
        },
        timestamp: now,
        count: 1,
        firstSeen: now,
        lastSeen: now,
      };
      
      this.errors.set(errorId, newError);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const errorReport = this.errors.get(errorId)!;
      console.group(`🚨 Error Report (${severity})`);
      console.error('Message:', errorMessage);
      if (errorStack) console.error('Stack:', errorStack);
      console.log('Context:', errorReport.context);
      console.log('Count:', errorReport.count);
      console.groupEnd();
    }

    // Send to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(this.errors.get(errorId)!);
    }

    // Manage memory usage
    this.cleanupOldErrors();
  }

  /**
   * Report a user action error (form submissions, etc.)
   */
  reportUserActionError(
    action: string,
    error: Error | string,
    context: ErrorContext = {}
  ): void {
    this.reportError(error, 'medium', {
      ...context,
      errorType: 'user-action',
      action,
    });
  }

  /**
   * Report API/Network errors
   */
  reportApiError(
    endpoint: string,
    method: string,
    status: number,
    error: Error | string,
    context: ErrorContext = {}
  ): void {
    const severity: ErrorSeverity = status >= 500 ? 'high' : 'medium';
    
    this.reportError(error, severity, {
      ...context,
      errorType: 'api',
      endpoint,
      method,
      status,
    });
  }

  /**
   * Report database/query errors
   */
  reportDatabaseError(
    operation: string,
    table: string,
    error: Error | string,
    context: ErrorContext = {}
  ): void {
    this.reportError(error, 'high', {
      ...context,
      errorType: 'database',
      operation,
      table,
    });
  }

  /**
   * Report performance issues
   */
  reportPerformanceIssue(
    operation: string,
    duration: number,
    threshold: number,
    context: ErrorContext = {}
  ): void {
    const severity: ErrorSeverity = duration > threshold * 3 ? 'high' : 'medium';
    
    this.reportError(
      `Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`,
      severity,
      {
        ...context,
        errorType: 'performance',
        operation,
        duration,
        threshold,
      }
    );
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    recent: ErrorReport[];
    frequent: ErrorReport[];
  } {
    const errors = Array.from(this.errors.values());
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    
    errors.forEach(error => {
      bySeverity[error.severity]++;
    });
    
    const recent = errors
      .filter(error => now - error.lastSeen < oneHour)
      .sort((a, b) => b.lastSeen - a.lastSeen)
      .slice(0, 10);
    
    const frequent = errors
      .filter(error => error.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      total: errors.length,
      bySeverity,
      recent,
      frequent,
    };
  }

  /**
   * Clear all error reports
   */
  clearErrors(): void {
    this.errors.clear();
  }

  /**
   * Enable/disable error reporting
   */
  setReportingEnabled(enabled: boolean): void {
    this.reportingEnabled = enabled;
  }

  /**
   * Set build version for context
   */
  setBuildVersion(version: string): void {
    this.buildVersion = version;
  }

  private generateErrorId(message: string, stack?: string): string {
    const combined = message + (stack || '');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private getDefaultContext(): ErrorContext {
    return {
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
      buildVersion: this.buildVersion,
    };
  }

  private async sendToExternalService(error: ErrorReport): Promise<void> {
    try {
      // In a real production app, you'd send to Sentry, LogRocket, etc.
      // For now, we'll send to a hypothetical endpoint
      
      /* Example implementation:
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
      */
      
      // For demonstration, just log that we'd send it
      console.log('Would send error to external service:', error.id);
    } catch (sendError) {
      console.warn('Failed to send error to external service:', sendError);
    }
  }

  private cleanupOldErrors(): void {
    if (this.errors.size <= this.maxErrors) return;
    
    const errors = Array.from(this.errors.entries());
    const sortedByAge = errors.sort(([, a], [, b]) => a.lastSeen - b.lastSeen);
    
    // Remove oldest errors
    const toRemove = sortedByAge.slice(0, this.errors.size - this.maxErrors);
    toRemove.forEach(([id]) => this.errors.delete(id));
  }
}

export const errorReportingService = new ErrorReportingService();

// Set up global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorReportingService.reportError(event.error || event.message, 'high', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorReportingService.reportError(
      event.reason || 'Unhandled promise rejection',
      'high',
      { type: 'unhandled-rejection' }
    );
  });
}