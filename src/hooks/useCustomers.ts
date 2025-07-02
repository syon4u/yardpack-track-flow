
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { CustomerWithStats } from '@/types/customer';

type Customer = Database['public']['Tables']['customers']['Row'];

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<CustomerWithStats[]> => {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to fetch customers: ${error.message}`);
      }
      
      if (!customers) return [];

      // Get package stats for each customer
      const customersWithStats = await Promise.all(
        customers.map(async (customer: Customer) => {
          const { data: packages } = await supabase
            .from('packages')
            .select('id, status, package_value, total_due, created_at')
            .eq('customer_id', customer.id);

          const packagesList = packages || [];
          const totalSpent = packagesList.reduce((sum, pkg) => sum + (pkg.package_value || 0), 0);
          const outstandingBalance = packagesList.reduce((sum, pkg) => sum + (pkg.total_due || 0), 0);
          const activePackages = packagesList.filter(pkg => 
            ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)
          ).length;
          const completedPackages = packagesList.filter(pkg => pkg.status === 'picked_up').length;
          const lastActivity = packagesList.length > 0 
            ? packagesList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : null;

          return {
            ...customer,
            total_packages: packagesList.length,
            active_packages: activePackages,
            completed_packages: completedPackages,
            total_spent: totalSpent,
            outstanding_balance: outstandingBalance,
            last_activity: lastActivity,
          };
        })
      );

      return customersWithStats;
    },
  });
};

export const useCustomerById = (customerId: string) => {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async (): Promise<Customer | null> => {
      if (!customerId) return null;
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error) {
        throw new Error(`Failed to fetch customer: ${error.message}`);
      }
      
      return data;
    },
    enabled: !!customerId,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerData: {
      full_name: string;
      email?: string | null;
      phone_number?: string | null;
      address?: string | null;
      customer_type: 'registered' | 'guest' | 'package_only';
      user_id?: string | null;
      preferred_contact_method?: string | null;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
