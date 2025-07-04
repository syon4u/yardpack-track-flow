import React from 'react';
import { TableCell } from '@/components/ui/table';
import { format } from 'date-fns';

interface PackageDatesCellProps {
  dateReceived: string;
  estimatedDelivery?: string;
}

export const PackageDateReceivedCell: React.FC<{ dateReceived: string }> = ({ dateReceived }) => {
  return (
    <TableCell>
      {dateReceived ? new Date(dateReceived).toLocaleDateString() : 'N/A'}
    </TableCell>
  );
};

export const PackageEstimatedDeliveryCell: React.FC<{ estimatedDelivery?: string }> = ({ estimatedDelivery }) => {
  return (
    <TableCell>
      {estimatedDelivery ? format(new Date(estimatedDelivery), 'yyyy-MM-dd') : 'N/A'}
    </TableCell>
  );
};