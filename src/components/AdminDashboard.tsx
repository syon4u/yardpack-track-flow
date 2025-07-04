
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFilters } from '@/hooks/useFilters';
import PackageList from './PackageList';
import CreatePackageForm from './CreatePackageForm';
import AdminDashboardHeader from './admin/AdminDashboardHeader';
import AdminDashboardStats from './admin/AdminDashboardStats';
import AdminPackageFilters from './admin/AdminPackageFilters';

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } = useFilters();

  if (profile?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminDashboardHeader onCreatePackage={() => setShowCreatePackage(true)} />

      <AdminDashboardStats />

      <div className="space-y-4 sm:space-y-6">
        <AdminPackageFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <PackageList 
          searchTerm={searchTerm} 
          statusFilter={statusFilter} 
          viewMode="table"
          onViewModeChange={() => {}} // Admin always uses table view
        />
      </div>

      {showCreatePackage && (
        <CreatePackageForm onClose={() => setShowCreatePackage(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;
