
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

type Package = Database['public']['Tables']['packages']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
  invoices: Database['public']['Tables']['invoices']['Row'][];
};

export const usePackages = () => {
  const { user, profile } = useAuth();
  
  return useQuery({
    queryKey: ['packages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('packages')
        .select(`
          *,
          profiles!packages_customer_id_fkey(full_name, email),
          invoices(*)
        `)
        .order('created_at', { ascending: false });
      
      // If customer, only show their packages
      if (profile?.role === 'customer') {
        query = query.eq('customer_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Package[];
    },
    enabled: !!user,
  });
};

export const useUpdatePackageStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ packageId, status }: { packageId: string; status: Database['public']['Enums']['package_status'] }) => {
      const { error } = await supabase
        .from('packages')
        .update({ status })
        .eq('id', packageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};
