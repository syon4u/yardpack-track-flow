import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database } from '@/integrations/supabase/types';
import PackageStatusBadge from '../PackageStatusBadge';

type PackageStatus = Database['public']['Enums']['package_status'];

interface PackageStatusCellProps {
  status: PackageStatus;
  userRole: 'customer' | 'admin' | 'warehouse';
  packageId: string;
  onStatusUpdate?: (packageId: string, status: PackageStatus) => void;
}

const PackageStatusCell: React.FC<PackageStatusCellProps> = ({
  status,
  userRole,
  packageId,
  onStatusUpdate,
}) => {
  return (
    <TableCell>
      {userRole === 'admin' && onStatusUpdate ? (
        <Select
          value={status}
          onValueChange={(value) => onStatusUpdate(packageId, value as PackageStatus)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="received">Received at Miami</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="arrived">Arrived in Jamaica</SelectItem>
            <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
            <SelectItem value="picked_up">Picked Up</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <PackageStatusBadge status={status} />
      )}
    </TableCell>
  );
};

export default PackageStatusCell;