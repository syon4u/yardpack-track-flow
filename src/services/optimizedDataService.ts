
import { supabase } from '@/integrations/supabase/client';
import { 
  UnifiedCustomer, 
  UnifiedPackage, 
  UnifiedStats 
} from '@/types/unified';
import { Database } from '@/integrations/supabase/types';

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

type PackageStatus = Database['public']['Enums']['package_status'];

// Helper function to sanitize search terms for Supabase queries
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[%_]/g, '\\$&').replace(/[,]/g, '\\,');
}

// Helper function to create query with timeout
function createQueryWithTimeout<T>(queryPromise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
  return Promise.race([
    queryPromise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    )
  ]);
}

export class OptimizedDataService {
  // Optimized package fetching with pagination and timeout
  static async fetchPackagesPaginated(
    filters: PackageFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 50 }
  ): Promise<PaginatedResponse<UnifiedPackage>> {
    try {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Build the query with proper joins using the correct FK
      let query = supabase
        .from('packages')
        .select(`
          *,
          customers!fk_packages_customer_id(
            id,
            full_name,
            email,
            phone_number,
            address
          ),
          invoices(id)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }

      if (filters.searchTerm && filters.searchTerm.trim()) {
        const safeTerm = sanitizeSearchTerm(filters.searchTerm);
        query = query.or(`tracking_number.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%,external_tracking_number.ilike.%${safeTerm}%`);
      }

      if (filters.statusFilter && filters.statusFilter !== 'all') {
        query = query.eq('status', filters.statusFilter as PackageStatus);
      }

      // Execute the main query with timeout
      const { data, error } = await createQueryWithTimeout(query, 8000);
      if (error) throw error;

      // Get total count with a separate query
      let countQuery = supabase
        .from('packages')
        .select('*', { count: 'exact', head: true });

      if (filters.customerId) {
        countQuery = countQuery.eq('customer_id', filters.customerId);
      }

      if (filters.searchTerm && filters.searchTerm.trim()) {
        const safeTerm = sanitizeSearchTerm(filters.searchTerm);
        countQuery = countQuery.or(`tracking_number.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%,external_tracking_number.ilike.%${safeTerm}%`);
      }

      if (filters.statusFilter && filters.statusFilter !== 'all') {
        countQuery = countQuery.eq('status', filters.statusFilter as PackageStatus);
      }

      const { count: totalCount, error: countError } = await createQueryWithTimeout(countQuery, 5000);
      if (countError) throw countError;

      const total = totalCount || 0;
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
        customer_name: pkg.customers?.full_name || 'Unknown Customer',
        customer_email: pkg.customers?.email || null,
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
        invoices: pkg.invoices || [],
        invoice_uploaded: (pkg.invoices || []).length > 0,
        duty_assessed: pkg.duty_amount !== null,
        notes: pkg.notes,
        api_sync_status: pkg.api_sync_status,
        last_api_sync: pkg.last_api_sync,
        profiles: pkg.customers ? {
          full_name: pkg.customers.full_name,
          email: pkg.customers.email,
          address: pkg.customers.address,
          created_at: pkg.created_at,
          id: pkg.customer_id,
          phone_number: pkg.customers.phone_number,
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
      throw new Error(`Failed to fetch packages: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      // Fetch customers from the customers table which includes both registered and package_only customers
      let query = supabase
        .from('customers')
        .select(`
          *,
          packages(
            id,
            status,
            package_value,
            total_due,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const safeTerm = sanitizeSearchTerm(filters.searchTerm.toLowerCase());
        query = query.or(`full_name.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%,address.ilike.%${safeTerm}%`);
      }

      if (filters.customerTypeFilter && filters.customerTypeFilter !== 'all') {
        query = query.eq('customer_type', filters.customerTypeFilter as 'registered' | 'guest' | 'package_only');
      }

      // Get total count for pagination (before applying range)
      let countQuery = supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Apply same filters to count query
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const safeTerm = sanitizeSearchTerm(filters.searchTerm.toLowerCase());
        countQuery = countQuery.or(`full_name.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%,address.ilike.%${safeTerm}%`);
      }

      if (filters.customerTypeFilter && filters.customerTypeFilter !== 'all') {
        countQuery = countQuery.eq('customer_type', filters.customerTypeFilter as 'registered' | 'guest' | 'package_only');
      }

      const { count: totalCount, error: countError } = await countQuery;
      if (countError) throw countError;

      // Apply pagination
      const { data, error } = await query.range(offset, offset + limit - 1);
      if (error) throw error;

      // Transform to unified customer format with calculated stats
      const unifiedCustomers: UnifiedCustomer[] = (data || []).map((customer: any) => {
        const packages = customer.packages || [];
        const totalPackages = packages.length;
        const activePackages = packages.filter((p: any) => 
          ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(p.status)
        ).length;
        const completedPackages = packages.filter((p: any) => p.status === 'picked_up').length;
        const totalSpent = packages.reduce((sum: number, p: any) => sum + (p.package_value || 0), 0);
        const outstandingBalance = packages.reduce((sum: number, p: any) => sum + (p.total_due || 0), 0);
        const lastActivity = packages.length > 0 ? 
          new Date(Math.max(...packages.map((p: any) => new Date(p.created_at).getTime()))).toISOString() : 
          customer.created_at;

        return {
          id: customer.id,
          type: (customer.customer_type === 'guest' ? 'package_only' : customer.customer_type) as 'registered' | 'package_only',
          full_name: customer.full_name,
          email: customer.email,
          phone_number: customer.phone_number,
          address: customer.address,
          created_at: customer.created_at,
          total_packages: totalPackages,
          active_packages: activePackages,
          completed_packages: completedPackages,
          total_spent: totalSpent,
          outstanding_balance: outstandingBalance,
          last_activity: lastActivity,
          registration_status: (customer.customer_type === 'package_only' || customer.customer_type === 'guest' ? 'guest' : 'registered') as 'registered' | 'guest'
        };
      });

      // Apply client-side filters for activity
      let filteredCustomers = unifiedCustomers;

      if (filters.activityFilter && filters.activityFilter !== 'all') {
        const isActive = (c: UnifiedCustomer) => c.active_packages > 0;
        if (filters.activityFilter === 'active') {
          filteredCustomers = filteredCustomers.filter(isActive);
        } else if (filters.activityFilter === 'inactive') {
          filteredCustomers = filteredCustomers.filter(c => !isActive(c));
        }
      }

      const total = totalCount || 0;
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

  // Highly optimized stats fetching using database aggregation
  static async fetchOptimizedStats(): Promise<UnifiedStats> {
    try {
      // Use manual aggregation with proper promise handling
      const [packageStatsResult, customerStatsResult, financialStatsResult] = await Promise.all([
        supabase
          .from('packages')
          .select('status, package_value, total_due')
          .then(({ data, error }) => {
            if (error) throw error;
            
            const stats = {
              total: data?.length || 0,
              received: 0,
              in_transit: 0,
              arrived: 0,
              ready_for_pickup: 0,
              picked_up: 0,
            };

            data?.forEach(pkg => {
              if (pkg.status in stats) {
                stats[pkg.status as keyof typeof stats]++;
              }
            });

            return stats;
          }),
        
        supabase
          .from('customers')
          .select(`
            customer_type,
            packages!fk_packages_customer_id(status)
          `)
          .then(({ data, error }) => {
            if (error) throw error;
            
            const totalCustomers = data?.length || 0;
            const registeredCustomers = data?.filter(customer => customer.customer_type === 'registered').length || 0;
            const packageOnlyCustomers = data?.filter(customer => customer.customer_type === 'package_only').length || 0;
            const activeCustomers = data?.filter(customer => {
              const packages = customer.packages || [];
              return packages.some((p: any) => 
                ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(p.status)
              );
            }).length || 0;

            return {
              total: totalCustomers,
              registered: registeredCustomers,
              package_only: packageOnlyCustomers,
              active: activeCustomers,
            };
          }),

        supabase
          .from('packages')
          .select('package_value, total_due, invoices!inner(id)')
          .then(({ data, error }) => {
            if (error) throw error;
            
            const totalValue = data?.reduce((sum, p) => sum + (p.package_value || 0), 0) || 0;
            const totalDue = data?.reduce((sum, p) => sum + (p.total_due || 0), 0) || 0;
            
            // Count packages without invoices for pending invoices
            return supabase
              .from('packages')
              .select('id, invoices(id)')
              .then(({ data: packagesData, error: packagesError }) => {
                if (packagesError) throw packagesError;
                
                const pendingInvoices = packagesData?.filter(p => 
                  !p.invoices || p.invoices.length === 0
                ).length || 0;
                
                return {
                  total_value: totalValue,
                  total_due: totalDue,
                  pending_invoices: pendingInvoices,
                };
              });
          })
      ]);

      return {
        packages: packageStatsResult,
        customers: customerStatsResult,
        financial: financialStatsResult,
      };
    } catch (error) {
      console.error('Error fetching optimized stats:', error);
      throw new Error(`Failed to load dashboard statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
