
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

type PackageRow = Database['public']['Tables']['packages']['Row'];
type CustomerRow = Database['public']['Tables']['customers']['Row'];

interface OptimizedPackageData extends PackageRow {
  customers: CustomerRow | null;
  customer_name: string;
  customer_email: string | null;
  invoice_uploaded: boolean;
  duty_assessed: boolean;
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
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['optimized-packages', user?.id, profile?.role, customerId, searchTerm, statusFilter, page, limit],
    queryFn: async (): Promise<OptimizedPackagesResult> => {
      if (!user) return { data: [], total: 0, hasMore: false };
      
      // Build the base query with proper joins
      let query = supabase
        .from('packages')
        .select(`
          *,
          customers(*),
          invoices!invoices_package_id_fkey(*)
        `, { count: 'exact' });

      // For customers, automatically filter by their packages
      if (profile?.role === 'customer') {
        // First get the customer record for this user
        const { data: customerRecord, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (customerRecord) {
          query = query.eq('customer_id', customerRecord.id);
        } else {
          // No customer record found, return empty result
          return { data: [], total: 0, hasMore: false };
        }
      } else if (customerId) {
        // For admin filtering by specific customer
        query = query.eq('customer_id', customerId);
      }

      // Apply search filter
      if (searchTerm && searchTerm.trim()) {
        query = query.or(`tracking_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,external_tracking_number.ilike.%${searchTerm}%`);
      }

      // Apply status filter with proper type checking
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
        throw new Error(`Failed to fetch packages: ${error.message}`);
      }

      const total = count || 0;
      const hasMore = offset + limit < total;

      // Transform data to include computed properties
      const transformedData = (data || []).map((pkg: any): OptimizedPackageData => ({
        ...pkg,
        customer_name: pkg.customers?.full_name || 'Unknown Customer',
        customer_email: pkg.customers?.email || null,
        invoice_uploaded: (pkg.invoices || []).length > 0,
        duty_assessed: pkg.duty_amount !== null,
      }));

      return {
        data: transformedData,
        total,
        hasMore,
      };
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
