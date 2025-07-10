import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PackageTableHeaderProps {
  userRole: 'customer' | 'admin' | 'warehouse';
  isColumnVisible?: (columnId: string) => boolean;
}

const PackageTableHeader: React.FC<PackageTableHeaderProps> = ({ userRole, isColumnVisible }) => {
  // If no column visibility function is provided, show all columns
  const showColumn = (columnId: string) => isColumnVisible ? isColumnVisible(columnId) : true;
  
  return (
    <TableHeader>
      <TableRow>
        {showColumn('tracking') && <TableHead>Tracking Number</TableHead>}
        {showColumn('customer') && <TableHead>Customer</TableHead>}
        {showColumn('description') && <TableHead>Description</TableHead>}
        {showColumn('status') && <TableHead>Status</TableHead>}
        {showColumn('dateReceived') && <TableHead>Date Received</TableHead>}
        {showColumn('estimatedDelivery') && <TableHead>Est. Delivery</TableHead>}
        {userRole !== 'customer' && showColumn('packageValue') && <TableHead>Package Value</TableHead>}
        {userRole !== 'customer' && showColumn('dutyAmount') && <TableHead>Duty Amount</TableHead>}
        {userRole !== 'customer' && showColumn('weight') && <TableHead>Weight</TableHead>}
        {userRole !== 'customer' && showColumn('carrier') && <TableHead>Carrier</TableHead>}
        {userRole !== 'customer' && showColumn('magayaStatus') && <TableHead>Magaya Status</TableHead>}
        {showColumn('totalDue') && <TableHead>Total Due</TableHead>}
        {showColumn('invoice') && <TableHead>Invoice</TableHead>}
        {showColumn('actions') && <TableHead>Actions</TableHead>}
      </TableRow>
    </TableHeader>
  );
};

export default PackageTableHeader;