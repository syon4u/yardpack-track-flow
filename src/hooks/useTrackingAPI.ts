
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrackingEvent {
  id: string;
  package_id: string;
  carrier: string;
  event_type: string;
  event_description: string;
  event_location: string | null;
  event_timestamp: string;
  created_at: string;
}

interface TrackingAPIResponse {
  success: boolean;
  tracking_number: string;
  carrier: string;
  status: string;
  events: Array<{
    type: string;
    description: string;
    location: string;
    timestamp: string;
  }>;
  delivery_estimate: string | null;
  error?: string;
}

export const useTrackingEvents = (packageId: string) => {
  return useQuery({
    queryKey: ['tracking-events', packageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('package_id', packageId)
        .order('event_timestamp', { ascending: false });

      if (error) throw error;
      return data as TrackingEvent[];
    },
    enabled: !!packageId,
  });
};

export const useUSPSTracking = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trackingNumber, packageId }: { trackingNumber: string; packageId?: string }) => {
      console.log('Calling USPS tracking for:', trackingNumber);
      
      // Check if USPS API is configured
      const { data: config, error: configError } = await supabase
        .from('api_configurations')
        .select('*')
        .eq('carrier', 'USPS')
        .eq('is_active', true)
        .single();

      if (configError || !config) {
        throw new Error('USPS API configuration not found or inactive');
      }

      const { data, error } = await supabase.functions.invoke('usps-tracking', {
        body: { trackingNumber, packageId }
      });

      if (error) {
        console.error('USPS API Error:', error);
        throw error;
      }
      
      return data as TrackingAPIResponse;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Tracking Updated",
          description: `Successfully synced tracking for ${data.tracking_number}`,
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['packages'] });
        queryClient.invalidateQueries({ queryKey: ['tracking-events'] });
      } else {
        toast({
          title: "Tracking Failed",
          description: data.error || "Failed to sync tracking information",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('USPS tracking error:', error);
      
      let errorMessage = "Failed to connect to tracking service";
      if (error.message?.includes('configuration not found')) {
        errorMessage = "USPS API not configured. Please configure API keys in System Settings.";
      }
      
      toast({
        title: "Tracking Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

export const useCarrierDetection = () => {
  const detectCarrier = (trackingNumber: string): string => {
    const cleaned = trackingNumber.replace(/\s/g, '').toUpperCase();
    
    // USPS patterns
    if (/^(94|93|92|94|95)\d{20}$/.test(cleaned) || 
        /^[A-Z]{2}\d{9}US$/.test(cleaned) ||
        /^(70|14|23|03)\d{14}$/.test(cleaned)) {
      return 'USPS';
    }
    
    // FedEx patterns
    if (/^\d{12,14}$/.test(cleaned) || 
        /^\d{20}$/.test(cleaned) ||
        /^61\d{8}$/.test(cleaned)) {
      return 'FEDEX';
    }
    
    // UPS patterns
    if (/^1Z[A-Z0-9]{16}$/.test(cleaned)) {
      return 'UPS';
    }
    
    // DHL patterns
    if (/^\d{10,11}$/.test(cleaned) && cleaned.startsWith('1')) {
      return 'DHL';
    }
    
    return 'UNKNOWN';
  };

  return { detectCarrier };
};

// New hook to check API configuration status
export const useApiConfigurationStatus = () => {
  return useQuery({
    queryKey: ['api-configurations-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_configurations')
        .select('carrier, is_active, api_key_name')
        .eq('is_active', true);

      if (error) throw error;

      const status: Record<string, { configured: boolean; keyName: string }> = {};
      
      for (const config of data || []) {
        // In a real implementation, we would check if the secret exists
        // For now, we assume it's configured if the configuration exists
        status[config.carrier] = {
          configured: true, // This would be actual secret check
          keyName: config.api_key_name
        };
      }

      return status;
    },
  });
};
