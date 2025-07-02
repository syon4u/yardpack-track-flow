import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/integrations/supabase/types';

type PackageStatus = Database['public']['Enums']['package_status'];

interface PackageStatusBadgeProps {
  status: PackageStatus;
}

const getStatusColor = (status: PackageStatus) => {
  switch (status) {
    case 'received':
      return 'bg-blue-100 text-blue-800';
    case 'in_transit':
      return 'bg-yellow-100 text-yellow-800';
    case 'arrived':
      return 'bg-green-100 text-green-800';
    case 'ready_for_pickup':
      return 'bg-purple-100 text-purple-800';
    case 'picked_up':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: PackageStatus) => {
  switch (status) {
    case 'received':
      return 'Received';
    case 'in_transit':
      return 'In Transit';
    case 'arrived':
      return 'Arrived';
    case 'ready_for_pickup':
      return 'Ready for Pickup';
    case 'picked_up':
      return 'Picked Up';
    default:
      return 'Unknown';
  }
};

const PackageStatusBadge: React.FC<PackageStatusBadgeProps> = ({ status }) => {
  return (
    <Badge className={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
};

export default PackageStatusBadge;