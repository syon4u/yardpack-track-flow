import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface PackageInvoiceStatusCellProps {
  invoices?: any[];
}

const PackageInvoiceStatusCell: React.FC<PackageInvoiceStatusCellProps> = ({ invoices }) => {
  return (
    <TableCell>
      {invoices && invoices.length > 0 ? (
        <Badge variant="outline" className="text-green-600 border-green-300">
          Uploaded
        </Badge>
      ) : (
        <Badge variant="outline" className="text-orange-600 border-orange-300">
          Pending
        </Badge>
      )}
    </TableCell>
  );
};

export default PackageInvoiceStatusCell;