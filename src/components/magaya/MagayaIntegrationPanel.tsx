
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MagayaStatusIndicator } from './MagayaStatusIndicator';
import { MagayaSyncButton } from './MagayaSyncButton';
import { useMagayaIntegration } from '@/hooks/useMagayaIntegration';
import MagayaAutoSyncSettings from './MagayaAutoSyncSettings';
import { ExternalLink, RefreshCw, Truck, Settings } from 'lucide-react';

interface MagayaIntegrationPanelProps {
  packageData: {
    id: string;
    tracking_number: string;
    magaya_shipment_id?: string | null;
    magaya_reference_number?: string | null;
    warehouse_location?: string | null;
    consolidation_status?: string | null;
    weight?: number | null;
    dimensions?: string | null;
    package_value?: number | null;
    sender_name?: string | null;
    sender_address?: string | null;
    delivery_address: string;
    description: string;
  };
}

export const MagayaIntegrationPanel: React.FC<MagayaIntegrationPanelProps> = ({
  packageData,
}) => {
  const { createShipment, updateStatus, getShipmentInfo, isLoading } = useMagayaIntegration();

  const handleCreateShipment = () => {
    createShipment({
      packageId: packageData.id,
      packageData: {
        tracking_number: packageData.tracking_number,
        description: packageData.description,
        weight: packageData.weight,
        dimensions: packageData.dimensions,
        package_value: packageData.package_value,
        sender_name: packageData.sender_name,
        sender_address: packageData.sender_address,
        delivery_address: packageData.delivery_address,
        customer_name: packageData.sender_name || 'Unknown',
      },
    });
  };

  const handleRefreshInfo = () => {
    if (packageData.magaya_shipment_id) {
      getShipmentInfo({
        packageId: packageData.id,
        shipmentId: packageData.magaya_shipment_id,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="package" className="w-full">
        <TabsList>
          <TabsTrigger value="package" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Package Sync
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Auto-Sync Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="package">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Magaya Integration
              </CardTitle>
              <CardDescription>
                Manage warehouse and shipping operations through Magaya
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sync Status:</span>
                  <MagayaStatusIndicator
                    magayaShipmentId={packageData.magaya_shipment_id}
                    warehouseLocation={packageData.warehouse_location}
                    consolidationStatus={packageData.consolidation_status}
                  />
                </div>
                <MagayaSyncButton
                  packageId={packageData.id}
                  magayaShipmentId={packageData.magaya_shipment_id}
                  showLabel={false}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Shipment ID:</span>
                  <div className="text-muted-foreground font-mono">
                    {packageData.magaya_shipment_id || 'Not synced'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Reference:</span>
                  <div className="text-muted-foreground font-mono">
                    {packageData.magaya_reference_number || 'Not assigned'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Warehouse:</span>
                  <div className="text-muted-foreground">
                    {packageData.warehouse_location || 'Not assigned'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Consolidation:</span>
                  <div className="text-muted-foreground">
                    {packageData.consolidation_status || 'Pending'}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                {!packageData.magaya_shipment_id ? (
                  <Button
                    onClick={handleCreateShipment}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    Create Shipment
                  </Button>
                ) : (
                  <Button
                    onClick={handleRefreshInfo}
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Info
                  </Button>
                )}
                
                {packageData.magaya_shipment_id && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => {
                      // Open Magaya portal or external link
                      const magayaUrl = `https://portal.magaya.com/shipment/${packageData.magaya_shipment_id}`;
                      window.open(magayaUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View in Magaya
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <MagayaAutoSyncSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
