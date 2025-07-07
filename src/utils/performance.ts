/**
 * Performance Monitoring and Optimization Utilities
 * Provides tools for monitoring app performance and implementing optimizations
 */

import { config, isFeatureEnabled } from '@/config/environment';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  private constructor() {
    if (isFeatureEnabled('enablePerformanceMonitoring')) {
      this.initializeMonitoring();
    }
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeMonitoring(): void {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => this.recordPageLoadMetrics(), 0);
    });

    // Monitor navigation performance
    this.observeNavigationTiming();
    
    // Monitor resource loading
    this.observeResourceTiming();
    
    // Monitor Core Web Vitals
    this.observeCoreWebVitals();
  }

  public recordMetric(name: string, value: number, context?: Record<string, any>): void {
    if (!isFeatureEnabled('enablePerformanceMonitoring')) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context,
    };

    this.metrics.push(metric);

    // Limit stored metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log in development
    if (config.isDevelopment) {
      console.log(`📊 Performance: ${name} = ${value}ms`, context);
    }
  }

  public startTimer(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
    };
  }

  private recordPageLoadMetrics(): void {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.recordMetric('page-load-total', navigation.loadEventEnd - navigation.loadEventStart);
        this.recordMetric('dom-content-loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        this.recordMetric('first-byte', navigation.responseStart - navigation.requestStart);
        this.recordMetric('dom-interactive', navigation.domInteractive);
      }
    } catch (error) {
      console.warn('Failed to record page load metrics:', error);
    }
  }

  private observeNavigationTiming(): void {
    // Use Navigation API if available
    if ('navigation' in window) {
      (window as any).navigation.addEventListener('navigate', (event: any) => {
        const startTime = performance.now();
        
        event.intercept({
          handler: () => {
            const endTime = performance.now();
            this.recordMetric('navigation-duration', endTime - startTime, {
              url: event.destination.url,
            });
          }
        });
      });
    }
  }

  private observeResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          // Track slow resources
          if (resource.duration > 1000) {
            this.recordMetric('slow-resource', resource.duration, {
              name: resource.name,
              type: this.getResourceType(resource.name),
              size: resource.transferSize,
            });
          }
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private observeCoreWebVitals(): void {
    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('first-contentful-paint', entry.startTime);
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('largest-contentful-paint', lastEntry.startTime);
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  public getAverageMetric(name: string): number {
    const nameMetrics = this.getMetricsByName(name);
    if (nameMetrics.length === 0) return 0;
    
    const sum = nameMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / nameMetrics.length;
  }

  public clearMetrics(): void {
    this.metrics = [];
  }

  public exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      environment: config.environment,
      metrics: this.metrics,
      summary: this.getMetricsSummary(),
    }, null, 2);
  }

  private getMetricsSummary() {
    const summary: Record<string, any> = {};
    
    const uniqueNames = [...new Set(this.metrics.map(m => m.name))];
    
    for (const name of uniqueNames) {
      const nameMetrics = this.getMetricsByName(name);
      summary[name] = {
        count: nameMetrics.length,
        average: this.getAverageMetric(name),
        min: Math.min(...nameMetrics.map(m => m.value)),
        max: Math.max(...nameMetrics.map(m => m.value)),
      };
    }
    
    return summary;
  }
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for expensive operations
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // Throttle function for frequent events
  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastExecution = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastExecution >= delay) {
        func(...args);
        lastExecution = now;
      }
    };
  },

  // Lazy load images
  lazyLoadImage(img: HTMLImageElement, src: string): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            observer.unobserve(img);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(img);
  },

  // Prefetch resources
  prefetchResource(url: string, type: 'script' | 'style' | 'image' = 'script'): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    if (type !== 'image') {
      link.as = type;
    }
    document.head.appendChild(link);
  },

  // Measure component render time
  measureRender(componentName: string, renderFn: () => void): void {
    const monitor = PerformanceMonitor.getInstance();
    const timer = monitor.startTimer(`render-${componentName}`);
    renderFn();
    timer();
  },
};

export const performanceMonitor = PerformanceMonitor.getInstance();