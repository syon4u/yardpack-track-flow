
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MagayaAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface MagayaShipmentData {
  shipment_id?: string;
  reference_number?: string;
  status?: string;
  warehouse_location?: string;
  tracking_number?: string;
  description?: string;
  weight?: number;
  dimensions?: string;
  value?: number;
  sender?: {
    name?: string;
    address?: string;
  };
  receiver?: {
    name?: string;
    address?: string;
  };
}

class MagayaAPI {
  private baseUrl: string;
  private accessToken: string | null = null;
  private supabase: any;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async authenticate(): Promise<boolean> {
    try {
      const clientId = Deno.env.get('MAGAYA_CLIENT_ID');
      const clientSecret = Deno.env.get('MAGAYA_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('Magaya credentials not configured');
      }

      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const authData: MagayaAuthResponse = await response.json();
      this.accessToken = authData.access_token;
      return true;
    } catch (error) {
      console.error('Magaya authentication error:', error);
      return false;
    }
  }

  async createShipment(packageData: any): Promise<MagayaShipmentData | null> {
    if (!this.accessToken && !(await this.authenticate())) {
      throw new Error('Failed to authenticate with Magaya API');
    }

    try {
      const shipmentData = {
        reference_number: packageData.tracking_number,
        description: packageData.description,
        weight: packageData.weight,
        dimensions: packageData.dimensions,
        declared_value: packageData.package_value,
        sender: {
          name: packageData.sender_name,
          address: packageData.sender_address,
        },
        consignee: {
          name: packageData.customer_name,
          address: packageData.delivery_address,
        },
      };

      const response = await fetch(`${this.baseUrl}/shipments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create shipment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Magaya shipment:', error);
      throw error;
    }
  }

  async updateShipmentStatus(shipmentId: string, status: string): Promise<MagayaShipmentData | null> {
    if (!this.accessToken && !(await this.authenticate())) {
      throw new Error('Failed to authenticate with Magaya API');
    }

    try {
      const response = await fetch(`${this.baseUrl}/shipments/${shipmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update shipment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating Magaya shipment:', error);
      throw error;
    }
  }

  async getShipmentInfo(shipmentId: string): Promise<MagayaShipmentData | null> {
    if (!this.accessToken && !(await this.authenticate())) {
      throw new Error('Failed to authenticate with Magaya API');
    }

    try {
      const response = await fetch(`${this.baseUrl}/shipments/${shipmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get shipment info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting Magaya shipment info:', error);
      throw error;
    }
  }

  async logSyncAttempt(packageId: string, syncType: string, success: boolean, response?: any, error?: string) {
    try {
      await this.supabase
        .from('magaya_sync_log')
        .insert({
          package_id: packageId,
          sync_type: syncType,
          sync_status: success ? 'success' : 'failed',
          magaya_response: response,
          error_message: error,
        });
    } catch (logError) {
      console.error('Failed to log sync attempt:', logError);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, packageId, shipmentId, status, packageData } = await req.json();
    
    // Get Magaya API configuration
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: config } = await supabase
      .from('api_configurations')
      .select('*')
      .eq('carrier', 'MAGAYA')
      .eq('is_active', true)
      .single();

    if (!config) {
      throw new Error('Magaya API configuration not found');
    }

    const magayaAPI = new MagayaAPI(config.base_url);

    let result;
    let syncType = action;

    switch (action) {
      case 'create_shipment':
        result = await magayaAPI.createShipment(packageData);
        
        // Update package with Magaya shipment details
        if (result && packageId) {
          await supabase
            .from('packages')
            .update({
              magaya_shipment_id: result.shipment_id,
              magaya_reference_number: result.reference_number,
              warehouse_location: result.warehouse_location,
            })
            .eq('id', packageId);
        }
        
        await magayaAPI.logSyncAttempt(packageId, syncType, true, result);
        break;

      case 'update_status':
        result = await magayaAPI.updateShipmentStatus(shipmentId, status);
        await magayaAPI.logSyncAttempt(packageId, syncType, true, result);
        break;

      case 'get_shipment':
        result = await magayaAPI.getShipmentInfo(shipmentId);
        await magayaAPI.logSyncAttempt(packageId, syncType, true, result);
        break;

      case 'sync_package':
        // Comprehensive sync for a specific package
        const { data: packageInfo } = await supabase
          .from('packages')
          .select('*')
          .eq('id', packageId)
          .single();

        if (!packageInfo) {
          throw new Error('Package not found');
        }

        if (packageInfo.magaya_shipment_id) {
          // Update existing shipment
          result = await magayaAPI.getShipmentInfo(packageInfo.magaya_shipment_id);
          if (result) {
            await supabase
              .from('packages')
              .update({
                warehouse_location: result.warehouse_location,
                consolidation_status: result.status,
              })
              .eq('id', packageId);
          }
        } else {
          // Create new shipment
          result = await magayaAPI.createShipment({
            ...packageInfo,
            customer_name: packageInfo.sender_name || 'Unknown',
          });
          
          if (result) {
            await supabase
              .from('packages')
              .update({
                magaya_shipment_id: result.shipment_id,
                magaya_reference_number: result.reference_number,
                warehouse_location: result.warehouse_location,
              })
              .eq('id', packageId);
          }
        }
        
        await magayaAPI.logSyncAttempt(packageId, syncType, true, result);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Magaya API error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
