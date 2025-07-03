import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FedExTrackingRequest {
  trackingNumber: string;
  packageId?: string;
}

interface FedExTrackingResponse {
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

    const { trackingNumber, packageId }: FedExTrackingRequest = await req.json();
    
    if (!trackingNumber) {
      throw new Error('Tracking number is required');
    }

    console.log('FedEx tracking request:', { trackingNumber, packageId });

    // Get FedEx API credentials
    const fedexApiKey = Deno.env.get('FEDEX_API_KEY');
    const fedexSecretKey = Deno.env.get('FEDEX_SECRET_KEY');
    
    if (!fedexApiKey || !fedexSecretKey) {
      throw new Error('FedEx API credentials not configured');
    }

    // Get OAuth token first
    const tokenResponse = await fetch('https://apis.fedex.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: fedexApiKey,
        client_secret: fedexSecretKey,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`FedEx OAuth failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Track the package
    const trackingResponse = await fetch('https://apis.fedex.com/track/v1/trackingnumbers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-locale': 'en_US',
      },
      body: JSON.stringify({
        includeDetailedScans: true,
        trackingInfo: [
          {
            trackingNumberInfo: {
              trackingNumber: trackingNumber,
            },
          },
        ],
      }),
    });

    if (!trackingResponse.ok) {
      throw new Error(`FedEx API request failed: ${trackingResponse.statusText}`);
    }

    const trackingData = await trackingResponse.json();
    console.log('FedEx API response:', trackingData);

    // Parse response
    const trackingInfo = trackingData.output?.completeTrackResults?.[0]?.trackResults?.[0];
    
    if (!trackingInfo) {
      throw new Error('No tracking information found');
    }

    // Extract events
    const events = (trackingInfo.scanEvents || []).map((event: any) => ({
      type: event.eventType || 'UPDATE',
      description: event.eventDescription || 'Package update',
      location: event.scanLocation?.city ? `${event.scanLocation.city}, ${event.scanLocation.stateOrProvinceCode}` : 'Unknown',
      timestamp: event.date || new Date().toISOString(),
    }));

    // Determine current status
    let status = 'in_transit';
    const latestStatus = trackingInfo.latestStatusDetail?.description?.toLowerCase() || '';
    
    if (latestStatus.includes('delivered')) {
      status = 'picked_up';
    } else if (latestStatus.includes('out for delivery') || latestStatus.includes('on vehicle')) {
      status = 'ready_for_pickup';
    } else if (latestStatus.includes('arrived') || latestStatus.includes('at destination')) {
      status = 'arrived';
    }

    // Store tracking events if packageId provided
    if (packageId && events.length > 0) {
      for (const event of events) {
        await supabase
          .from('tracking_events')
          .upsert({
            package_id: packageId,
            carrier: 'FedEx',
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

    const response: FedExTrackingResponse = {
      success: true,
      tracking_number: trackingNumber,
      carrier: 'FedEx',
      status,
      events,
      delivery_estimate: trackingInfo.estimatedDeliveryTimeWindow?.window?.ends || null,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('FedEx tracking error:', error);
    
    const errorResponse: FedExTrackingResponse = {
      success: false,
      tracking_number: '',
      carrier: 'FedEx',
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