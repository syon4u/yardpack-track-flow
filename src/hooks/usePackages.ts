
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

type Package = Database['public']['Tables']['packages']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null;
  invoices: Database['public']['Tables']['invoices']['Row'][];
};

type PackageStatus = Database['public']['Enums']['package_status'];

interface UsePackagesOptions {
  searchTerm?: string;
  statusFilter?: string;
}

export const usePackages = (options: UsePackagesOptions = {}) => {
  const { user, profile } = useAuth();
  const { searchTerm, statusFilter } = options;
  
  return useQuery({
    queryKey: ['packages', user?.id, profile?.role, searchTerm, statusFilter],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching packages for user:', user.id, 'with role:', profile?.role);
      
      let query = supabase
        .from('packages')
        .select(`
          *,
          profiles:customer_id(full_name, email),
          invoices(*)
        `)
        .order('created_at', { ascending: false });
      
      // If customer, only show their packages
      if (profile?.role === 'customer') {
        query = query.eq('customer_id', user.id);
      }
      
      // Apply search filter
      if (searchTerm && searchTerm.trim()) {
        query = query.or(`tracking_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      // Apply status filter - only if it's a valid status and not 'all'
      if (statusFilter && statusFilter !== 'all') {
        const validStatuses: PackageStatus[] = ['received', 'in_transit', 'arrived', 'ready_for_pickup', 'completed'];
        if (validStatuses.includes(statusFilter as PackageStatus)) {
          query = query.eq('status', statusFilter as PackageStatus);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching packages:', error);
        throw error;
      }
      
      console.log('Fetched packages:', data);
      return (data as Package[]) || [];
    },
    enabled: !!user,
  });
};

export const useUpdatePackageStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ packageId, status }: { packageId: string; status: Database['public']['Enums']['package_status'] }) => {
      console.log('Updating package status:', packageId, status);
      
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

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packageData: {
      tracking_number: string;
      customer_id: string;
      description: string;
      delivery_address: string;
      sender_name?: string;
      sender_address?: string;
      weight?: number;
      dimensions?: string;
      package_value?: number;
      notes?: string;
    }) => {
      console.log('Creating new package:', packageData);
      
      const { data, error } = await supabase
        .from('packages')
        .insert([packageData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};
