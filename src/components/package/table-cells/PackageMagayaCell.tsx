import React from 'react';
import { TableCell } from '@/components/ui/table';
import { MagayaStatusIndicator } from '../../magaya/MagayaStatusIndicator';
import { MagayaSyncButton } from '../../magaya/MagayaSyncButton';

interface PackageMagayaCellProps {
  packageId: string;
  magayaShipmentId?: string | null;
  warehouseLocation?: string | null;
  consolidationStatus?: string | null;
  userRole: 'customer' | 'admin' | 'warehouse';
}

const PackageMagayaCell: React.FC<PackageMagayaCellProps> = ({
  packageId,
  magayaShipmentId,
  warehouseLocation,
  consolidationStatus,
  userRole,
}) => {
  if (userRole === 'customer') return null;

  return (
    <TableCell>
      <div className="flex items-center gap-2">
        <MagayaStatusIndicator
          magayaShipmentId={magayaShipmentId}
          warehouseLocation={warehouseLocation}
          consolidationStatus={consolidationStatus}
        />
        <MagayaSyncButton
          packageId={packageId}
          magayaShipmentId={magayaShipmentId}
          size="sm"
          variant="ghost"
          showLabel={false}
        />
      </div>
    </TableCell>
  );
};

export default PackageMagayaCell;