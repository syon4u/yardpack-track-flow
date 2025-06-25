
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  customers: {
    id: string;
    full_name: string;
    email: string | null;
    phone_number: string | null;
    address: string | null;
    customer_type: Database['public']['Enums']['customer_type'];
    user_id: string | null;
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
  const { user, profile, session } = useAuth();
  const { searchTerm, statusFilter } = options;
  
  return useQuery({
    queryKey: ['packages', user?.id, profile?.role, searchTerm, statusFilter],
    queryFn: async (): Promise<TransformedPackage[]> => {
      if (!user || !session) {
        throw new Error('Authentication required');
      }
      
      console.log('Fetching packages for user:', user.id, 'with role:', profile?.role);
      
      let query = supabase
        .from('packages')
        .select(`
          *,
          customers(*),
          invoices(*)
        `)
        .order('created_at', { ascending: false });

      // If customer, only show packages for customers linked to their user account
      if (profile?.role === 'customer') {
        query = query.eq('customers.user_id', user.id);
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
      
      if (error) {
        console.error('Error fetching packages:', error);
        throw error;
      }
      
      console.log('Fetched packages:', data);
      
      // Transform data to include computed properties that PackageList expects
      const transformedData: TransformedPackage[] = (data || []).map(pkg => ({
        ...pkg,
        customer_name: pkg.customers?.full_name || 'Unknown Customer',
        customer_email: pkg.customers?.email || null,
        invoices: pkg.invoices || [],
        invoice_uploaded: pkg.invoices && pkg.invoices.length > 0,
        duty_assessed: pkg.duty_amount !== null,
      }));
      
      return transformedData;
    },
    enabled: !!user && !!session && !!profile,
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error.message?.includes('auth') || error.message?.includes('JWT') || error.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useUpdatePackageStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, session } = useAuth();

  const statusLabels = {
    received: 'Received at Miami',
    in_transit: 'In Transit',
    arrived: 'Arrived in Jamaica',
    ready_for_pickup: 'Ready for Pickup',
    picked_up: 'Picked Up'
  };
  
  return useMutation({
    mutationFn: async ({ packageId, status }: { packageId: string; status: PackageStatus }) => {
      if (!user || !session) {
        throw new Error('Authentication required');
      }

      console.log('Updating package status:', packageId, status);
      
      const { error } = await supabase
        .from('packages')
        .update({ status })
        .eq('id', packageId);
      
      if (error) throw error;

      return { packageId, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      const statusLabel = statusLabels[data.status] || data.status;
      toast({
        title: 'Package status updated',
        description: `Package has been marked as "${statusLabel}".`,
      });
    },
    onError: (error: Error, variables) => {
      console.error('Package status update failed:', error);
      const statusLabel = statusLabels[variables.status] || variables.status;
      const isAuthError = error.message?.includes('auth') || error.message?.includes('Authentication');
      
      toast({
        title: 'Status update failed',
        description: isAuthError 
          ? 'Authentication required. Please sign in again.'
          : `Failed to update package status to "${statusLabel}". ${error.message || 'Please try again.'}`,
        variant: 'destructive',
      });
    },
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, session } = useAuth();
  
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
      if (!user || !session) {
        throw new Error('Authentication required');
      }

      console.log('Creating new package:', packageData);
      
      const { data, error } = await supabase
        .from('packages')
        .insert([packageData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({
        title: 'Package created successfully',
        description: `Package ${data.tracking_number} has been added to the system.`,
      });
    },
    onError: (error: Error) => {
      console.error('Package creation failed:', error);
      const isAuthError = error.message?.includes('auth') || error.message?.includes('Authentication');
      
      toast({
        title: 'Package creation failed',
        description: isAuthError 
          ? 'Authentication required. Please sign in again.'
          : error.message || 'There was an error creating the package. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
