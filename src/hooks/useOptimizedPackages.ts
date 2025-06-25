
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type PackageRow = Database['public']['Tables']['packages']['Row'];
type CustomerRow = Database['public']['Tables']['customers']['Row'];

interface OptimizedPackageData extends PackageRow {
  customers: CustomerRow | null;
  invoices: Array<{
    id: string;
    package_id: string;
    file_name: string;
    file_path: string;
    file_type: string;  
    file_size: number | null;
    uploaded_by: string;
    uploaded_at: string;
  }>;
}

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
  data: OptimizedPackageData[];
  total: number;
  hasMore: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const useOptimizedPackages = (
  filters: UseOptimizedPackagesFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 50 }
) => {
  const queryClient = useQueryClient();
  const { customerId, searchTerm, statusFilter } = filters;
  const { page, limit } = pagination;

  const query = useQuery({
    queryKey: ['optimized-packages', customerId, searchTerm, statusFilter, page, limit],
    queryFn: async (): Promise<OptimizedPackagesResult> => {
      console.log('Fetching optimized packages with filters:', filters);

      // Build the base query with proper joins using the new FK constraints
      let query = supabase
        .from('packages')
        .select(`
          *,
          customers!fk_packages_customer_id(*),
          invoices!fk_invoices_package_id(*)
        `, { count: 'exact' });

      // Apply customer filter using the new FK relationship
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      // Apply search filter
      if (searchTerm && searchTerm.trim()) {
        query = query.or(`tracking_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,external_tracking_number.ilike.%${searchTerm}%`);
      }

      // Apply status filter with proper type casting
      if (statusFilter && statusFilter !== 'all') {
        const validStatuses: Database['public']['Enums']['package_status'][] = [
          'received', 'in_transit', 'arrived', 'ready_for_pickup', 'picked_up'
        ];
        
        if (validStatuses.includes(statusFilter as Database['public']['Enums']['package_status'])) {
          query = query.eq('status', statusFilter as Database['public']['Enums']['package_status']);
        }
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching optimized packages:', error);
        throw error;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      const hasMore = offset + limit < total;

      console.log(`Fetched ${data?.length || 0} packages out of ${total} total`);

      return {
        data: data || [],
        total,
        hasMore,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Prefetch next page
  const prefetchNextPage = useCallback(() => {
    if (query.data?.pagination.hasNext) {
      const nextPagination = { ...pagination, page: pagination.page + 1 };
      queryClient.prefetchQuery({
        queryKey: ['optimized-packages', filters, nextPagination],
        queryFn: () => {
          // Use the same logic but for next page
          return query.queryFn();
        },
        staleTime: 30 * 1000,
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
    packages: query.data?.data || [],
    pagination: query.data?.pagination,
    prefetchNextPage,
  };
};
