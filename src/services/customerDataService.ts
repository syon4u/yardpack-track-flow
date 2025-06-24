
import { supabase } from '@/integrations/supabase/client';

type Customer = {
  id: string;
  customer_number: string;
  customer_type: 'registered' | 'guest' | 'package_only';
  full_name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  user_id: string | null;
  preferred_contact_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type Package = {
  id: string;
  tracking_number: string;
  status: string;
  customer_id: string;
  package_value: number | null;
  created_at: string;
};

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
        .from('customers' as any)
        .select('id, customer_type');

      if (customersError) throw customersError;

      // Get customers with active packages
      const { data: activeCustomers, error: activeError } = await supabase
        .from('customers' as any)
        .select(`
          id,
          packages!packages_customer_id_fkey(status)
        `);

      if (activeError) {
        console.warn('Failed to fetch customers with packages, falling back to simple count:', activeError);
        // Fallback: just count customers without package data
        const active = 0; // We'll calculate this differently if needed
        
        const total = customers?.length || 0;
        const registered = customers?.filter(c => c.customer_type === 'registered').length || 0;
        const guest = customers?.filter(c => c.customer_type === 'guest').length || 0;
        const packageOnly = customers?.filter(c => c.customer_type === 'package_only').length || 0;

        return {
          total,
          registered,
          guest,
          package_only: packageOnly,
          active,
        };
      }

      const total = customers?.length || 0;
      const registered = customers?.filter(c => c.customer_type === 'registered').length || 0;
      const guest = customers?.filter(c => c.customer_type === 'guest').length || 0;
      const packageOnly = customers?.filter(c => c.customer_type === 'package_only').length || 0;
      
      const active = activeCustomers?.filter(customer => {
        const packages = (customer as any).packages || [];
        return packages.some((pkg: any) => 
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
      const { data: customer, error: customerError } = await supabase
        .from('customers' as any)
        .select('*')
        .eq('id', customerId)
        .single();

      if (customerError) throw customerError;

      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .eq('customer_id', customerId);

      if (packagesError) throw packagesError;

      return {
        ...customer,
        packages: packages || []
      };
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
        .from('customers' as any)
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
