import React from 'react';
import { TableCell } from '@/components/ui/table';

interface PackageCustomerCellProps {
  customerName?: string;
  customerEmail?: string;
}

const PackageCustomerCell: React.FC<PackageCustomerCellProps> = ({
  customerName,
  customerEmail,
}) => {
  return (
    <TableCell>
      <div className="flex flex-col">
        <span className="font-medium">{customerName}</span>
        {customerEmail && (
          <span className="text-xs text-muted-foreground">{customerEmail}</span>
        )}
      </div>
    </TableCell>
  );
};

export default PackageCustomerCell;