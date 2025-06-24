
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrackingRequest {
  trackingNumber: string;
  packageId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trackingNumber, packageId }: TrackingRequest = await req.json();
    
    if (!trackingNumber) {
      throw new Error('Tracking number is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Tracking USPS package:', trackingNumber);

    // Get USPS API credentials
    const { data: config } = await supabase
      .from('api_configurations')
      .select('*')
      .eq('carrier', 'USPS')
      .eq('is_active', true)
      .single();

    if (!config) {
      throw new Error('USPS API configuration not found');
    }

    const uspsApiKey = Deno.env.get('USPS_API_KEY');
    if (!uspsApiKey) {
      throw new Error('USPS API key not configured');
    }

    // USPS Tracking API XML request
    const xmlRequest = `
      <TrackRequest USERID="${uspsApiKey}">
        <TrackID ID="${trackingNumber}"></TrackID>
      </TrackRequest>
    `;

    const response = await fetch(`${config.base_url}?API=TrackV2&XML=${encodeURIComponent(xmlRequest)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const xmlResponse = await response.text();
    console.log('USPS API Response:', xmlResponse);

    // Parse XML response (simplified - in production, use a proper XML parser)
    const trackInfo = parseUSPSTrackingResponse(xmlResponse);

    // Update package if packageId provided
    if (packageId && trackInfo.status) {
      await supabase
        .from('packages')
        .update({
          api_sync_status: 'synced',
          last_api_sync: new Date().toISOString(),
          carrier: 'USPS',
          external_tracking_number: trackingNumber,
        })
        .eq('id', packageId);

      // Insert tracking event
      if (trackInfo.events && trackInfo.events.length > 0) {
        const trackingEvents = trackInfo.events.map(event => ({
          package_id: packageId,
          carrier: 'USPS',
          event_type: event.type,
          event_description: event.description,
          event_location: event.location,
          event_timestamp: event.timestamp,
          raw_data: { original_response: xmlResponse }
        }));

        await supabase
          .from('tracking_events')
          .insert(trackingEvents);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        tracking_number: trackingNumber,
        carrier: 'USPS',
        status: trackInfo.status,
        events: trackInfo.events,
        delivery_estimate: trackInfo.delivery_estimate,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('USPS tracking error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function parseUSPSTrackingResponse(xmlResponse: string) {
  // Simplified XML parsing - in production, use a proper XML parser
  const status = xmlResponse.includes('<Status>') 
    ? xmlResponse.match(/<Status>(.*?)<\/Status>/)?.[1] || 'Unknown'
    : 'No tracking information available';

  const events = [];
  
  if (xmlResponse.includes('<TrackDetail>')) {
    const eventText = xmlResponse.match(/<TrackDetail>(.*?)<\/TrackDetail>/)?.[1];
    if (eventText) {
      events.push({
        type: 'update',
        description: eventText,
        location: 'Unknown',
        timestamp: new Date().toISOString(),
      });
    }
  }

  return {
    status,
    events,
    delivery_estimate: null,
  };
}
