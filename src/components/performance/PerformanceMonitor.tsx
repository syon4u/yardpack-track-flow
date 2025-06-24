
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Database, Zap } from 'lucide-react';

interface PerformanceMetrics {
  queryTime: number;
  renderTime: number;
  cacheHitRate: number;
  activeQueries: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    queryTime: 0,
    renderTime: 0,
    cacheHitRate: 0,
    activeQueries: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    setIsVisible(process.env.NODE_ENV === 'development' || localStorage.getItem('showPerformanceMonitor') === 'true');

    // Monitor performance metrics
    const interval = setInterval(() => {
      // This would integrate with React Query devtools and custom performance tracking
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      setMetrics(prev => ({
        ...prev,
        queryTime: Math.round(Math.random() * 500 + 100), // Mock query time
        renderTime: Math.round(navigation?.loadEventEnd - navigation?.loadEventStart || 0),
        cacheHitRate: Math.round(Math.random() * 30 + 70), // Mock cache hit rate
        activeQueries: Math.floor(Math.random() * 5 + 1), // Mock active queries
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const getPerformanceColor = (value: number, thresholds: { good: number; ok: number }) => {
    if (value <= thresholds.good) return 'bg-green-500';
    if (value <= thresholds.ok) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 border-2 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance Monitor
          <button
            onClick={() => setIsVisible(false)}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Query Time</span>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-white",
              getPerformanceColor(metrics.queryTime, { good: 200, ok: 500 })
            )}
          >
            {metrics.queryTime}ms
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="text-sm">Render Time</span>
          </div>
          <Badge 
            variant="outline"
            className={cn(
              "text-white",
              getPerformanceColor(metrics.renderTime, { good: 16, ok: 33 })
            )}
          >
            {metrics.renderTime}ms
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Cache Hit Rate</span>
          </div>
          <Badge 
            variant="outline"
            className={cn(
              "text-white",
              metrics.cacheHitRate >= 80 ? 'bg-green-500' : 
              metrics.cacheHitRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            )}
          >
            {metrics.cacheHitRate}%
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Active Queries</span>
          </div>
          <Badge variant="outline">
            {metrics.activeQueries}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
