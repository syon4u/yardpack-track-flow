
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import AdminCustomerManagement from '../AdminCustomerManagement';
import CreateCustomerForm from '../admin/CreateCustomerForm';

const CustomerManagement: React.FC = () => {
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage package recipients and customer accounts</p>
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Customers:</strong> These are people who receive packages through YardPack.
              For managing system operators, use the <span className="font-medium">System Users</span> section.
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setShowCreateCustomer(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Create Customer
        </Button>
      </div>
      
      <AdminCustomerManagement />
      
      {showCreateCustomer && (
        <CreateCustomerForm onClose={() => setShowCreateCustomer(false)} />
      )}
    </div>
  );
};

export default CustomerManagement;
