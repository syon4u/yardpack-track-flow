interface ErrorReport {
  error: Error;
  errorInfo?: any;
  userId?: string;
  userAgent: string;
  url: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private reportQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;

  private constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
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
      context,
    };

    console.error('Error Report:', report);

    if (this.isOnline) {
      try {
        await this.sendReport(report);
      } catch (sendError) {
        console.error('Failed to send error report:', sendError);
        this.queueReport(report);
      }
    } else {
      this.queueReport(report);
    }
  }

  private async sendReport(report: ErrorReport): Promise<void> {
    // In a real implementation, you'd send this to your error tracking service
    // For now, we'll just log it and store it locally
    console.warn('Error Report (would be sent to service):', report);
    
    // Store in localStorage for debugging
    const existingReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
    existingReports.push(report);
    
    // Keep only the last 50 reports
    if (existingReports.length > 50) {
      existingReports.splice(0, existingReports.length - 50);
    }
    
    localStorage.setItem('errorReports', JSON.stringify(existingReports));
  }

  private queueReport(report: ErrorReport): void {
    this.reportQueue.push(report);
    
    // Limit queue size
    if (this.reportQueue.length > 100) {
      this.reportQueue.shift();
    }
  }

  private async flushQueue(): Promise<void> {
    while (this.reportQueue.length > 0 && this.isOnline) {
      const report = this.reportQueue.shift();
      if (report) {
        try {
          await this.sendReport(report);
        } catch (error) {
          console.error('Failed to flush error report:', error);
          // Put it back at the front of the queue
          this.reportQueue.unshift(report);
          break;
        }
      }
    }
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from your auth context or localStorage
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id;
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return undefined;
  }

  public getStoredReports(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('errorReports') || '[]');
    } catch (error) {
      return [];
    }
  }
}

export const errorReporter = ErrorReportingService.getInstance();
