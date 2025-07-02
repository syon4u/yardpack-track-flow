
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MagayaActionParams {
  action: 'create_shipment' | 'update_status' | 'get_shipment' | 'sync_package';
  packageId?: string;
  shipmentId?: string;
  status?: string;
  packageData?: any;
}

interface MagayaResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const useMagayaIntegration = () => {
  const queryClient = useQueryClient();

  const callMagayaAPI = async (params: MagayaActionParams): Promise<MagayaResponse> => {
    const { data, error } = await supabase.functions.invoke('magaya-api', {
      body: params,
    });

    if (error) {
      throw new Error(error.message || 'Failed to call Magaya API');
    }

    return data;
  };

  const createShipmentMutation = useMutation({
    mutationFn: async ({ packageId, packageData }: { packageId: string; packageData: any }) => {
      return callMagayaAPI({
        action: 'create_shipment',
        packageId,
        packageData,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package synced with Magaya successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync with Magaya: ${error.message}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ packageId, shipmentId, status }: { packageId: string; shipmentId: string; status: string }) => {
      return callMagayaAPI({
        action: 'update_status',
        packageId,
        shipmentId,
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Shipment status updated in Magaya');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update Magaya status: ${error.message}`);
    },
  });

  const syncPackageMutation = useMutation({
    mutationFn: async (packageId: string) => {
      return callMagayaAPI({
        action: 'sync_package',
        packageId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package synced with Magaya');
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync package: ${error.message}`);
    },
  });

  const getShipmentInfoMutation = useMutation({
    mutationFn: async ({ packageId, shipmentId }: { packageId: string; shipmentId: string }) => {
      return callMagayaAPI({
        action: 'get_shipment',
        packageId,
        shipmentId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to get Magaya shipment info: ${error.message}`);
    },
  });

  return {
    createShipment: createShipmentMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    syncPackage: syncPackageMutation.mutate,
    getShipmentInfo: getShipmentInfoMutation.mutate,
    isLoading: createShipmentMutation.isPending || 
               updateStatusMutation.isPending || 
               syncPackageMutation.isPending || 
               getShipmentInfoMutation.isPending,
  };
};
