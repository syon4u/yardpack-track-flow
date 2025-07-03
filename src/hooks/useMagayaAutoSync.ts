import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MagayaAutoSyncConfig {
  id: string;
  is_enabled: boolean;
  sync_on_status_changes: string[];
  retry_attempts: number;
  retry_delay_seconds: number;
  created_at: string;
  updated_at: string;
}

export const useMagayaAutoSyncConfig = () => {
  return useQuery({
    queryKey: ['magaya-auto-sync-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('magaya_auto_sync_config')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as MagayaAutoSyncConfig;
    },
  });
};

export const useUpdateMagayaAutoSyncConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<MagayaAutoSyncConfig>) => {
      const { data, error } = await supabase
        .from('magaya_auto_sync_config')
        .update(config)
        .select()
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magaya-auto-sync-config'] });
      toast.success('Magaya auto-sync configuration updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update auto-sync config: ${error.message}`);
    },
  });
};

export const useMagayaSyncLog = (packageId?: string) => {
  return useQuery({
    queryKey: ['magaya-sync-log', packageId],
    queryFn: async () => {
      let query = supabase
        .from('magaya_sync_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (packageId) {
        query = query.eq('package_id', packageId);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!packageId || packageId === undefined,
  });
};