
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedDataService } from '@/services/unifiedDataService';
import { UnifiedPackage } from '@/types/unified';

type PackageStatus = Database['public']['Enums']['package_status'];

interface UsePackagesOptions {
  searchTerm?: string;
  statusFilter?: string;
}

export const usePackages = (options: UsePackagesOptions = {}) => {
  const { user, profile } = useAuth();
  const { searchTerm, statusFilter } = options;
  
  return useQuery({
    queryKey: ['unified-packages', user?.id, profile?.role, searchTerm, statusFilter],
    queryFn: async (): Promise<UnifiedPackage[]> => {
      if (!user) return [];
      
      console.log('Fetching unified packages for user:', user.id, 'with role:', profile?.role);
      
      const fetchOptions: any = { searchTerm, statusFilter };
      
      // If customer, only show their packages
      if (profile?.role === 'customer') {
        fetchOptions.customerId = user.id;
      }
      
      const packages = await UnifiedDataService.fetchAllPackages(fetchOptions);
      console.log('Fetched unified packages:', packages);
      return packages;
    },
    enabled: !!user,
  });
};

export const useUpdatePackageStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ packageId, status }: { packageId: string; status: PackageStatus }) => {
      console.log('Updating package status:', packageId, status);
      
      const { error } = await supabase
        .from('packages')
        .update({ status })
        .eq('id', packageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-packages'] });
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
      carrier?: string;
      external_tracking_number?: string;
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
      queryClient.invalidateQueries({ queryKey: ['unified-packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};

// Hook for unified statistics
export const useUnifiedStats = () => {
  return useQuery({
    queryKey: ['unified-stats'],
    queryFn: () => UnifiedDataService.fetchUnifiedStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for unified customers
export const useUnifiedCustomers = () => {
  return useQuery({
    queryKey: ['unified-customers'],
    queryFn: () => UnifiedDataService.fetchAllCustomers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
