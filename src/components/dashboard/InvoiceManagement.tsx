
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CustomerInvoicesTab from '../customer/CustomerInvoicesTab';
import AdminInvoiceManagement from '../admin/AdminInvoiceManagement';

const InvoiceManagement: React.FC = () => {
  const { profile } = useAuth();

  if (profile?.role === 'admin') {
    return <AdminInvoiceManagement />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoice Management</h1>
        <p className="text-muted-foreground mt-1">View and manage your invoices</p>
      </div>
      <CustomerInvoicesTab />
    </div>
  );
};

export default InvoiceManagement;
