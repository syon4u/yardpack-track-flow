
import React from 'react';
import CustomerInvoicesTab from '../customer/CustomerInvoicesTab';

const InvoiceManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
        <p className="text-gray-600 mt-1">View and manage your invoices</p>
      </div>
      <CustomerInvoicesTab />
    </div>
  );
};

export default InvoiceManagement;
