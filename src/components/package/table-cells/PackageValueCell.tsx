import React from 'react';
import { TableCell } from '@/components/ui/table';

interface PackageValueCellProps {
  packageValue?: number;
  userRole: 'customer' | 'admin' | 'warehouse';
}

const PackageValueCell: React.FC<PackageValueCellProps> = ({
  packageValue,
  userRole,
}) => {
  if (userRole === 'customer') return null;

  return (
    <TableCell>
      {packageValue ? `$${packageValue.toFixed(2)}` : 'N/A'}
    </TableCell>
  );
};

export default PackageValueCell;