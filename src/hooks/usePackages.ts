
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

type PackageStatus = Database['public']['Enums']['package_status'];

interface UsePackagesOptions {
  searchTerm?: string;
  statusFilter?: string;
}

// Define the transformed package type that PackageList expects
interface TransformedPackage {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  delivery_address: string;
  sender_name: string | null;
  sender_address: string | null;
  weight: number | null;
  dimensions: string | null;
  package_value: number | null;
  notes: string | null;
  carrier: string | null;
  external_tracking_number: string | null;
  status: PackageStatus;
  date_received: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  duty_rate: number | null;
  duty_amount: number | null;
  total_due: number | null;
  api_sync_status: string | null;
  last_api_sync: string | null;
  delivery_estimate: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    email: string;
    full_name: string;
    phone_number: string | null;
    address: string | null;
    role: string;
    created_at: string;
    updated_at: string;
  } | null;
  invoices: Array<{
    id: string;
    package_id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number | null;
    uploaded_by: string;
    uploaded_at: string;
  }>;
  customer_name: string;
  customer_email: string | null;
  invoice_uploaded: boolean;
  duty_assessed: boolean;
}

export const usePackages = (options: UsePackagesOptions = {}) => {
  const { user, profile } = useAuth();
  const { searchTerm, statusFilter } = options;
  
  return useQuery({
    queryKey: ['packages', user?.id, profile?.role, searchTerm, statusFilter],
    queryFn: async (): Promise<TransformedPackage[]> => {
      if (!user) return [];
      
      console.log('Fetching packages for user:', user.id, 'with role:', profile?.role);
      
      let query = supabase
        .from('packages')
        .select(`
          *,
          profiles:customer_id(*),
          invoices(*)
        `)
        .order('created_at', { ascending: false });

      // If customer, only show their packages
      if (profile?.role === 'customer') {
        query = query.eq('customer_id', user.id);
      }

      // Apply search filter
      if (searchTerm && searchTerm.trim()) {
        query = query.or(`tracking_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,external_tracking_number.ilike.%${searchTerm}%`);
      }

      // Apply status filter
      if (statusFilter && statusFilter !== 'all') {
        const validStatuses: PackageStatus[] = [
          'received', 'in_transit', 'arrived', 'ready_for_pickup', 'picked_up'
        ];
        
        if (validStatuses.includes(statusFilter as PackageStatus)) {
          query = query.eq('status', statusFilter as PackageStatus);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log('Fetched packages:', data);
      
      // Transform data to include computed properties that PackageList expects
      const transformedData: TransformedPackage[] = (data || []).map(pkg => ({
        ...pkg,
        customer_name: pkg.profiles?.full_name || 'Unknown Customer',
        customer_email: pkg.profiles?.email || null,
        invoices: pkg.invoices || [],
        invoice_uploaded: pkg.invoices && pkg.invoices.length > 0,
        duty_assessed: pkg.duty_amount !== null,
      }));
      
      return transformedData;
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
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};
