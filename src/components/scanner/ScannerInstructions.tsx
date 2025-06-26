
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ScannerInstructions: React.FC = () => {
  return (
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
        <p>• Use the test tools above to create sample packages for testing</p>
      </CardContent>
    </Card>
  );
};

export default ScannerInstructions;
