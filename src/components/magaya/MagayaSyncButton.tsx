
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useMagayaIntegration } from '@/hooks/useMagayaIntegration';

interface MagayaSyncButtonProps {
  packageId: string;
  magayaShipmentId?: string | null;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
}

export const MagayaSyncButton: React.FC<MagayaSyncButtonProps> = ({
  packageId,
  magayaShipmentId,
  size = 'sm',
  variant = 'outline',
  showLabel = true,
}) => {
  const { syncPackage, isLoading } = useMagayaIntegration();

  const handleSync = () => {
    syncPackage(packageId);
  };

  const buttonText = magayaShipmentId ? 'Refresh' : 'Sync with Magaya';
  const buttonIcon = isLoading ? Loader2 : RefreshCw;

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant={variant}
      size={size}
      className="flex items-center gap-2"
    >
      {React.createElement(buttonIcon, {
        className: `w-4 h-4 ${isLoading ? 'animate-spin' : ''}`,
      })}
      {showLabel && buttonText}
    </Button>
  );
};
