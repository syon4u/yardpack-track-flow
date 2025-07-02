
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  user_id: string;
  package_id: string | null;
  type: 'email' | 'sms';
  recipient: string;
  subject: string | null;
  message: string;
  sent_at: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const { user, profile } = useAuth();
  
  return useQuery({
    queryKey: ['notifications', user?.id, profile?.role],
    queryFn: async (): Promise<Notification[]> => {
      if (!user) return [];
      
      console.log('Fetching notifications for user:', user.id, 'role:', profile?.role);
      
      let query = supabase
        .from('notifications')
        .select('*');
      
      // If admin, get ALL notifications; if customer, only their own
      if (profile?.role === 'admin') {
        console.log('Admin user - fetching all notifications');
      } else {
        console.log('Customer user - fetching only their notifications');
        query = query.eq('user_id', user.id);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      console.log('Fetched notifications:', data?.length || 0);
      return data || [];
    },
    enabled: !!user,
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ packageId, status }: { packageId: string; status: string }) => {
      console.log('Triggering notification for package:', packageId, 'status:', status);
      
      const { data, error } = await supabase.functions.invoke('send-package-notification', {
        body: { packageId, status }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to send notification: ${error.message}`);
      }
      
      console.log('Notification sent successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Notification mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error) => {
      console.error('Notification mutation failed:', error);
    },
  });
};
