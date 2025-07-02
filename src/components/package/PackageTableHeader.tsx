import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PackageTableHeaderProps {
  userRole: 'customer' | 'admin' | 'warehouse';
}

const PackageTableHeader: React.FC<PackageTableHeaderProps> = ({ userRole }) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Tracking Number</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Date Received</TableHead>
        <TableHead>Est. Delivery</TableHead>
        {userRole !== 'customer' && <TableHead>Package Value</TableHead>}
        {userRole !== 'customer' && <TableHead>Duty Amount</TableHead>}
        {userRole !== 'customer' && <TableHead>Weight</TableHead>}
        {userRole !== 'customer' && <TableHead>Carrier</TableHead>}
        {userRole !== 'customer' && <TableHead>Magaya Status</TableHead>}
        <TableHead>Total Due</TableHead>
        <TableHead>Invoice</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default PackageTableHeader;