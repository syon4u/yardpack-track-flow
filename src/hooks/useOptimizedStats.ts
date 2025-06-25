
import { useQuery } from '@tanstack/react-query';
import { OptimizedDataService } from '@/services/optimizedDataService';
import { UnifiedStats } from '@/types/unified';

export interface UseOptimizedStatsOptions {
  refetchInterval?: number;
  timeout?: number;
  maxRetries?: number;
  enabled?: boolean;
}

export interface StatsError extends Error {
  code?: string;
  isTimeout?: boolean;
  isNetworkError?: boolean;
}

export const useOptimizedStats = (options: UseOptimizedStatsOptions = {}) => {
  const {
    refetchInterval = 30000, // 30 seconds
    timeout = 8000, // 8 seconds - reduced for faster feedback
    maxRetries = 2,
    enabled = true
  } = options;

  return useQuery<UnifiedStats, StatsError>({
    queryKey: ['optimized-stats'],
    queryFn: async () => {
      console.log('Fetching optimized stats with enhanced error handling...');
      const startTime = performance.now();
      
      try {
        const stats = await OptimizedDataService.fetchOptimizedStats();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`Stats loaded successfully in ${duration.toFixed(0)}ms`, stats);
        
        // Log performance warning if query is slow
        if (duration > 5000) {
          console.warn(`Stats query took ${duration.toFixed(0)}ms - consider optimization`);
        }
        
        return stats;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.error(`Stats query failed after ${duration.toFixed(0)}ms:`, error);
        
        // Enhance error with additional context
        const enhancedError = error as StatsError;
        
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            enhancedError.isTimeout = true;
            enhancedError.message = 'Dashboard data request timed out. Please try again.';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            enhancedError.isNetworkError = true;
            enhancedError.message = 'Network error while loading dashboard data. Please check your connection.';
          } else if (error.message.includes('Failed to load')) {
            enhancedError.message = 'Unable to load dashboard statistics. Please refresh the page.';
          }
        }
        
        throw enhancedError;
      }
    },
    enabled,
    refetchInterval: enabled ? refetchInterval : false,
    retry: (failureCount, error) => {
      // Don't retry timeout errors as aggressively
      if ((error as StatsError)?.isTimeout && failureCount >= 1) {
        return false;
      }
      return failureCount < maxRetries;
    },
    retryDelay: (attemptIndex) => {
      // Progressive backoff: 1s, 2s, 4s
      return Math.min(1000 * 2 ** attemptIndex, 8000);
    },
    staleTime: 15000, // Consider data stale after 15 seconds for faster updates
    gcTime: 300000, // Keep in cache for 5 minutes
    meta: {
      timeout,
    },
    // Add error boundary behavior
    throwOnError: false, // Let the component handle errors gracefully
  });
};
