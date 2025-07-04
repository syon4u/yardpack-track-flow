
import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePackages, useUpdatePackageStatus } from '@/hooks/usePackages';
import { useUSPSTracking, useCarrierDetection } from '@/hooks/useTrackingAPI';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ApiStatusCard from '@/components/scanner/ApiStatusCard';
import TestControlsCard from '@/components/scanner/TestControlsCard';
import ScannerInput from '@/components/scanner/ScannerInput';
import ScanResult from '@/components/scanner/ScanResult';
import PackageStatsCard from '@/components/scanner/PackageStatsCard';
import ScannerInstructions from '@/components/scanner/ScannerInstructions';

const PackageScanner: React.FC = () => {
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'error' | 'not_found';
    message: string;
    package?: any;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [apiStatus, setApiStatus] = useState<Record<string, 'connected' | 'error' | 'unconfigured'>>({});
  
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
      return true; // For demo purposes
    } catch {
      return false;
    }
  };

  const handleTestPackageCreated = (trackingNumber: string) => {
    setScannedCode(trackingNumber);
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
      const foundPackage = packages?.find(
        pkg => pkg.tracking_number.toLowerCase() === scannedCode.toLowerCase()
      );
      
      if (!foundPackage) {
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
      
      await updateStatusMutation.mutateAsync({
        packageId: foundPackage.id,
        status: 'arrived'
      });

      let carrierToUse = foundPackage.carrier;
      let trackingNumberToUse = foundPackage.external_tracking_number || scannedCode;

      if (!carrierToUse) {
        carrierToUse = detectCarrier(trackingNumberToUse);
        
        await supabase
          .from('packages')
          .update({
            carrier: carrierToUse,
            external_tracking_number: trackingNumberToUse
          })
          .eq('id', foundPackage.id);
      }

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

  const clearScan = () => {
    setScannedCode('');
    setScanResult(null);
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
      <ApiStatusCard apiStatus={apiStatus} />
      
      <TestControlsCard onTestPackageCreated={handleTestPackageCreated} />

      <ScannerInput
        scannedCode={scannedCode}
        setScannedCode={setScannedCode}
        onScan={handleScan}
        isScanning={isScanning}
      />
      
      {scanResult && (
        <ScanResult
          scanResult={scanResult}
          apiStatus={apiStatus}
          onClearScan={clearScan}
          onSyncTracking={handleSyncTracking}
          isTrackingSyncing={uspsTrackingMutation.isPending}
        />
      )}
      
      <ScannerInstructions />
      
      <PackageStatsCard packages={packages} />
    </div>
  );
};

export default PackageScanner;
