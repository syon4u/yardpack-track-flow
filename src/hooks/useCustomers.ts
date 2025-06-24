
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

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
      const { data: customers, error } = await supabase
        .from('customers')
        .select(`
          *,
          packages!packages_customer_id_fkey(
            id,
            status,
            package_value,
            total_due,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return customers.map(customer => {
        const packages = customer.packages || [];
        const totalSpent = packages.reduce((sum, pkg) => sum + (pkg.package_value || 0), 0);
        const outstandingBalance = packages.reduce((sum, pkg) => sum + (pkg.total_due || 0), 0);
        const activePackages = packages.filter(pkg => 
          ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)
        ).length;
        const completedPackages = packages.filter(pkg => pkg.status === 'picked_up').length;
        const lastActivity = packages.length > 0 
          ? packages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;

        return {
          ...customer,
          packages: undefined, // Remove packages array from final object
          total_packages: packages.length,
          active_packages: activePackages,
          completed_packages: completedPackages,
          total_spent: totalSpent,
          outstanding_balance: outstandingBalance,
          last_activity: lastActivity,
        };
      });
    },
  });
};

export const useCustomerByUserId = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['customer', 'user', userId],
    queryFn: async (): Promise<Customer | null> => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('customers')
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
        .from('customers')
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
        .from('customers')
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
        .from('customers')
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
