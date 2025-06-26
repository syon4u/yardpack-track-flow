
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Customer = Database['public']['Tables']['customers']['Row'];

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<Customer[]> => {
      console.log('Fetching customers from customers table');
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      
      console.log('Fetched customers:', data);
      return data || [];
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
        console.error('Error fetching customer:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!customerId,
  });
};
