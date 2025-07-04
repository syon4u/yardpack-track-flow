import React from 'react';
import { TableCell } from '@/components/ui/table';

interface PackageDescriptionCellProps {
  description: string;
  dimensions?: string;
}

const PackageDescriptionCell: React.FC<PackageDescriptionCellProps> = ({
  description,
  dimensions,
}) => {
  return (
    <TableCell className="max-w-xs">
      <div className="flex flex-col">
        <span className="truncate">{description}</span>
        {dimensions && (
          <span className="text-xs text-muted-foreground">{dimensions}</span>
        )}
      </div>
    </TableCell>
  );
};

export default PackageDescriptionCell;