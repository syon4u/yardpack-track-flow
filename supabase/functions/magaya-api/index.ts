import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

interface MagayaCredentials {
  network_id: string;
  username: string;
  password: string;
  api_url: string;
}

class MagayaSoapAPI {
  private credentials: MagayaCredentials;
  private supabase: any;

  constructor(credentials: MagayaCredentials) {
    this.credentials = credentials;
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  private createSoapEnvelope(soapBody: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${soapBody}
  </soap:Body>
</soap:Envelope>`;
  }

  private async callSoapMethod(soapAction: string, soapBody: string): Promise<any> {
    const soapEnvelope = this.createSoapEnvelope(soapBody);
    
    console.log(`SOAP Request to ${this.credentials.api_url}:`, soapEnvelope);
    
    const response = await fetch(this.credentials.api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': soapAction,
      },
      body: soapEnvelope,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SOAP request failed: ${response.status}`, errorText);
      throw new Error(`SOAP request failed: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('SOAP Response:', responseText);
    
    return this.parseSoapResponse(responseText);
  }

  private parseSoapResponse(xmlText: string): any {
    try {
      // Simple XML parsing for SOAP responses
      // In a production environment, you'd want to use a proper XML parser
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Check for SOAP faults
      const faultNode = xmlDoc.querySelector('soap\\:Fault, Fault');
      if (faultNode) {
        const faultString = faultNode.querySelector('faultstring')?.textContent || 'Unknown SOAP fault';
        throw new Error(`SOAP Fault: ${faultString}`);
      }
      
      // Return the response body
      const bodyNode = xmlDoc.querySelector('soap\\:Body, Body');
      return bodyNode;
    } catch (error) {
      console.error('Error parsing SOAP response:', error);
      throw new Error(`Failed to parse SOAP response: ${error.message}`);
    }
  }

  async authenticateAndGetShipments(supplierName: string): Promise<any[]> {
    const soapBody = `
      <GetShipmentsBySupplier xmlns="http://www.magaya.com/">
        <NetworkID>${this.credentials.network_id}</NetworkID>
        <UserName>${this.credentials.username}</UserName>
        <Password>${this.credentials.password}</Password>
        <SupplierName>${supplierName}</SupplierName>
      </GetShipmentsBySupplier>`;

    try {
      const result = await this.callSoapMethod('http://www.magaya.com/GetShipmentsBySupplier', soapBody);
      return this.parseShipmentsFromXml(result);
    } catch (error) {
      console.error('Error getting shipments from Magaya:', error);
      throw error;
    }
  }

  private parseShipmentsFromXml(xmlNode: any): any[] {
    const shipments: any[] = [];
    
    try {
      // Look for shipment nodes in the XML response
      const shipmentNodes = xmlNode.querySelectorAll('Shipment');
      
      shipmentNodes.forEach((shipmentNode: any) => {
        const shipment = {
          shipment_id: this.getXmlNodeValue(shipmentNode, 'ShipmentID'),
          reference_number: this.getXmlNodeValue(shipmentNode, 'ReferenceNumber'),
          tracking_number: this.getXmlNodeValue(shipmentNode, 'TrackingNumber'),
          description: this.getXmlNodeValue(shipmentNode, 'Description'),
          weight: parseFloat(this.getXmlNodeValue(shipmentNode, 'Weight') || '0'),
          dimensions: this.getXmlNodeValue(shipmentNode, 'Dimensions'),
          declared_value: parseFloat(this.getXmlNodeValue(shipmentNode, 'DeclaredValue') || '0'),
          status: this.getXmlNodeValue(shipmentNode, 'Status'),
          warehouse_location: this.getXmlNodeValue(shipmentNode, 'WarehouseLocation'),
          sender: {
            name: this.getXmlNodeValue(shipmentNode, 'SenderName'),
            address: this.getXmlNodeValue(shipmentNode, 'SenderAddress'),
          },
          consignee: {
            name: this.getXmlNodeValue(shipmentNode, 'ConsigneeName'),
            address: this.getXmlNodeValue(shipmentNode, 'ConsigneeAddress'),
            email: this.getXmlNodeValue(shipmentNode, 'ConsigneeEmail'),
            phone: this.getXmlNodeValue(shipmentNode, 'ConsigneePhone'),
          }
        };
        
        shipments.push(shipment);
      });
      
      console.log(`Parsed ${shipments.length} shipments from XML`);
      return shipments;
    } catch (error) {
      console.error('Error parsing shipments XML:', error);
      return [];
    }
  }

  private getXmlNodeValue(parentNode: any, tagName: string): string {
    const node = parentNode.querySelector(tagName);
    return node?.textContent || '';
  }

  async createShipment(packageData: any): Promise<MagayaShipmentData | null> {
    const soapBody = `
      <CreateShipment xmlns="http://www.magaya.com/">
        <NetworkID>${this.credentials.network_id}</NetworkID>
        <UserName>${this.credentials.username}</UserName>
        <Password>${this.credentials.password}</Password>
        <ReferenceNumber>${packageData.tracking_number}</ReferenceNumber>
        <Description>${packageData.description}</Description>
        <Weight>${packageData.weight || 0}</Weight>
        <Dimensions>${packageData.dimensions || ''}</Dimensions>
        <DeclaredValue>${packageData.package_value || 0}</DeclaredValue>
        <SenderName>${packageData.sender_name || ''}</SenderName>
        <SenderAddress>${packageData.sender_address || ''}</SenderAddress>
        <ConsigneeName>${packageData.customer_name || ''}</ConsigneeName>
        <ConsigneeAddress>${packageData.delivery_address || ''}</ConsigneeAddress>
      </CreateShipment>`;

    try {
      const result = await this.callSoapMethod('http://www.magaya.com/CreateShipment', soapBody);
      return this.parseShipmentFromXml(result);
    } catch (error) {
      console.error('Error creating shipment in Magaya:', error);
      throw error;
    }
  }

  private parseShipmentFromXml(xmlNode: any): MagayaShipmentData {
    return {
      shipment_id: this.getXmlNodeValue(xmlNode, 'ShipmentID'),
      reference_number: this.getXmlNodeValue(xmlNode, 'ReferenceNumber'),
      status: this.getXmlNodeValue(xmlNode, 'Status'),
      warehouse_location: this.getXmlNodeValue(xmlNode, 'WarehouseLocation'),
    };
  }

  async getShipmentInfo(shipmentId: string): Promise<MagayaShipmentData | null> {
    const soapBody = `
      <GetShipmentInfo xmlns="http://www.magaya.com/">
        <NetworkID>${this.credentials.network_id}</NetworkID>
        <UserName>${this.credentials.username}</UserName>
        <Password>${this.credentials.password}</Password>
        <ShipmentID>${shipmentId}</ShipmentID>
      </GetShipmentInfo>`;

    try {
      const result = await this.callSoapMethod('http://www.magaya.com/GetShipmentInfo', soapBody);
      return this.parseShipmentFromXml(result);
    } catch (error) {
      console.error('Error getting shipment info from Magaya:', error);
      throw error;
    }
  }

  async bulkSyncFromSupplier(supplierName: string, sessionId: string): Promise<any> {
    try {
      const shipments = await this.authenticateAndGetShipments(supplierName);
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

    if (!config.credentials) {
      throw new Error('Magaya API credentials not configured');
    }

    const credentials: MagayaCredentials = config.credentials as MagayaCredentials;
    
    // Validate required credentials
    if (!credentials.network_id || !credentials.username || !credentials.password || !credentials.api_url) {
      throw new Error('Incomplete Magaya API credentials. Please configure Network ID, Username, Password, and API URL.');
    }

    const magayaAPI = new MagayaSoapAPI(credentials);

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
        // For now, we'll just update the status in our database since Magaya SOAP API 
        // might not support direct status updates
        result = { message: 'Status update not implemented for SOAP API' };
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
