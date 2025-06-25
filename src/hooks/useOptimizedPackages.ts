
import { useQuery } from '@tanstack/react-query';
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
}

export const useOptimizedPackages = (
  filters: UseOptimizedPackagesFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 50 }
) => {
  const { customerId, searchTerm, statusFilter } = filters;
  const { page, limit } = pagination;

  return useQuery({
    queryKey: ['optimized-packages', customerId, searchTerm, statusFilter, page, limit],
    queryFn: async (): Promise<OptimizedPackagesResult> => {
      console.log('Fetching optimized packages with filters:', filters);

      // Build the base query with proper joins
      let query = supabase
        .from('packages')
        .select(`
          *,
          customers(*),
          invoices(*)
        `, { count: 'exact' });

      // Apply customer filter using the customers table relationship
      if (customerId) {
        query = query.eq('customers.user_id', customerId);
      }

      // Apply search filter
      if (searchTerm && searchTerm.trim()) {
        query = query.or(`tracking_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,external_tracking_number.ilike.%${searchTerm}%`);
      }

      // Apply status filter
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
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
      const hasMore = offset + limit < total;

      console.log(`Fetched ${data?.length || 0} packages out of ${total} total`);

      return {
        data: data || [],
        total,
        hasMore,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
