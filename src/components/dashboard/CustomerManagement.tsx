
import React from 'react';
import AdminCustomerManagement from '../AdminCustomerManagement';

const CustomerManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-1">Manage customer accounts and profiles</p>
      </div>
      <AdminCustomerManagement />
    </div>
  );
};

export default CustomerManagement;
