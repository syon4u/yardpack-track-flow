import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];

  private constructor() {
    this.initializeObservers();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            this.recordMetric(entry.name, entry.duration, 'timing');
          });
        });
        observer.observe({ entryTypes: ['navigation', 'measure'] });
      } catch (error) {
        console.warn('Performance monitoring setup failed:', error);
      }
    }
  }

  public recordMetric(
    name: string,
    value: number,
    type: PerformanceMetric['type'] = 'gauge',
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type,
      tags
    };

    this.metrics.push(metric);

    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  public getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  public getPerformanceReport(): Record<string, any> {
    const report: Record<string, any> = {};
    
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      report.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }

    return report;
  }

  public measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    this.recordMetric(`function_${name}`, duration, 'timing');
    return result;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

export function usePerformanceMonitor() {
  const recordMetric = React.useCallback(
    (name: string, value: number, type?: PerformanceMetric['type']) => {
      performanceMonitor.recordMetric(name, value, type);
    },
    []
  );

  const measureFunction = React.useCallback(
    <T>(name: string, fn: () => T) => {
      return performanceMonitor.measureFunction(name, fn);
    },
    []
  );

  return { recordMetric, measureFunction };
}