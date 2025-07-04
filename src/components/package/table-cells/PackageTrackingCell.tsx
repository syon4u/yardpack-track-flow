import React from 'react';
import { TableCell } from '@/components/ui/table';

interface PackageTrackingCellProps {
  trackingNumber: string;
  externalTrackingNumber?: string;
}

const PackageTrackingCell: React.FC<PackageTrackingCellProps> = ({
  trackingNumber,
  externalTrackingNumber,
}) => {
  return (
    <TableCell className="font-medium">
      <div className="flex flex-col">
        <span className="font-mono text-sm">{trackingNumber}</span>
        {externalTrackingNumber && (
          <span className="text-xs text-muted-foreground">
            Ext: {externalTrackingNumber}
          </span>
        )}
      </div>
    </TableCell>
  );
};

export default PackageTrackingCell;