
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { OptimizedDataService, CustomerFilters, PaginationOptions } from '@/services/optimizedDataService';

export const useOptimizedCustomers = (
  filters: CustomerFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 50 }
) => {
  const queryClient = useQueryClient();

  const queryKey = ['customers-optimized', filters, pagination];

  const query = useQuery({
    queryKey,
    queryFn: () => OptimizedDataService.measureQueryPerformance(
      'fetchCustomersPaginated',
      () => OptimizedDataService.fetchCustomersPaginated(filters, pagination)
    ),
    staleTime: 60000, // 1 minute - customers change less frequently
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Prefetch next page
  const prefetchNextPage = useCallback(() => {
    if (query.data?.pagination.hasNext) {
      const nextPagination = { ...pagination, page: pagination.page + 1 };
      queryClient.prefetchQuery({
        queryKey: ['customers-optimized', filters, nextPagination],
        queryFn: () => OptimizedDataService.fetchCustomersPaginated(filters, nextPagination),
        staleTime: 60000,
      });
    }
  }, [query.data?.pagination.hasNext, pagination, filters, queryClient]);

  useEffect(() => {
    if (query.data && !query.isFetching) {
      prefetchNextPage();
    }
  }, [query.data, query.isFetching, prefetchNextPage]);

  return {
    ...query,
    customers: query.data?.data || [],
    pagination: query.data?.pagination,
    prefetchNextPage,
  };
};

// Hook for customer statistics with caching
export const useOptimizedStats = () => {
  return useQuery({
    queryKey: ['stats-optimized'],
    queryFn: () => OptimizedDataService.measureQueryPerformance(
      'fetchOptimizedStats',
      () => OptimizedDataService.fetchOptimizedStats()
    ),
    staleTime: 120000, // 2 minutes - stats don't change very frequently
    gcTime: 600000, // 10 minutes
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};
