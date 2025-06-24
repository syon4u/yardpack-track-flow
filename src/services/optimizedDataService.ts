
import { supabase } from '@/integrations/supabase/client';
import { 
  UnifiedCustomer, 
  UnifiedPackage, 
  UnifiedStats 
} from '@/types/unified';
import { 
  transformPackageToUnified,
  transformProfileToUnifiedCustomer,
  createPackageOnlyCustomer 
} from '@/utils/dataTransforms';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PackageFilters {
  searchTerm?: string;
  statusFilter?: string;
  customerId?: string;
}

export interface CustomerFilters {
  searchTerm?: string;
  customerTypeFilter?: string;
  activityFilter?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class OptimizedDataService {
  // Optimized package fetching with pagination
  static async fetchPackagesPaginated(
    filters: PackageFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 50 }
  ): Promise<PaginatedResponse<UnifiedPackage>> {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Use the optimized database function for searching
      const { data, error } = await supabase.rpc('search_packages', {
        search_term: filters.searchTerm || null,
        status_filter: filters.statusFilter || null,
        customer_id_filter: filters.customerId || null,
        limit_count: limit,
        offset_count: offset
      });

      if (error) throw error;

      // Get total count for pagination
      let countQuery = supabase
        .from('packages')
        .select('*', { count: 'exact', head: true });

      if (filters.customerId) {
        countQuery = countQuery.eq('customer_id', filters.customerId);
      }

      if (filters.searchTerm && filters.searchTerm.trim()) {
        countQuery = countQuery.or(`tracking_number.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,external_tracking_number.ilike.%${filters.searchTerm}%`);
      }

      if (filters.statusFilter && filters.statusFilter !== 'all') {
        countQuery = countQuery.eq('status', filters.statusFilter);
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      // Transform data to unified format
      const unifiedPackages = (data || []).map((pkg: any) => ({
        id: pkg.id,
        tracking_number: pkg.tracking_number,
        external_tracking_number: pkg.external_tracking_number,
        description: pkg.description,
        status: pkg.status,
        created_at: pkg.created_at,
        updated_at: pkg.updated_at,
        date_received: pkg.date_received,
        estimated_delivery: pkg.estimated_delivery,
        delivery_estimate: pkg.delivery_estimate,
        actual_delivery: pkg.actual_delivery,
        customer_id: pkg.customer_id,
        customer_name: pkg.customer_name || 'Unknown Customer',
        customer_email: pkg.customer_email || null,
        sender_name: pkg.sender_name,
        sender_address: pkg.sender_address,
        delivery_address: pkg.delivery_address,
        carrier: pkg.carrier,
        weight: pkg.weight,
        dimensions: pkg.dimensions,
        package_value: pkg.package_value,
        duty_amount: pkg.duty_amount,
        duty_rate: pkg.duty_rate,
        total_due: pkg.total_due,
        invoices: [],
        invoice_uploaded: pkg.has_invoices || false,
        duty_assessed: pkg.duty_amount !== null,
        notes: pkg.notes,
        api_sync_status: pkg.api_sync_status,
        last_api_sync: pkg.last_api_sync,
        profiles: pkg.customer_name ? {
          full_name: pkg.customer_name,
          email: pkg.customer_email,
          address: pkg.customer_address,
          created_at: pkg.created_at,
          id: pkg.customer_id,
          phone_number: pkg.customer_phone,
          role: 'customer' as const,
          updated_at: pkg.updated_at
        } : null,
      }));

      return {
        data: unifiedPackages,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching paginated packages:', error);
      throw error;
    }
  }

  // Optimized customer fetching with pagination
  static async fetchCustomersPaginated(
    filters: CustomerFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 50 }
  ): Promise<PaginatedResponse<UnifiedCustomer>> {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Use the optimized customer_stats view
      let query = supabase
        .from('customer_stats')
        .select('*')
        .order('last_activity', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchLower = filters.searchTerm.toLowerCase();
        query = query.or(`full_name.ilike.%${searchLower}%,email.ilike.%${searchLower}%,address.ilike.%${searchLower}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      // Transform to unified customer format
      const unifiedCustomers = (data || []).map((customer: any) => ({
        id: customer.id,
        type: 'registered' as const,
        full_name: customer.full_name,
        email: customer.email,
        phone_number: customer.phone_number,
        address: customer.address,
        created_at: customer.created_at,
        total_packages: customer.total_packages,
        active_packages: customer.active_packages,
        completed_packages: customer.completed_packages,
        total_spent: customer.total_spent,
        outstanding_balance: customer.outstanding_balance,
        last_activity: customer.last_activity,
        registration_status: 'registered' as const
      }));

      // Apply client-side filters for features not supported by database view
      let filteredCustomers = unifiedCustomers;

      if (filters.customerTypeFilter && filters.customerTypeFilter !== 'all') {
        filteredCustomers = filteredCustomers.filter(c => c.type === filters.customerTypeFilter);
      }

      if (filters.activityFilter && filters.activityFilter !== 'all') {
        const isActive = (c: UnifiedCustomer) => c.active_packages > 0;
        if (filters.activityFilter === 'active') {
          filteredCustomers = filteredCustomers.filter(isActive);
        } else if (filters.activityFilter === 'inactive') {
          filteredCustomers = filteredCustomers.filter(c => !isActive(c));
        }
      }

      const total = count || filteredCustomers.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: filteredCustomers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching paginated customers:', error);
      throw error;
    }
  }

  // Optimized stats fetching
  static async fetchOptimizedStats(): Promise<UnifiedStats> {
    try {
      // Use efficient aggregate queries
      const [packageStats, customerStats] = await Promise.all([
        supabase
          .from('packages')
          .select('status, package_value, total_due, invoices(id)')
          .then(({ data }) => {
            const stats = {
              total: data?.length || 0,
              received: 0,
              in_transit: 0,
              arrived: 0,
              ready_for_pickup: 0,
              picked_up: 0,
            };

            data?.forEach(pkg => {
              stats[pkg.status as keyof typeof stats]++;
            });

            return stats;
          }),
        
        supabase
          .from('customer_stats')
          .select('*')
          .then(({ data }) => ({
            total: data?.length || 0,
            registered: data?.length || 0,
            package_only: 0, // For now, focusing on registered customers
            active: data?.filter(c => c.active_packages > 0).length || 0,
          }))
      ]);

      // Calculate financial stats efficiently
      const { data: financialData } = await supabase
        .from('packages')
        .select('package_value, total_due, invoices(id)');

      const financialStats = {
        total_value: financialData?.reduce((sum, p) => sum + (p.package_value || 0), 0) || 0,
        total_due: financialData?.reduce((sum, p) => sum + (p.total_due || 0), 0) || 0,
        pending_invoices: financialData?.filter(p => !p.invoices || p.invoices.length === 0).length || 0,
      };

      return {
        packages: packageStats,
        customers: customerStats,
        financial: financialStats,
      };
    } catch (error) {
      console.error('Error fetching optimized stats:', error);
      throw error;
    }
  }

  // Real-time subscription helper
  static subscribeToPackageUpdates(
    callback: (payload: any) => void,
    filters?: { customerId?: string }
  ) {
    const channel = supabase
      .channel('package-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'packages',
          filter: filters?.customerId ? `customer_id=eq.${filters.customerId}` : undefined
        },
        callback
      )
      .subscribe();

    return channel;
  }

  // Performance monitoring helper
  static async measureQueryPerformance<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await queryFn();
      const endTime = performance.now();
      console.log(`Query ${queryName} took ${endTime - startTime} milliseconds`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      console.error(`Query ${queryName} failed after ${endTime - startTime} milliseconds:`, error);
      throw error;
    }
  }
}
