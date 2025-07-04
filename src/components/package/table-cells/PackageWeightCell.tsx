import React from 'react';
import { TableCell } from '@/components/ui/table';

interface PackageWeightCellProps {
  weight?: number;
  userRole: 'customer' | 'admin' | 'warehouse';
}

const PackageWeightCell: React.FC<PackageWeightCellProps> = ({
  weight,
  userRole,
}) => {
  if (userRole === 'customer') return null;

  return (
    <TableCell>
      {weight ? `${weight} lbs` : 'N/A'}
    </TableCell>
  );
};

export default PackageWeightCell;