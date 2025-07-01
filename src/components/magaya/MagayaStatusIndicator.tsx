
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Truck, Warehouse, Sync, AlertCircle } from 'lucide-react';

interface MagayaStatusIndicatorProps {
  magayaShipmentId?: string | null;
  warehouseLocation?: string | null;
  consolidationStatus?: string | null;
  className?: string;
}

export const MagayaStatusIndicator: React.FC<MagayaStatusIndicatorProps> = ({
  magayaShipmentId,
  warehouseLocation,
  consolidationStatus,
  className = '',
}) => {
  const getMagayaStatusConfig = (status: string | null) => {
    switch (status) {
      case 'pending':
        return {
          icon: Sync,
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'in_warehouse':
        return {
          icon: Warehouse,
          label: 'In Warehouse',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'consolidated':
        return {
          icon: Truck,
          label: 'Consolidated',
          color: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'shipped':
        return {
          icon: Truck,
          label: 'Shipped',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Not Synced',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  if (!magayaShipmentId) {
    const { icon: Icon, label, color } = getMagayaStatusConfig(null);
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="outline" className={color}>
          <Icon className="w-3 h-3 mr-1" />
          {label}
        </Badge>
      </div>
    );
  }

  const { icon: Icon, label, color } = getMagayaStatusConfig(consolidationStatus);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Badge variant="outline" className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
      {warehouseLocation && (
        <div className="text-xs text-muted-foreground">
          <Warehouse className="w-3 h-3 inline mr-1" />
          {warehouseLocation}
        </div>
      )}
      <div className="text-xs text-muted-foreground font-mono">
        ID: {magayaShipmentId}
      </div>
    </div>
  );
};
