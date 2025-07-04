
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type PickupVerificationMethod = Database['public']['Tables']['pickup_verification_methods']['Row'];
type PackagePickupRecord = Database['public']['Tables']['package_pickup_records']['Row'];
type PickupCode = Database['public']['Tables']['pickup_codes']['Row'];
type PickupDisputeLog = Database['public']['Tables']['pickup_dispute_logs']['Row'];

// Fetch verification methods
export const usePickupVerificationMethods = () => {
  return useQuery({
    queryKey: ['pickup-verification-methods'],
    queryFn: async (): Promise<PickupVerificationMethod[]> => {
      const { data, error } = await supabase
        .from('pickup_verification_methods')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch pickup records for a package
export const usePackagePickupRecords = (packageId: string) => {
  return useQuery({
    queryKey: ['package-pickup-records', packageId],
    queryFn: async (): Promise<PackagePickupRecord[]> => {
      const { data, error } = await supabase
        .from('package_pickup_records')
        .select(`
          *,
          verification_method:pickup_verification_methods(*),
          authorized_staff:profiles(*)
        `)
        .eq('package_id', packageId)
        .order('pickup_timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!packageId,
  });
};

// Create pickup record
export const useCreatePickupRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recordData: {
      package_id: string;
      verification_method_id: string;
      pickup_person_name: string;
      pickup_person_phone?: string;
      pickup_person_relationship?: string;
      authorized_by_staff: string;
      verification_data?: any;
      pickup_notes?: string;
      package_condition?: string;
      customer_satisfied?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('package_pickup_records')
        .insert([recordData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['package-pickup-records', data.package_id] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};

// Generate pickup code
export const useGeneratePickupCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      package_id,
      code_type,
      expires_in_hours = 24,
    }: {
      package_id: string;
      code_type: 'qr' | 'pin';
      expires_in_hours?: number;
    }) => {
      const code_value = code_type === 'pin' 
        ? Math.floor(100000 + Math.random() * 900000).toString() // 6-digit PIN
        : crypto.randomUUID().substring(0, 8).toUpperCase(); // 8-char QR code

      const expires_at = new Date();
      expires_at.setHours(expires_at.getHours() + expires_in_hours);

      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pickup_codes')
        .insert([{
          package_id,
          code_type,
          code_value,
          expires_at: expires_at.toISOString(),
          generated_by: profile.user.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pickup-codes', data.package_id] });
    },
  });
};

// Verify pickup code
export const useVerifyPickupCode = () => {
  return useMutation({
    mutationFn: async ({
      package_id,
      code_value,
    }: {
      package_id: string;
      code_value: string;
    }) => {
      const { data, error } = await supabase
        .from('pickup_codes')
        .select('*')
        .eq('package_id', package_id)
        .eq('code_value', code_value.toUpperCase())
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .is('used_at', null)
        .single();
      
      if (error) throw new Error('Invalid or expired code');
      
      // Mark code as used
      const { error: updateError } = await supabase
        .from('pickup_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('id', data.id);
      
      if (updateError) throw updateError;
      return data;
    },
  });
};
