import React from 'react';
import { TableCell } from '@/components/ui/table';

interface PackageTotalDueCellProps {
  totalDue?: number;
}

const PackageTotalDueCell: React.FC<PackageTotalDueCellProps> = ({ totalDue }) => {
  return (
    <TableCell>
      {totalDue ? `$${totalDue.toFixed(2)}` : 'N/A'}
    </TableCell>
  );
};

export default PackageTotalDueCell;