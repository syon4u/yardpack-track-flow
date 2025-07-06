import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  display_name: string;
  description?: string;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useSystemSettings = (category?: string) => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['system-settings', category, user?.id],
    queryFn: async (): Promise<SystemSetting[]> => {
      if (!user) return [];

      let query = supabase
        .from('system_settings')
        .select('*')
        .order('display_name');

      if (category) {
        query = query.eq('category', category);
      }

      // Non-admin users can only see public settings
      if (profile?.role !== 'admin') {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateSystemSetting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, setting_value }: { id: string; setting_value: string }) => {
      const { data, error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: "Setting Updated",
        description: "System setting has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update system setting.",
        variant: "destructive",
      });
      console.error('Error updating system setting:', error);
    },
  });
};

// Helper hook to get a specific setting value
export const useSystemSetting = (settingKey: string) => {
  const { data: settings } = useSystemSettings();
  
  const setting = settings?.find(s => s.setting_key === settingKey);
  
  const getValue = () => {
    if (!setting) return null;
    
    switch (setting.setting_type) {
      case 'number':
        return parseFloat(setting.setting_value);
      case 'boolean':
        return setting.setting_value.toLowerCase() === 'true';
      default:
        return setting.setting_value;
    }
  };

  return {
    setting,
    value: getValue(),
    loading: !settings,
  };
};