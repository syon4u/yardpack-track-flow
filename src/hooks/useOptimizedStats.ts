
import { useQuery } from '@tanstack/react-query';
import { OptimizedDataService } from '@/services/optimizedDataService';
import { UnifiedStats } from '@/types/unified';

export interface UseOptimizedStatsOptions {
  refetchInterval?: number;
  timeout?: number;
  maxRetries?: number;
}

export const useOptimizedStats = (options: UseOptimizedStatsOptions = {}) => {
  const {
    refetchInterval = 30000, // 30 seconds
    timeout = 10000, // 10 seconds
    maxRetries = 2
  } = options;

  return useQuery<UnifiedStats, Error>({
    queryKey: ['optimized-stats'],
    queryFn: async () => {
      console.log('Fetching optimized stats...');
      const startTime = performance.now();
      
      try {
        const stats = await OptimizedDataService.fetchOptimizedStats();
        const endTime = performance.now();
        console.log(`Stats loaded in ${endTime - startTime}ms`, stats);
        return stats;
      } catch (error) {
        console.error('Failed to fetch optimized stats:', error);
        throw error;
      }
    },
    refetchInterval,
    retry: maxRetries,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 20000, // Consider data stale after 20 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    meta: {
      timeout,
    }
  });
};
