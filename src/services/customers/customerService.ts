import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { DatabaseService, QueryOptions, PaginatedResult, CustomerType } from '../core/database';

export interface CustomerData {
  id: string;
  customer_number: string;
  customer_type: CustomerType;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  user_id: string | null;
  preferred_contact_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  total_packages: number;
  active_packages: number;
  completed_packages: number;
  total_spent: number;
  outstanding_balance: number;
  last_activity: string;
  packages?: any[];
}

export interface CustomerStats {
  total: number;
  registered: number;
  guest: number;
  package_only: number;
  active: number;
}

export interface CreateCustomerData {
  full_name: string;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  customer_type?: CustomerType;
  user_id?: string | null;
  notes?: string | null;
  preferred_contact_method?: string | null;
}

/**
 * Customer service handling all customer-related database operations
 */
export class CustomerService {
  /**
   * Fetch customers with pagination and filtering
   */
  static async fetchCustomers(options: QueryOptions = {}): Promise<PaginatedResult<CustomerData>> {
    return DatabaseService.measurePerformance('fetchCustomers', async () => {
      let baseQuery = supabase
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
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply search filter
      baseQuery = DatabaseService.applySearchFilter(
        baseQuery,
        options.searchTerm,
        ['full_name', 'email', 'address', 'customer_number']
      );

      const result = await DatabaseService.executePaginatedQuery<any>(baseQuery, options);

      // Transform data with calculated statistics
      const transformedData = result.data.map(this.transformCustomerData);

      return {
        ...result,
        data: transformedData,
      };
    });
  }

  /**
   * Get customer by ID with packages
   */
  static async getById(customerId: string): Promise<CustomerData | null> {
    return DatabaseService.measurePerformance('getCustomerById', async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          packages(*)
        `)
        .eq('id', customerId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.transformCustomerData(data);
    });
  }

  /**
   * Get customer by user ID
   */
  static async getByUserId(userId: string): Promise<CustomerData | null> {
    return DatabaseService.measurePerformance('getCustomerByUserId', async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          packages(*)
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.transformCustomerData(data);
    });
  }

  /**
   * Create new customer
   */
  static async create(customerData: CreateCustomerData): Promise<Database['public']['Tables']['customers']['Row']> {
    return DatabaseService.measurePerformance('createCustomer', async () => {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customerData,
          customer_type: customerData.customer_type || 'guest',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  /**
   * Update customer
   */
  static async update(customerId: string, updates: Partial<CreateCustomerData>): Promise<void> {
    return DatabaseService.measurePerformance('updateCustomer', async () => {
      const { error } = await supabase
        .from('customers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId);

      if (error) throw error;
    });
  }

  /**
   * Delete customer
   */
  static async delete(customerId: string): Promise<void> {
    return DatabaseService.measurePerformance('deleteCustomer', async () => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
    });
  }

  /**
   * Create customer from user profile
   */
  static async createFromProfile(userId: string): Promise<Database['public']['Tables']['customers']['Row']> {
    return DatabaseService.measurePerformance('createCustomerFromProfile', async () => {
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      return this.create({
        full_name: profile.full_name,
        email: profile.email,
        phone_number: profile.phone_number,
        address: profile.address,
        customer_type: 'registered',
        user_id: userId,
      });
    });
  }

  /**
   * Get customer statistics
   */
  static async getStats(): Promise<CustomerStats> {
    return DatabaseService.measurePerformance('getCustomerStats', async () => {
      const { data: customers, error } = await supabase
        .from('customers')
        .select(`
          id,
          customer_type,
          packages(status)
        `);

      if (error) throw error;

      if (!customers) {
        return {
          total: 0,
          registered: 0,
          guest: 0,
          package_only: 0,
          active: 0,
        };
      }

      const total = customers.length;
      const registered = customers.filter(c => c.customer_type === 'registered').length;
      const guest = customers.filter(c => c.customer_type === 'guest').length;
      const packageOnly = customers.filter(c => c.customer_type === 'package_only').length;
      
      const active = customers.filter(customer => {
        const packages = (customer as any).packages || [];
        return packages.some((pkg: any) => 
          ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)
        );
      }).length;

      return {
        total,
        registered,
        guest,
        package_only: packageOnly,
        active,
      };
    });
  }

  /**
   * Transform customer data to include calculated statistics
   */
  private static transformCustomerData(customer: any): CustomerData {
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
      ...customer,
      total_packages: totalPackages,
      active_packages: activePackages,
      completed_packages: completedPackages,
      total_spent: totalSpent,
      outstanding_balance: outstandingBalance,
      last_activity: lastActivity,
    };
  }

  /**
   * Subscribe to customer updates
   */
  static subscribeToUpdates(callback: (payload: any) => void) {
    return DatabaseService.subscribeToChanges('customers', callback);
  }
}