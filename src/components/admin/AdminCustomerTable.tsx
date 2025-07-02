
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomerMobileCard from './customer-table/CustomerMobileCard';
import CustomerDesktopTable from './customer-table/CustomerDesktopTable';
import { CustomerWithStats } from '@/types/customer';

interface AdminCustomerTableProps {
  customers: CustomerWithStats[];
}

const AdminCustomerTable: React.FC<AdminCustomerTableProps> = ({ customers }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Directory</h3>
        {customers?.map((customer) => (
          <CustomerMobileCard key={customer.id} customer={customer} />
        ))}
      </div>
    );
  }

  return <CustomerDesktopTable customers={customers} />;
};

export default AdminCustomerTable;
