
import React from 'react';
import AdminSettingsTab from '../admin/AdminSettingsTab';

const SystemSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure system-wide settings</p>
      </div>
      <AdminSettingsTab />
    </div>
  );
};

export default SystemSettings;
