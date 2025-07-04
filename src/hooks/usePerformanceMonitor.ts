import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

export function useRenderTime(componentName: string) {
  const startTime = useRef<number>(0);
  
  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;
      
      // Only log if render time is concerning (> 16ms for 60fps)
      if (renderTime > 16) {
        console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
      
      // In development, track metrics
      if (process.env.NODE_ENV === 'development') {
        const metrics: PerformanceMetrics = {
          renderTime,
          componentName,
          timestamp: Date.now()
        };
        
        // Store in sessionStorage for debugging
        const existingMetrics = JSON.parse(sessionStorage.getItem('perf-metrics') || '[]');
        existingMetrics.push(metrics);
        
        // Keep only last 100 entries
        if (existingMetrics.length > 100) {
          existingMetrics.splice(0, 50);
        }
        
        sessionStorage.setItem('perf-metrics', JSON.stringify(existingMetrics));
      }
    };
  }, [componentName]);
}

export function useInteractionObserver(elementRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!elementRef.current || !('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add performance optimizations for visible elements
            entry.target.classList.add('visible');
          } else {
            // Remove expensive animations for off-screen elements
            entry.target.classList.remove('visible');
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );
    
    observer.observe(elementRef.current);
    
    return () => observer.disconnect();
  }, [elementRef]);
}

export function useMemoryMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const used = Math.round(memory.usedJSHeapSize / 1048576);
        const total = Math.round(memory.totalJSHeapSize / 1048576);
        
        if (used > 50) { // More than 50MB
          console.warn(`[Memory] High usage: ${used}MB / ${total}MB`);
        }
      }
    };
    
    const interval = setInterval(checkMemory, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, []);
}
