
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Truck, Key, RefreshCw, Loader2 } from 'lucide-react';

interface ScanResultProps {
  scanResult: {
    status: 'success' | 'error' | 'not_found';
    message: string;
    package?: any;
  };
  apiStatus: Record<string, 'connected' | 'error' | 'unconfigured'>;
  onClearScan: () => void;
  onSyncTracking: (pkg: any) => void;
  isTrackingSyncing: boolean;
}

const ScanResult: React.FC<ScanResultProps> = ({
  scanResult,
  apiStatus,
  onClearScan,
  onSyncTracking,
  isTrackingSyncing
}) => {
  return (
    <Card className={`${
      scanResult.status === 'success' ? 'border-green-200 bg-green-50' :
      scanResult.status === 'error' ? 'border-red-200 bg-red-50' :
      'border-yellow-200 bg-yellow-50'
    }`}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          {scanResult.status === 'success' && (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
          {scanResult.status === 'error' && (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          {scanResult.status === 'not_found' && (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
          <Badge variant={
            scanResult.status === 'success' ? 'default' :
            scanResult.status === 'error' ? 'destructive' :
            'secondary'
          }>
            {scanResult.status === 'success' ? 'Success' :
             scanResult.status === 'error' ? 'Error' :
             'Not Found'}
          </Badge>
        </div>
        <p className="text-sm text-gray-700 mb-2">{scanResult.message}</p>
        
        {scanResult.package && (
          <div className="text-sm space-y-1">
            <p><strong>Customer:</strong> {scanResult.package.customers?.full_name || 'Unknown'}</p>
            <p><strong>Description:</strong> {scanResult.package.description}</p>
            <div className="flex items-center gap-2">
              <strong>Previous Status:</strong> <Badge variant="outline">{scanResult.package.status}</Badge>
            </div>
            {scanResult.package.carrier && (
              <div className="flex items-center gap-2">
                <strong>Carrier:</strong> 
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  {scanResult.package.carrier}
                </Badge>
                {apiStatus[scanResult.package.carrier] && (
                  <Badge variant={
                    apiStatus[scanResult.package.carrier] === 'connected' ? 'default' : 'destructive'
                  } className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    {apiStatus[scanResult.package.carrier] === 'connected' ? 'API Ready' : 'API Missing'}
                  </Badge>
                )}
              </div>
            )}
            {scanResult.status === 'success' && (
              <div className="flex items-center gap-2">
                <strong>New Status:</strong> <Badge variant="default">Arrived</Badge>
              </div>
            )}
            {scanResult.package.external_tracking_number && 
             scanResult.package.carrier && 
             apiStatus[scanResult.package.carrier] === 'connected' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSyncTracking(scanResult.package)}
                disabled={isTrackingSyncing}
                className="mt-2 flex items-center gap-2"
              >
                {isTrackingSyncing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Sync Carrier Tracking
              </Button>
            )}
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearScan}
          className="mt-3"
        >
          Scan Next Package
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScanResult;
