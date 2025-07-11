
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import PackageList from '../PackageList';
import CreatePackageForm from '../CreatePackageForm';
import AdminDashboardHeader from '../admin/AdminDashboardHeader';
import AdminDashboardStats from '../admin/AdminDashboardStats';
import AdminPackageFilters from '../admin/AdminPackageFilters';
import CustomerPackagesTab from '../customer/CustomerPackagesTab';
import MagayaBulkSyncModal from '../magaya/MagayaBulkSyncModal';

const PackageManagement: React.FC = () => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [showMagayaSync, setShowMagayaSync] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get filters from URL params
  const customerFilter = searchParams.get('customer') || undefined;
  const urlStatus = searchParams.get('status');
  const urlSearch = searchParams.get('search');

  // Set filters from URL params on mount
  useEffect(() => {
    if (urlStatus && urlStatus !== 'all') {
      setStatusFilter(urlStatus);
    }
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [urlStatus, urlSearch]);

  // Admin view with full package management features
  if (profile?.role === 'admin') {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
          <p className="text-gray-600 mt-1">Manage all packages in the system</p>
          {customerFilter && (
            <p className="text-sm text-blue-600 mt-1">
              Filtered by customer ID: {customerFilter}
            </p>
          )}
        </div>

        <AdminDashboardHeader 
          onCreatePackage={() => setShowCreatePackage(true)}
          onMagayaSync={() => setShowMagayaSync(true)}
        />

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
            customerFilter={customerFilter}
            viewMode="table"
            onViewModeChange={() => {}} // Admin always uses table view
          />
        </div>

        {showCreatePackage && (
          <CreatePackageForm onClose={() => setShowCreatePackage(false)} />
        )}

        {showMagayaSync && (
          <MagayaBulkSyncModal 
            open={showMagayaSync}
            onClose={() => setShowMagayaSync(false)}
          />
        )}
      </div>
    );
  }

  // Customer view with their packages
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Packages</h1>
        <p className="text-gray-600 mt-1">View and track your packages</p>
      </div>
      <CustomerPackagesTab />
    </div>
  );
};

export default PackageManagement;
