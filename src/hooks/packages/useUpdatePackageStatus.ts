
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';
import { updatePackageStatus } from '@/services/packageService';
import { useSendNotification } from '@/hooks/useNotifications';

type PackageStatus = Database['public']['Enums']['package_status'];

export const useUpdatePackageStatus = () => {
  const queryClient = useQueryClient();
  const { mutate: sendNotification } = useSendNotification();
  
  return useMutation({
    mutationFn: async ({ packageId, status }: { packageId: string; status: PackageStatus }) => {
      await updatePackageStatus(packageId, status);
      
      // Automatically trigger notification when status is updated
      try {
        // Use the mutateAsync function to properly handle async notification
        const notificationMutation = useSendNotification();
        await new Promise((resolve, reject) => {
          notificationMutation.mutate(
            { packageId, status },
            {
              onSuccess: resolve,
              onError: reject
            }
          );
        });
        console.log('Notification triggered for package:', packageId);
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
        // Don't fail the status update if notification fails
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};
