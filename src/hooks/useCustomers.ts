
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the customer type locally since it's not in the generated types yet
interface Customer {
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
}

interface CustomerInsert {
  customer_type: 'registered' | 'guest' | 'package_only';
  full_name: string;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  user_id?: string | null;
  preferred_contact_method?: string | null;
  notes?: string | null;
}

interface CustomerUpdate {
  customer_type?: 'registered' | 'guest' | 'package_only';
  full_name?: string;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  user_id?: string | null;
  preferred_contact_method?: string | null;
  notes?: string | null;
}

interface CustomerWithStats extends Customer {
  total_packages: number;
  active_packages: number;
  completed_packages: number;
  total_spent: number;
  outstanding_balance: number;
  last_activity: string | null;
}

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<CustomerWithStats[]> => {
      // First get customers
      const { data: customers, error: customersError } = await supabase
        .rpc('get_customers_with_stats');

      if (customersError) {
        // Fallback to manual query if RPC doesn't exist
        const { data: customersData, error } = await supabase
          .from('customers' as any)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get package stats for each customer
        const customersWithStats = await Promise.all(
          (customersData || []).map(async (customer: Customer) => {
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
      }

      return customers;
    },
  });
};

export const useCustomerByUserId = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['customer', 'user', userId],
    queryFn: async (): Promise<Customer | null> => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('customers' as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customerData: CustomerInsert) => {
      const { data, error } = await supabase
        .from('customers' as any)
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CustomerUpdate }) => {
      const { data, error } = await supabase
        .from('customers' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer", 
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customers' as any)
        .delete()
        .eq('id', customerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      });
    },
  });
};
