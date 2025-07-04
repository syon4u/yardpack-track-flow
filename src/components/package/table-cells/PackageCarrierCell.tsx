import React from 'react';
import { TableCell } from '@/components/ui/table';

interface PackageCarrierCellProps {
  carrier?: string;
  senderName?: string;
  userRole: 'customer' | 'admin' | 'warehouse';
}

const PackageCarrierCell: React.FC<PackageCarrierCellProps> = ({
  carrier,
  senderName,
  userRole,
}) => {
  if (userRole === 'customer') return null;

  return (
    <TableCell>
      <div className="flex flex-col">
        <span>{carrier || 'N/A'}</span>
        {senderName && (
          <span className="text-xs text-muted-foreground">From: {senderName}</span>
        )}
      </div>
    </TableCell>
  );
};

export default PackageCarrierCell;