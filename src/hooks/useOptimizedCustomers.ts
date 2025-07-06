
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { CustomerService, AnalyticsService, QueryOptions, CustomerData } from '@/services';

export const useOptimizedCustomers = (
  filters: QueryOptions = {},
  pagination: { page: number; limit: number } = { page: 1, limit: 50 }
) => {
  const queryClient = useQueryClient();

  const queryKey = ['customers-optimized', filters, pagination];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const options: QueryOptions = {
        ...filters,
        ...pagination,
      };
      return await CustomerService.fetchCustomers(options);
    },
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
        queryFn: async () => {
          const options: QueryOptions = {
            ...filters,
            ...nextPagination,
          };
          return await CustomerService.fetchCustomers(options);
        },
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

// Hook for unified statistics with caching
export const useOptimizedStats = () => {
  return useQuery({
    queryKey: ['stats-optimized'],
    queryFn: () => AnalyticsService.getUnifiedStats(),
    staleTime: 120000, // 2 minutes - stats don't change very frequently
    gcTime: 600000, // 10 minutes
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};
