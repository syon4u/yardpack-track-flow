import React from 'react';
import { TableCell } from '@/components/ui/table';

interface PackageDutyCellProps {
  dutyAmount?: number;
  userRole: 'customer' | 'admin' | 'warehouse';
}

const PackageDutyCell: React.FC<PackageDutyCellProps> = ({
  dutyAmount,
  userRole,
}) => {
  if (userRole === 'customer') return null;

  return (
    <TableCell>
      {dutyAmount ? `$${dutyAmount.toFixed(2)}` : 'N/A'}
    </TableCell>
  );
};

export default PackageDutyCell;