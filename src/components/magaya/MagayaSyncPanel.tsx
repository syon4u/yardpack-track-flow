import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMagayaIntegration } from '@/hooks/useMagayaIntegration';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type PackageRow = Database['public']['Tables']['packages']['Row'];

interface MagayaSyncPanelProps {
  packageData?: PackageRow;
  className?: string;
}

const MagayaSyncPanel: React.FC<MagayaSyncPanelProps> = ({ packageData, className }) => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const { syncPackage } = useMagayaIntegration();

  const handleSyncPackage = async () => {
    if (!packageData) return;
    
    setSyncing(true);
    try {
      syncPackage(packageData.id);
      toast({
        title: "Sync Successful",
        description: `Package ${packageData.tracking_number} synced with Magaya`,
      });
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync with Magaya",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      // For now, just show a message since syncAllPackages doesn't exist yet
      toast({
        title: "Bulk Sync",
        description: "Bulk sync feature coming soon",
      });
    } catch (error: any) {
      toast({
        title: "Bulk Sync Failed",
        description: error.message || "Failed to sync packages with Magaya",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getSyncStatus = () => {
    if (!packageData) return 'unknown';
    
    if (packageData.magaya_shipment_id && packageData.magaya_reference_number) {
      return 'synced';
    } else if (packageData.api_sync_status === 'pending') {
      return 'pending';
    } else if (packageData.api_sync_status === 'failed') {
      return 'failed';
    }
    return 'not_synced';
  };

  const getSyncStatusBadge = () => {
    const status = getSyncStatus();
    
    switch (status) {
      case 'synced':
        return <Badge variant="secondary" className="text-green-700 bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Synced</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="text-yellow-700 bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline"><RefreshCw className="w-3 h-3 mr-1" />Not Synced</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Magaya Integration
          </div>
          {packageData && getSyncStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {packageData ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Magaya Shipment ID</p>
                <p className="font-medium">{packageData.magaya_shipment_id || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-gray-500">Reference Number</p>
                <p className="font-medium">{packageData.magaya_reference_number || 'Not assigned'}</p>
              </div>
            </div>
            
            {packageData.last_api_sync && (
              <div className="text-sm">
                <p className="text-gray-500">Last Sync</p>
                <p className="font-medium">{new Date(packageData.last_api_sync).toLocaleString()}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSyncPackage}
                disabled={syncing}
                className="flex-1"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Package
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Sync all packages with Magaya Cargo System
            </p>
            <Button
              onClick={handleSyncAll}
              disabled={syncing}
              className="w-full"
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing All Packages...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync All Packages
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MagayaSyncPanel;