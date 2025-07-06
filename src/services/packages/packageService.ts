import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { DatabaseService, QueryOptions, PaginatedResult, PackageStatus } from '../core/database';

export interface PackageData {
  id: string;
  tracking_number: string;
  external_tracking_number: string | null;
  description: string;
  status: PackageStatus;
  created_at: string;
  updated_at: string;
  date_received: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  customer_id: string;
  delivery_address: string;
  sender_name: string | null;
  sender_address: string | null;
  carrier: string | null;
  weight: number | null;
  dimensions: string | null;
  package_value: number | null;
  duty_amount: number | null;
  duty_rate: number | null;
  total_due: number | null;
  notes: string | null;
  api_sync_status: string | null;
  last_api_sync: string | null;
  magaya_shipment_id: string | null;
  magaya_reference_number: string | null;
  warehouse_location: string | null;
  consolidation_status: string | null;
  delivery_estimate: string | null;
  last_notification_sent_at: string | null;
  last_notification_status: PackageStatus | null;
  // Computed fields
  customer_name: string;
  customer_email: string | null;
  invoices: any[];
  invoice_uploaded: boolean;
  duty_assessed: boolean;
}

export interface CreatePackageData {
  tracking_number: string;
  customer_id: string;
  description: string;
  delivery_address: string;
  sender_name?: string;
  sender_address?: string;
  weight?: number;
  dimensions?: string;
  package_value?: number;
  notes?: string;
  carrier?: string;
  external_tracking_number?: string;
}

/**
 * Package service handling all package-related database operations
 */
export class PackageService {
  /**
   * Fetch packages with pagination and filtering
   */
  static async fetchPackages(
    userId: string,
    userRole: string | undefined,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<PackageData>> {
    return DatabaseService.measurePerformance('fetchPackages', async () => {
      let baseQuery = supabase
        .from('packages')
        .select(`
          *,
          customers(*),
          invoices!invoices_package_id_fkey(*)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (userRole === 'customer') {
        const customerRecord = await this.getCustomerIdForUser(userId);
        if (!customerRecord) {
          return {
            data: [],
            pagination: {
              page: 1,
              limit: options.limit || 50,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          };
        }
        baseQuery = baseQuery.eq('customer_id', customerRecord.id);
      }

      // Apply filters
      baseQuery = DatabaseService.applySearchFilter(
        baseQuery,
        options.searchTerm,
        ['tracking_number', 'description', 'external_tracking_number']
      );

      baseQuery = DatabaseService.applyStatusFilter(
        baseQuery,
        options.statusFilter,
        ['received', 'in_transit', 'arrived', 'ready_for_pickup', 'picked_up']
      );

      if (options.customerId && userRole !== 'customer') {
        baseQuery = baseQuery.eq('customer_id', options.customerId);
      }

      const result = await DatabaseService.executePaginatedQuery<any>(baseQuery, options);

      // Transform data
      const transformedData = result.data.map(this.transformPackageData);

      return {
        ...result,
        data: transformedData,
      };
    });
  }

  /**
   * Update package status
   */
  static async updateStatus(packageId: string, status: PackageStatus): Promise<void> {
    return DatabaseService.measurePerformance('updatePackageStatus', async () => {
      const { error } = await supabase
        .from('packages')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', packageId);

      if (error) throw error;
    });
  }

  /**
   * Create new package
   */
  static async create(packageData: CreatePackageData): Promise<Database['public']['Tables']['packages']['Row']> {
    return DatabaseService.measurePerformance('createPackage', async () => {
      const { data, error } = await supabase
        .from('packages')
        .insert([packageData])
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  /**
   * Get package by ID with full details
   */
  static async getById(packageId: string): Promise<PackageData | null> {
    return DatabaseService.measurePerformance('getPackageById', async () => {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          customers(*),
          invoices!invoices_package_id_fkey(*),
          tracking_events(*)
        `)
        .eq('id', packageId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.transformPackageData(data);
    });
  }

  /**
   * Get customer ID for a user (helper method)
   */
  private static async getCustomerIdForUser(userId: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Transform package data to include computed properties
   */
  private static transformPackageData(pkg: any): PackageData {
    const customer = pkg.customers;
    
    return {
      ...pkg,
      customer_name: customer?.full_name || 'Unknown Customer',
      customer_email: customer?.email || null,
      invoices: pkg.invoices || [],
      invoice_uploaded: pkg.invoices && pkg.invoices.length > 0,
      duty_assessed: pkg.duty_amount !== null,
    };
  }

  /**
   * Subscribe to package updates
   */
  static subscribeToUpdates(
    callback: (payload: any) => void,
    customerId?: string
  ) {
    const filters = customerId ? { customer_id: customerId } : undefined;
    return DatabaseService.subscribeToChanges('packages', callback, filters);
  }
}