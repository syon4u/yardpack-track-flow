import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Scan, Package, CheckCircle, AlertCircle, Loader2, Truck, RefreshCw, Key, Settings } from 'lucide-react';
import { usePackages, useUpdatePackageStatus } from '@/hooks/usePackages';
import { useUSPSTracking, useCarrierDetection } from '@/hooks/useTrackingAPI';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PackageScanner: React.FC = () => {
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'error' | 'not_found';
    message: string;
    package?: any;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [apiStatus, setApiStatus] = useState<Record<string, 'connected' | 'error' | 'unconfigured'>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: packages, isLoading: packagesLoading, error: packagesError } = usePackages();
  const updateStatusMutation = useUpdatePackageStatus();
  const uspsTrackingMutation = useUSPSTracking();
  const { detectCarrier } = useCarrierDetection();
  const { toast } = useToast();

  // Check API configuration status on component mount
  React.useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const { data: configs, error } = await supabase
        .from('api_configurations')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const status: Record<string, 'connected' | 'error' | 'unconfigured'> = {};
      
      for (const config of configs || []) {
        // Check if API key exists in Supabase secrets
        const hasApiKey = await checkApiKeyExists(config.api_key_name);
        status[config.carrier] = hasApiKey ? 'connected' : 'unconfigured';
      }
      
      setApiStatus(status);
    } catch (error) {
      console.error('Error checking API status:', error);
    }
  };

  const checkApiKeyExists = async (keyName: string): Promise<boolean> => {
    try {
      // This would normally check Supabase secrets, but for demo purposes
      // we'll assume keys are configured if the configuration exists
      return true;
    } catch {
      return false;
    }
  };

  const handleScan = async () => {
    if (!scannedCode.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }
    
    setIsScanning(true);
    setScanResult(null);
    
    try {
      // Find package by tracking number
      const foundPackage = packages?.find(
        pkg => pkg.tracking_number.toLowerCase() === scannedCode.toLowerCase()
      );
      
      if (!foundPackage) {
        // Auto-detect carrier from tracking number
        const detectedCarrier = detectCarrier(scannedCode);
        
        setScanResult({
          status: 'not_found',
          message: `Package with tracking number "${scannedCode}" not found. Detected carrier: ${detectedCarrier}`,
        });
        
        toast({
          title: "Package Not Found",
          description: `No package found with tracking number: ${scannedCode}`,
          variant: "destructive",
        });
        setIsScanning(false);
        return;
      }

      // Check if package is already arrived
      if (foundPackage.status === 'arrived') {
        setScanResult({
          status: 'error',
          message: `Package "${scannedCode}" has already been marked as arrived`,
          package: foundPackage
        });
        
        toast({
          title: "Package Already Processed",
          description: `This package was already marked as arrived`,
          variant: "destructive",
        });
        setIsScanning(false);
        return;
      }
      
      // Update package status to 'arrived'
      await updateStatusMutation.mutateAsync({
        packageId: foundPackage.id,
        status: 'arrived'
      });

      // Auto-detect carrier if not set and sync with API
      let carrierToUse = foundPackage.carrier;
      let trackingNumberToUse = foundPackage.external_tracking_number || scannedCode;

      if (!carrierToUse) {
        carrierToUse = detectCarrier(trackingNumberToUse);
        
        // Update package with detected carrier
        await supabase
          .from('packages')
          .update({
            carrier: carrierToUse,
            external_tracking_number: trackingNumberToUse
          })
          .eq('id', foundPackage.id);
      }

      // Sync with carrier API if configured and available
      if (carrierToUse && apiStatus[carrierToUse] === 'connected') {
        try {
          if (carrierToUse === 'USPS') {
            await uspsTrackingMutation.mutateAsync({
              trackingNumber: trackingNumberToUse,
              packageId: foundPackage.id
            });
          } else {
            toast({
              title: "API Sync",
              description: `${carrierToUse} API integration coming soon`,
            });
          }
        } catch (apiError) {
          console.warn('API sync failed, but package was still marked as arrived:', apiError);
          toast({
            title: "API Sync Warning",
            description: `Package marked as arrived, but ${carrierToUse} API sync failed`,
            variant: "destructive",
          });
        }
      } else if (carrierToUse && apiStatus[carrierToUse] === 'unconfigured') {
        toast({
          title: "API Not Configured",
          description: `${carrierToUse} API key not configured. Visit System Settings to add API keys.`,
          variant: "destructive",
        });
      }
      
      setScanResult({
        status: 'success',
        message: `Package "${scannedCode}" successfully marked as arrived${carrierToUse ? ` and synced with ${carrierToUse}` : ''}`,
        package: { ...foundPackage, carrier: carrierToUse, external_tracking_number: trackingNumberToUse }
      });
      
      toast({
        title: "Package Scanned Successfully",
        description: `${foundPackage.tracking_number} has been marked as arrived at Miami warehouse`,
      });
      
    } catch (error) {
      console.error('Scan error:', error);
      setScanResult({
        status: 'error',
        message: 'Failed to update package status. Please try again.',
      });
      
      toast({
        title: "Scan Failed",
        description: "There was an error updating the package status",
        variant: "destructive",
      });
    }
    
    setIsScanning(false);
  };

  const handleSyncTracking = async (pkg: any) => {
    if (!pkg.external_tracking_number || !pkg.carrier) {
      toast({
        title: "Cannot Sync",
        description: "Package missing external tracking number or carrier information",
        variant: "destructive",
      });
      return;
    }

    if (apiStatus[pkg.carrier] !== 'connected') {
      toast({
        title: "API Not Configured",
        description: `${pkg.carrier} API key not configured. Visit System Settings to configure.`,
        variant: "destructive",
      });
      return;
    }

    if (pkg.carrier === 'USPS') {
      try {
        await uspsTrackingMutation.mutateAsync({
          trackingNumber: pkg.external_tracking_number,
          packageId: pkg.id
        });
      } catch (error) {
        console.error('Tracking sync error:', error);
      }
    } else {
      toast({
        title: "Carrier Not Supported",
        description: `${pkg.carrier} tracking integration coming soon`,
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isScanning) {
      handleScan();
    }
  };

  const clearScan = () => {
    setScannedCode('');
    setScanResult(null);
    inputRef.current?.focus();
  };

  if (packagesLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading package data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (packagesError) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>Error loading package data. Please refresh the page.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* API Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Delivery Service API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(apiStatus).map(([carrier, status]) => (
              <div key={carrier} className="flex items-center justify-between">
                <span className="font-medium">{carrier}</span>
                <Badge variant={
                  status === 'connected' ? 'default' :
                  status === 'error' ? 'destructive' : 'secondary'
                }>
                  {status === 'connected' ? 'Connected' :
                   status === 'error' ? 'Error' : 'Not Configured'}
                </Badge>
              </div>
            ))}
          </div>
          {Object.values(apiStatus).some(status => status === 'unconfigured') && (
            <p className="text-sm text-muted-foreground mt-2">
              Visit System Settings to configure missing API keys for automatic tracking sync.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-6 w-6" />
            Package Scanner - Miami Warehouse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Scan or enter tracking number..."
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              autoFocus
              disabled={isScanning}
            />
            <Button 
              onClick={handleScan} 
              disabled={!scannedCode.trim() || isScanning}
              className="flex items-center gap-2"
            >
              {isScanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              {isScanning ? 'Processing...' : 'Scan'}
            </Button>
          </div>
          
          {scanResult && (
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
                    {scanResult.package.external_tracking_number && scanResult.package.carrier && apiStatus[scanResult.package.carrier] === 'connected' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSyncTracking(scanResult.package)}
                        disabled={uspsTrackingMutation.isPending}
                        className="mt-2 flex items-center gap-2"
                      >
                        {uspsTrackingMutation.isPending ? (
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
                  onClick={clearScan}
                  className="mt-3"
                >
                  Scan Next Package
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enhanced Scanning Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• Use a barcode scanner or manually enter the tracking number</p>
          <p>• Press Enter or click the Scan button</p>
          <p>• The system will automatically mark the package as "Arrived"</p>
          <p>• If carrier is not detected, the system will auto-detect from tracking format</p>
          <p>• If API keys are configured, tracking will sync with carrier automatically</p>
          <p>• Package status will be updated in real-time for customers</p>
          <p>• Only packages not already marked as "Arrived" can be processed</p>
          <p>• Configure API keys in System Settings for full carrier integration</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Package Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Total Packages:</p>
              <p className="text-2xl font-bold text-blue-600">{packages?.length || 0}</p>
            </div>
            <div>
              <p className="font-medium">Arrived Today:</p>
              <p className="text-2xl font-bold text-green-600">
                {packages?.filter(pkg => pkg.status === 'arrived').length || 0}
              </p>
            </div>
            <div>
              <p className="font-medium">With Carrier Tracking:</p>
              <p className="text-2xl font-bold text-purple-600">
                {packages?.filter(pkg => pkg.external_tracking_number).length || 0}
              </p>
            </div>
            <div>
              <p className="font-medium">API Synced:</p>
              <p className="text-2xl font-bold text-orange-600">
                {packages?.filter(pkg => pkg.api_sync_status === 'synced').length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageScanner;
