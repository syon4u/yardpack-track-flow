
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scan, Package, Loader2 } from 'lucide-react';

interface ScannerInputProps {
  scannedCode: string;
  setScannedCode: (code: string) => void;
  onScan: () => void;
  isScanning: boolean;
}

const ScannerInput: React.FC<ScannerInputProps> = ({
  scannedCode,
  setScannedCode,
  onScan,
  isScanning
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isScanning) {
      onScan();
    }
  };

  return (
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
            onClick={onScan} 
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
      </CardContent>
    </Card>
  );
};

export default ScannerInput;
