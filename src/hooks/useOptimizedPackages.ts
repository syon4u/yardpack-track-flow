
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { defaultQueryRetryOptions } from '@/utils/retryUtils';
import { PackageService, QueryOptions, PackageData } from '@/services';

// Use the PackageData type from the service

interface UseOptimizedPackagesFilters {
  customerId?: string;
  searchTerm?: string;
  statusFilter?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface OptimizedPackagesResult {
  data: PackageData[];
  total: number;
  hasMore: boolean;
}

export const useOptimizedPackages = (
  filters: UseOptimizedPackagesFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 50 }
) => {
  const { customerId, searchTerm, statusFilter } = filters;
  const { page, limit } = pagination;
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['optimized-packages', user?.id, profile?.role, customerId, searchTerm, statusFilter, page, limit],
    queryFn: async (): Promise<OptimizedPackagesResult> => {
      if (!user) return { data: [], total: 0, hasMore: false };
      
      const options: QueryOptions = {
        page,
        limit,
        searchTerm,
        statusFilter,
        customerId,
      };

      const result = await PackageService.fetchPackages(user.id, profile?.role, options);
      
      return {
        data: result.data,
        total: result.pagination.total,
        hasMore: result.pagination.hasNext,
      };
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...defaultQueryRetryOptions,
  });
};
