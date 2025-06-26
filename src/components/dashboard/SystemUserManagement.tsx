
import React from 'react';
import AdminUserManagement from '../AdminUserManagement';

const SystemUserManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System User Management</h1>
        <p className="text-gray-600 mt-1">
          Manage admin, warehouse, and customer service user accounts
        </p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>System Users:</strong> These are staff members and employees who operate the YardPack system.
            For managing package recipients, use the <span className="font-medium">Customer Management</span> section.
          </p>
        </div>
      </div>
      
      <AdminUserManagement />
    </div>
  );
};

export default SystemUserManagement;
