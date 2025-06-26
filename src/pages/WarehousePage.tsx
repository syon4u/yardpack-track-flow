
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PackageScanner from '@/components/PackageScanner';

const WarehousePage: React.FC = () => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (profile?.role !== 'admin' && profile?.role !== 'warehouse') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only warehouse staff and admins can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Miami Warehouse</h1>
          <p className="text-gray-600">Scan packages as they arrive at the facility</p>
          <p className="text-sm text-gray-500 mt-1">
            Automatic carrier detection and API synchronization enabled
          </p>
        </div>
        
        <PackageScanner />
      </div>
    </div>
  );
};

export default WarehousePage;
