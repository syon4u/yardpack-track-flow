import React, { Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentOptions {
  fallback?: React.ReactNode;
  delay?: number;
}

// Higher-order component for lazy loading with suspense
export function withLazyLoading<P extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions = {}
) {
  const { fallback, delay = 0 } = options;

  const LazyComponent = React.lazy(() => {
    if (delay > 0) {
      return new Promise<{ default: ComponentType<P> }>(resolve => {
        setTimeout(() => {
          importFn().then(resolve);
        }, delay);
      });
    }
    return importFn();
  });

  return function WrappedComponent(props: P) {
    const defaultFallback = (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );

    return (
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}

// Lazy route component wrapper
export function LazyRoute<P extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  return withLazyLoading(importFn, {
    fallback: fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-96">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  });
}

// Intersection Observer hook for lazy loading components
export function useInViewLazy(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const [isInView, setIsInView] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
        ...options,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return [ref, isInView];
}

// Component for lazy loading content when it comes into view
interface LazyContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  rootMargin?: string;
}

export const LazyContent: React.FC<LazyContentProps> = ({
  children,
  fallback,
  className = '',
  rootMargin = '100px'
}) => {
  const [ref, isInView] = useInViewLazy({ rootMargin });
  
  const defaultFallback = (
    <div className="animate-pulse">
      <Skeleton className="h-32 w-full" />
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {isInView ? children : (fallback || defaultFallback)}
    </div>
  );
};

// Preload function for critical routes
export function preloadRoute(routeImport: () => Promise<any>) {
  // Only preload if the browser is idle and has good connection
  if ('requestIdleCallback' in window && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    
    if (connection.effectiveType === '4g' && !connection.saveData) {
      requestIdleCallback(() => {
        routeImport();
      });
    }
  }
}

// Code splitting utilities
export const lazy = {
  // Dashboard routes
  Dashboard: LazyRoute(() => import('@/components/Dashboard')),
  AdminDashboard: LazyRoute(() => import('@/components/AdminDashboard')),
  CustomerDashboard: LazyRoute(() => import('@/components/CustomerDashboard')),
  
  // Package management
  PackageList: LazyRoute(() => import('@/components/PackageList')),
  PackageDetail: LazyRoute(() => import('@/pages/PackageDetailPage')),
  
  // Analytics
  AnalyticsDashboard: LazyRoute(() => import('@/components/dashboard/AnalyticsDashboard')),
  FinancialReports: LazyRoute(() => import('@/components/financial/FinancialReportingDashboard')),
  
  // Auth
  AuthPage: LazyRoute(() => import('@/pages/AuthPage')),
};