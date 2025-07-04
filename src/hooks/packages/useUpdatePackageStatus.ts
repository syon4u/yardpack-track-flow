import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';
import { updatePackageStatus } from '@/services/packageService';
import { useSendNotification } from '@/hooks/useNotifications';
import { defaultMutationRetryOptions } from '@/utils/retryUtils';

type PackageStatus = Database['public']['Enums']['package_status'];

export const useUpdatePackageStatus = () => {
  const queryClient = useQueryClient();
  const { mutate: sendNotification } = useSendNotification();
  
  return useMutation({
    mutationFn: async ({ packageId, status }: { packageId: string; status: PackageStatus }) => {
      await updatePackageStatus(packageId, status);
      
      // Automatically trigger notification when status is updated
      try {
        await sendNotification({ packageId, status });
        console.log('Notification triggered for package:', packageId);
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
        // Don't fail the status update if notification fails
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['optimized-packages'] });
    },
    ...defaultMutationRetryOptions,
  });
};