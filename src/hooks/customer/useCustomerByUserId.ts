
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';

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
