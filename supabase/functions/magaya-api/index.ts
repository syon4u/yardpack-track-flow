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

  async bulkSyncFromSupplier(supplierName: string, sessionId: string): Promise<any> {
    if (!this.accessToken && !(await this.authenticate())) {
      throw new Error('Failed to authenticate with Magaya API');
    }

    try {
      const response = await fetch(`${this.baseUrl}/shipments?supplier=${encodeURIComponent(supplierName)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch shipments: ${response.status}`);
      }

      const shipments = await response.json();
      console.log(`Found ${shipments.length} shipments for supplier: ${supplierName}`);

      // Update session with total shipments
      await this.supabase
        .from('magaya_sync_sessions')
        .update({ total_shipments: shipments.length })
        .eq('id', sessionId);

      return shipments;
    } catch (error) {
      console.error('Error fetching Magaya shipments:', error);
      throw error;
    }
  }

  async findSimilarCustomers(magayaCustomer: any): Promise<any[]> {
    try {
      const { data: customers, error } = await this.supabase
        .from('customers')
        .select('*');

      if (error) throw error;

      // Simple similarity matching based on name and address
      const similar = customers?.filter(customer => {
        const nameSimilarity = this.calculateSimilarity(
          customer.full_name.toLowerCase(),
          magayaCustomer.name?.toLowerCase() || ''
        );
        const addressSimilarity = magayaCustomer.address ? this.calculateSimilarity(
          customer.address?.toLowerCase() || '',
          magayaCustomer.address.toLowerCase()
        ) : 0;

        return nameSimilarity > 0.7 || addressSimilarity > 0.8;
      }) || [];

      return similar.map(customer => ({
        ...customer,
        confidence: Math.max(
          this.calculateSimilarity(customer.full_name.toLowerCase(), magayaCustomer.name?.toLowerCase() || ''),
          magayaCustomer.address ? this.calculateSimilarity(customer.address?.toLowerCase() || '', magayaCustomer.address.toLowerCase()) : 0
        )
      }));
    } catch (error) {
      console.error('Error finding similar customers:', error);
      return [];
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
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
    const { action, packageId, shipmentId, status, packageData, sessionId, supplierName } = await req.json();
    
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

      case 'bulk_sync_from_supplier':
        if (!sessionId || !supplierName) {
          throw new Error('Session ID and supplier name are required for bulk sync');
        }

        // Start background task for bulk sync
        EdgeRuntime.waitUntil(
          (async () => {
            try {
              const shipments = await magayaAPI.bulkSyncFromSupplier(supplierName, sessionId);
              let processedCount = 0;
              let createdPackages = 0;
              let updatedPackages = 0;
              let createdCustomers = 0;
              let errorCount = 0;

              for (const shipment of shipments) {
                try {
                  // Find or create customer
                  let customerId = null;
                  const customerData = {
                    name: shipment.consignee?.name || 'Unknown',
                    address: shipment.consignee?.address || '',
                    email: shipment.consignee?.email || null,
                    phone: shipment.consignee?.phone || null,
                  };

                  // Try to find similar customers
                  const similarCustomers = await magayaAPI.findSimilarCustomers(customerData);
                  
                  if (similarCustomers.length > 0 && similarCustomers[0].confidence > 0.8) {
                    // Use the most similar customer
                    customerId = similarCustomers[0].id;
                  } else {
                    // Create new customer
                    const { data: newCustomer, error: customerError } = await supabase
                      .from('customers')
                      .insert({
                        full_name: customerData.name,
                        address: customerData.address,
                        email: customerData.email,
                        phone_number: customerData.phone,
                        customer_type: 'guest',
                        notes: `Auto-created from Magaya sync - Supplier: ${supplierName}`,
                      })
                      .select()
                      .single();

                    if (customerError) {
                      console.error('Error creating customer:', customerError);
                      errorCount++;
                      continue;
                    }

                    customerId = newCustomer.id;
                    createdCustomers++;
                  }

                  // Check if package already exists
                  const { data: existingPackage } = await supabase
                    .from('packages')
                    .select('id')
                    .or(`tracking_number.eq.${shipment.reference_number},magaya_shipment_id.eq.${shipment.shipment_id}`)
                    .single();

                  const packageData = {
                    customer_id: customerId,
                    tracking_number: shipment.reference_number || `MAG-${shipment.shipment_id}`,
                    external_tracking_number: shipment.tracking_number,
                    description: shipment.description || 'Magaya Import',
                    delivery_address: customerData.address,
                    sender_name: shipment.sender?.name,
                    sender_address: shipment.sender?.address,
                    weight: shipment.weight,
                    dimensions: shipment.dimensions,
                    package_value: shipment.declared_value,
                    magaya_shipment_id: shipment.shipment_id,
                    magaya_reference_number: shipment.reference_number,
                    warehouse_location: shipment.warehouse_location,
                    consolidation_status: shipment.status || 'pending',
                    api_sync_status: 'synced',
                    last_api_sync: new Date().toISOString(),
                  };

                  if (existingPackage) {
                    // Update existing package (Magaya data takes precedence)
                    const { error: updateError } = await supabase
                      .from('packages')
                      .update(packageData)
                      .eq('id', existingPackage.id);

                    if (updateError) {
                      console.error('Error updating package:', updateError);
                      errorCount++;
                    } else {
                      updatedPackages++;
                    }
                  } else {
                    // Create new package
                    const { error: createError } = await supabase
                      .from('packages')
                      .insert(packageData);

                    if (createError) {
                      console.error('Error creating package:', createError);
                      errorCount++;
                    } else {
                      createdPackages++;
                    }
                  }

                  processedCount++;

                  // Update session progress
                  await supabase
                    .from('magaya_sync_sessions')
                    .update({
                      processed_shipments: processedCount,
                      created_packages: createdPackages,
                      updated_packages: updatedPackages,
                      created_customers: createdCustomers,
                      error_count: errorCount,
                    })
                    .eq('id', sessionId);

                } catch (error) {
                  console.error('Error processing shipment:', error);
                  errorCount++;
                  processedCount++;
                }
              }

              // Mark session as completed
              await supabase
                .from('magaya_sync_sessions')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  processed_shipments: processedCount,
                  created_packages: createdPackages,
                  updated_packages: updatedPackages,
                  created_customers: createdCustomers,
                  error_count: errorCount,
                })
                .eq('id', sessionId);

            } catch (error) {
              console.error('Bulk sync error:', error);
              await supabase
                .from('magaya_sync_sessions')
                .update({
                  status: 'failed',
                  completed_at: new Date().toISOString(),
                  session_data: { error: error.message },
                })
                .eq('id', sessionId);
            }
          })()
        );

        result = { message: 'Bulk sync started', sessionId };
        break;

      case 'get_sync_session':
        if (!sessionId) {
          throw new Error('Session ID is required');
        }
        
        const { data: session, error: sessionError } = await supabase
          .from('magaya_sync_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;
        result = session;
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
