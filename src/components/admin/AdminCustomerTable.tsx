
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomerMobileCard from './customer-table/CustomerMobileCard';
import CustomerDesktopTable from './customer-table/CustomerDesktopTable';

interface CustomerWithStats {
  id: string;
  customer_number: string;
  customer_type: 'registered' | 'guest' | 'package_only';
  full_name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  created_at: string;
  total_packages: number;
  active_packages: number;
  completed_packages: number;
  total_spent: number;
  outstanding_balance: number;
  last_activity: string | null;
}

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
