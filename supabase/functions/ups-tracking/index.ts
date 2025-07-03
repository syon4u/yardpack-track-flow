import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UPSTrackingRequest {
  trackingNumber: string;
  packageId?: string;
}

interface UPSTrackingResponse {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { trackingNumber, packageId }: UPSTrackingRequest = await req.json();
    
    if (!trackingNumber) {
      throw new Error('Tracking number is required');
    }

    console.log('UPS tracking request:', { trackingNumber, packageId });

    // Get UPS API credentials
    const upsClientId = Deno.env.get('UPS_CLIENT_ID');
    const upsClientSecret = Deno.env.get('UPS_CLIENT_SECRET');
    
    if (!upsClientId || !upsClientSecret) {
      throw new Error('UPS API credentials not configured');
    }

    // Get OAuth token first
    const tokenResponse = await fetch('https://onlinetools.ups.com/security/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${upsClientId}:${upsClientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`UPS OAuth failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Track the package
    const trackingResponse = await fetch(`https://onlinetools.ups.com/api/track/v1/details/${trackingNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!trackingResponse.ok) {
      throw new Error(`UPS API request failed: ${trackingResponse.statusText}`);
    }

    const trackingData = await trackingResponse.json();
    console.log('UPS API response:', trackingData);

    // Parse response
    const trackingInfo = trackingData.trackResponse?.shipment?.[0]?.package?.[0];
    
    if (!trackingInfo) {
      throw new Error('No tracking information found');
    }

    // Extract events
    const events = (trackingInfo.activity || []).map((event: any) => ({
      type: event.status?.type || 'UPDATE',
      description: event.status?.description || 'Package update',
      location: event.location?.address?.city ? 
        `${event.location.address.city}, ${event.location.address.stateProvinceCode}` : 'Unknown',
      timestamp: event.date && event.time ? 
        `${event.date}T${event.time}:00Z` : new Date().toISOString(),
    }));

    // Determine current status
    let status = 'in_transit';
    const currentStatus = trackingInfo.currentStatus?.description?.toLowerCase() || '';
    
    if (currentStatus.includes('delivered')) {
      status = 'picked_up';
    } else if (currentStatus.includes('out for delivery')) {
      status = 'ready_for_pickup';
    } else if (currentStatus.includes('arrived') || currentStatus.includes('facility')) {
      status = 'arrived';
    }

    // Store tracking events if packageId provided
    if (packageId && events.length > 0) {
      for (const event of events) {
        await supabase
          .from('tracking_events')
          .upsert({
            package_id: packageId,
            carrier: 'UPS',
            event_type: event.type,
            event_description: event.description,
            event_location: event.location,
            event_timestamp: event.timestamp,
            raw_data: trackingInfo,
          }, {
            onConflict: 'package_id,event_timestamp,event_description',
          });
      }
    }

    const response: UPSTrackingResponse = {
      success: true,
      tracking_number: trackingNumber,
      carrier: 'UPS',
      status,
      events,
      delivery_estimate: trackingInfo.deliveryDate?.date || null,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('UPS tracking error:', error);
    
    const errorResponse: UPSTrackingResponse = {
      success: false,
      tracking_number: '',
      carrier: 'UPS',
      status: 'error',
      events: [],
      delivery_estimate: null,
      error: error.message,
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});