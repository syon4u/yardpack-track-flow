
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Customer } from '@/types/customer';

export const useCustomers = () => {
  const { user, profile, session } = useAuth();
  
  return useQuery({
    queryKey: ['customers', user?.id],
    queryFn: async (): Promise<Customer[]> => {
      if (!user || !session) {
        throw new Error('Authentication required');
      }

      // Only admins can view all customers
      if (profile?.role !== 'admin') {
        throw new Error('Insufficient permissions');
      }

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && !!session && profile?.role === 'admin',
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error.message?.includes('auth') || error.message?.includes('Authentication') || error.message?.includes('permissions')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
