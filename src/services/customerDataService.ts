
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Customer = Database['public']['Tables']['customers']['Row'];
type Package = Database['public']['Tables']['packages']['Row'];

export interface CustomerStats {
  total: number;
  registered: number;
  guest: number;
  package_only: number;
  active: number;
}

export class CustomerDataService {
  static async fetchCustomerStats(): Promise<CustomerStats> {
    try {
      // Get customer counts by type
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, customer_type');

      if (customersError) throw customersError;

      // Get customers with active packages
      const { data: activeCustomers, error: activeError } = await supabase
        .from('customers')
        .select(`
          id,
          packages!packages_customer_id_fkey(status)
        `);

      if (activeError) throw activeError;

      const total = customers?.length || 0;
      const registered = customers?.filter(c => c.customer_type === 'registered').length || 0;
      const guest = customers?.filter(c => c.customer_type === 'guest').length || 0;
      const packageOnly = customers?.filter(c => c.customer_type === 'package_only').length || 0;
      
      const active = activeCustomers?.filter(customer => {
        const packages = customer.packages || [];
        return packages.some(pkg => 
          ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)
        );
      }).length || 0;

      return {
        total,
        registered,
        guest,
        package_only: packageOnly,
        active,
      };
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  }

  static async fetchCustomerWithPackages(customerId: string): Promise<Customer & { packages: Package[] } | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          packages!packages_customer_id_fkey(*)
        `)
        .eq('id', customerId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching customer with packages:', error);
      throw error;
    }
  }

  static async createCustomerFromUserProfile(userId: string): Promise<Customer> {
    try {
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Create customer record
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([{
          full_name: profile.full_name,
          email: profile.email,
          phone_number: profile.phone_number,
          address: profile.address,
          customer_type: 'registered' as const,
          user_id: userId,
        }])
        .select()
        .single();

      if (customerError) throw customerError;
      return customer;
    } catch (error) {
      console.error('Error creating customer from profile:', error);
      throw error;
    }
  }
}
