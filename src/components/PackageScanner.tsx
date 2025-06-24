
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Scan, Package, CheckCircle, AlertCircle, Loader2, Truck, RefreshCw } from 'lucide-react';
import { usePackages, useUpdatePackageStatus } from '@/hooks/usePackages';
import { useUSPSTracking } from '@/hooks/useTrackingAPI';
import { useToast } from '@/hooks/use-toast';

const PackageScanner: React.FC = () => {
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'error' | 'not_found';
    message: string;
    package?: any;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: packages, isLoading: packagesLoading, error: packagesError } = usePackages();
  const updateStatusMutation = useUpdatePackageStatus();
  const uspsTrackingMutation = useUSPSTracking();
  const { toast } = useToast();

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
        setScanResult({
          status: 'not_found',
          message: `Package with tracking number "${scannedCode}" not found`,
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

      // If package has external tracking and carrier, sync with carrier API
      if (foundPackage.external_tracking_number && foundPackage.carrier === 'USPS') {
        try {
          await uspsTrackingMutation.mutateAsync({
            trackingNumber: foundPackage.external_tracking_number,
            packageId: foundPackage.id
          });
        } catch (apiError) {
          console.warn('API sync failed, but package was still marked as arrived:', apiError);
        }
      }
      
      setScanResult({
        status: 'success',
        message: `Package "${scannedCode}" successfully marked as arrived`,
        package: foundPackage
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
                    <p><strong>Customer:</strong> {scanResult.package.profiles?.full_name || 'Unknown'}</p>
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
                      </div>
                    )}
                    {scanResult.status === 'success' && (
                      <div className="flex items-center gap-2">
                        <strong>New Status:</strong> <Badge variant="default">Arrived</Badge>
                      </div>
                    )}
                    {scanResult.package.external_tracking_number && scanResult.package.carrier === 'USPS' && (
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
          <p>• If the package has carrier tracking, it will sync with the carrier API</p>
          <p>• Package status will be updated in real-time for customers</p>
          <p>• Only packages not already marked as "Arrived" can be processed</p>
          <p>• Supported carriers: USPS (more carriers coming soon)</p>
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
