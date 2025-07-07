/**
 * Performance monitoring service for tracking app performance metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface DatabasePerformanceMetric extends PerformanceMetric {
  queryType: 'select' | 'insert' | 'update' | 'delete';
  tableName: string;
  recordCount?: number;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  private reportingEnabled = true;

  /**
   * Mark the start of a performance measurement
   */
  startMeasurement(name: string): string {
    const markName = `${name}-start`;
    performance.mark(markName);
    return markName;
  }

  /**
   * End a performance measurement and record the metric
   */
  endMeasurement(name: string, metadata?: Record<string, any>): number {
    const endMark = `${name}-end`;
    const startMark = `${name}-start`;
    
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);
    
    const entries = performance.getEntriesByName(name, 'measure');
    const latestEntry = entries[entries.length - 1];
    
    if (latestEntry) {
      this.recordMetric({
        name,
        value: latestEntry.duration,
        timestamp: Date.now(),
        metadata,
      });
      
      // Clean up marks and measures
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);
      
      return latestEntry.duration;
    }
    
    return 0;
  }

  /**
   * Measure a function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startMeasurement(name);
    
    try {
      const result = await fn();
      this.endMeasurement(name, metadata);
      return result;
    } catch (error) {
      this.endMeasurement(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Measure a synchronous function execution time
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startMeasurement(name);
    
    try {
      const result = fn();
      this.endMeasurement(name, metadata);
      return result;
    } catch (error) {
      this.endMeasurement(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.reportingEnabled) return;

    this.metrics.push(metric);
    
    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Report slow operations
    if (metric.value > 1000) { // > 1 second
      console.warn(`Slow operation detected: ${metric.name} took ${metric.value.toFixed(2)}ms`, metric);
    }
  }

  /**
   * Record database query performance
   */
  recordDatabaseMetric(metric: DatabasePerformanceMetric): void {
    this.recordMetric(metric);
    
    // Log very slow queries
    if (metric.value > 5000) { // > 5 seconds
      console.error(`Very slow database query: ${metric.name}`, metric);
    }
  }

  /**
   * Get performance metrics for a specific operation
   */
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  /**
   * Get average performance for an operation
   */
  getAveragePerformance(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  /**
   * Get performance percentiles
   */
  getPerformancePercentiles(name: string): { p50: number; p90: number; p95: number; p99: number } {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return { p50: 0, p90: 0, p95: 0, p99: 0 };
    
    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const length = values.length;
    
    return {
      p50: values[Math.floor(length * 0.5)],
      p90: values[Math.floor(length * 0.9)],
      p95: values[Math.floor(length * 0.95)],
      p99: values[Math.floor(length * 0.99)],
    };
  }

  /**
   * Monitor Core Web Vitals
   */
  monitorCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'core-web-vitals-lcp',
              value: entry.startTime,
              timestamp: Date.now(),
              metadata: { type: 'lcp' },
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'core-web-vitals-fid',
              value: (entry as any).processingStart - entry.startTime,
              timestamp: Date.now(),
              metadata: { type: 'fid' },
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          
          this.recordMetric({
            name: 'core-web-vitals-cls',
            value: clsValue,
            timestamp: Date.now(),
            metadata: { type: 'cls' },
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Failed to set up Core Web Vitals monitoring:', error);
      }
    }
  }

  /**
   * Monitor bundle loading performance
   */
  monitorResourceLoading(): void {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const resource = entry as PerformanceResourceTiming;
            
            this.recordMetric({
              name: 'resource-loading',
              value: resource.duration,
              timestamp: Date.now(),
              metadata: {
                name: resource.name,
                type: resource.initiatorType,
                size: resource.transferSize || 0,
                cached: resource.transferSize === 0 && resource.decodedBodySize > 0,
              },
            });
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Failed to set up resource loading monitoring:', error);
      }
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: Record<string, { avg: number; p95: number; count: number }>;
    coreWebVitals: { lcp?: number; fid?: number; cls?: number };
    slowQueries: DatabasePerformanceMetric[];
  } {
    const operationNames = [...new Set(this.metrics.map(m => m.name))];
    const summary: Record<string, { avg: number; p95: number; count: number }> = {};
    
    operationNames.forEach(name => {
      const metrics = this.getMetrics(name);
      const percentiles = this.getPerformancePercentiles(name);
      const average = this.getAveragePerformance(name);
      
      summary[name] = {
        avg: Math.round(average * 100) / 100,
        p95: Math.round(percentiles.p95 * 100) / 100,
        count: metrics.length,
      };
    });

    // Core Web Vitals
    const lcpMetrics = this.getMetrics('core-web-vitals-lcp');
    const fidMetrics = this.getMetrics('core-web-vitals-fid');
    const clsMetrics = this.getMetrics('core-web-vitals-cls');
    
    const coreWebVitals = {
      lcp: lcpMetrics.length > 0 ? lcpMetrics[lcpMetrics.length - 1].value : undefined,
      fid: fidMetrics.length > 0 ? fidMetrics[fidMetrics.length - 1].value : undefined,
      cls: clsMetrics.length > 0 ? clsMetrics[clsMetrics.length - 1].value : undefined,
    };

    // Slow database queries
    const slowQueries = this.metrics
      .filter((m): m is DatabasePerformanceMetric => 
        m.name.includes('database') && m.value > 3000
      );

    return { summary, coreWebVitals, slowQueries };
  }

  /**
   * Enable/disable performance reporting
   */
  setReportingEnabled(enabled: boolean): void {
    this.reportingEnabled = enabled;
  }

  /**
   * Clear all stored metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

export const performanceService = new PerformanceService();

// Auto-initialize monitoring in browser environment
if (typeof window !== 'undefined') {
  performanceService.monitorCoreWebVitals();
  performanceService.monitorResourceLoading();
}
