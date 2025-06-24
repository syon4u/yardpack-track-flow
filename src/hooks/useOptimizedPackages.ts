
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { OptimizedDataService, PackageFilters, PaginationOptions } from '@/services/optimizedDataService';
import { UnifiedPackage } from '@/types/unified';

export const useOptimizedPackages = (
  filters: PackageFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 50 }
) => {
  const queryClient = useQueryClient();

  // Create a stable cache key
  const queryKey = ['packages-optimized', filters, pagination];

  const query = useQuery({
    queryKey,
    queryFn: () => OptimizedDataService.measureQueryPerformance(
      'fetchPackagesPaginated',
      () => OptimizedDataService.fetchPackagesPaginated(filters, pagination)
    ),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Prefetch next page for better UX
  const prefetchNextPage = useCallback(() => {
    if (query.data?.pagination.hasNext) {
      const nextPagination = { ...pagination, page: pagination.page + 1 };
      queryClient.prefetchQuery({
        queryKey: ['packages-optimized', filters, nextPagination],
        queryFn: () => OptimizedDataService.fetchPackagesPaginated(filters, nextPagination),
        staleTime: 30000,
      });
    }
  }, [query.data?.pagination.hasNext, pagination, filters, queryClient]);

  // Auto-prefetch when data is loaded
  useEffect(() => {
    if (query.data && !query.isFetching) {
      prefetchNextPage();
    }
  }, [query.data, query.isFetching, prefetchNextPage]);

  // Real-time updates subscription
  useEffect(() => {
    const channel = OptimizedDataService.subscribeToPackageUpdates(
      (payload) => {
        // Invalidate relevant queries on real-time updates
        queryClient.invalidateQueries({ 
          queryKey: ['packages-optimized'],
          exact: false 
        });
      },
      { customerId: filters.customerId }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient, filters.customerId]);

  // Optimistic update mutation
  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UnifiedPackage> }) => {
      // This would be implemented with actual Supabase update
      throw new Error('Update mutation not implemented yet');
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['packages-optimized'] });

      // Snapshot previous value
      const previousData = queryClient.getQueriesData({ queryKey: ['packages-optimized'] });

      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: ['packages-optimized'] },
        (old: any) => {
          if (!old?.data) return old;
          
          return {
            ...old,
            data: old.data.map((pkg: UnifiedPackage) =>
              pkg.id === id ? { ...pkg, ...updates } : pkg
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['packages-optimized'] });
    },
  });

  return {
    ...query,
    packages: query.data?.data || [],
    pagination: query.data?.pagination,
    prefetchNextPage,
    updatePackage: updatePackageMutation.mutate,
    isUpdating: updatePackageMutation.isPending,
  };
};

// Hook for infinite loading
export const useInfinitePackages = (filters: PackageFilters = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['packages-infinite', filters],
    queryFn: async () => {
      const allPages = [];
      let page = 1;
      let hasNext = true;

      while (hasNext && page <= 10) { // Limit to 10 pages to prevent infinite loading
        const result = await OptimizedDataService.fetchPackagesPaginated(
          filters,
          { page, limit: 50 }
        );
        
        allPages.push(...result.data);
        hasNext = result.pagination.hasNext;
        page++;
      }

      return allPages;
    },
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  // Real-time updates
  useEffect(() => {
    const channel = OptimizedDataService.subscribeToPackageUpdates(() => {
      queryClient.invalidateQueries({ queryKey: ['packages-infinite'] });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return {
    ...query,
    packages: query.data || [],
  };
};
