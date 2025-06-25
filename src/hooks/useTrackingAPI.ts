
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
      
      const { data, error } = await supabase.functions.invoke('usps-tracking', {
        body: { trackingNumber, packageId }
      });

      if (error) throw error;
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
    onError: (error) => {
      console.error('USPS tracking error:', error);
      toast({
        title: "Tracking Error",
        description: "Failed to connect to tracking service",
        variant: "destructive",
      });
    },
  });
};

export const useCarrierDetection = () => {
  const detectCarrier = (trackingNumber: string): string => {
    const cleaned = trackingNumber.replace(/\s/g, '').toUpperCase();
    
    // USPS patterns
    if (/^(94|93|92|95)\d{20}$/.test(cleaned) || 
        /^[A-Z]{2}\d{9}US$/.test(cleaned) ||
        /^(70|14|23|03)\d{14}$/.test(cleaned)) {
      return 'USPS';
    }
    
    // FedEx patterns - updated to include 15-digit numbers
    if (/^\d{12,15}$/.test(cleaned) || 
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
