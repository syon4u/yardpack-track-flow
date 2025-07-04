import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  deviceToken?: string;
  deviceTokens?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  packageId?: string;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      deviceToken,
      deviceTokens,
      title,
      body,
      data = {},
      packageId,
      userId
    }: PushNotificationRequest = await req.json();

    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
    if (!fcmServerKey) {
      throw new Error('FCM_SERVER_KEY not configured');
    }

    // Determine target tokens
    let targetTokens: string[] = [];
    if (deviceToken) {
      targetTokens = [deviceToken];
    } else if (deviceTokens) {
      targetTokens = deviceTokens;
    } else if (userId) {
      // Fetch user's device tokens from database
      // This would require querying the profiles table for push_token
      // For now, we'll skip this implementation
      throw new Error('User ID lookup not implemented yet');
    } else {
      throw new Error('No device tokens provided');
    }

    const results = [];
    
    for (const token of targetTokens) {
      try {
        const fcmPayload = {
          to: token,
          notification: {
            title,
            body,
            sound: 'default',
            badge: 1,
          },
          data: {
            ...data,
            packageId: packageId || '',
          },
          priority: 'high',
        };

        const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmServerKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fcmPayload),
        });

        const fcmResult = await fcmResponse.json();
        
        if (fcmResult.success === 1) {
          results.push({ token, success: true, messageId: fcmResult.results[0].message_id });
        } else {
          console.error('FCM Error for token', token, ':', fcmResult);
          results.push({ 
            token, 
            success: false, 
            error: fcmResult.results?.[0]?.error || 'Unknown error' 
          });
        }
      } catch (error) {
        console.error('Error sending to token', token, ':', error);
        results.push({ token, success: false, error: error.message });
      }
    }

    console.log('Push notification results:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);