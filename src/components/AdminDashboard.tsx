
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PackageList from './PackageList';
import CreatePackageForm from './CreatePackageForm';
import AdminDashboardHeader from './admin/AdminDashboardHeader';
import AdminDashboardStats from './admin/AdminDashboardStats';
import AdminPackageFilters from './admin/AdminPackageFilters';
import AdminDashboardTester from './admin/AdminDashboardTester';
import CustomerRLSTest from './admin/CustomerRLSTest';
import ServiceRoleRLSTest from './admin/ServiceRoleRLSTest';

const AdminDashboard: React.FC = () => {
  const { profile, isLoading } = useAuth();
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTester, setShowTester] = useState(false);
  const [showRLSTest, setShowRLSTest] = useState(false);
  const [showServiceRoleTest, setShowServiceRoleTest] = useState(false);

  // Show loading while auth is still being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Only check for admin access after loading is complete and we have a profile result
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-gray-600">Admin privileges required to access this dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminDashboardHeader onCreatePackage={() => setShowCreatePackage(true)} />

      <AdminDashboardStats />

      {/* Add test suite toggles */}
      <div className="flex justify-end gap-4 text-sm">
        <button
          onClick={() => setShowServiceRoleTest(!showServiceRoleTest)}
          className="text-orange-600 hover:text-orange-800 underline"
        >
          {showServiceRoleTest ? 'Hide' : 'Show'} Service Role Tests
        </button>
        <button
          onClick={() => setShowRLSTest(!showRLSTest)}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {showRLSTest ? 'Hide' : 'Show'} Customer RLS Tests
        </button>
        <button
          onClick={() => setShowTester(!showTester)}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {showTester ? 'Hide' : 'Show'} Performance Tests
        </button>
      </div>

      {showServiceRoleTest && <ServiceRoleRLSTest />}
      {showRLSTest && <CustomerRLSTest />}
      {showTester && <AdminDashboardTester />}

      <div className="space-y-4 sm:space-y-6">
        <AdminPackageFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <PackageList searchTerm={searchTerm} statusFilter={statusFilter} />
      </div>

      {showCreatePackage && (
        <CreatePackageForm onClose={() => setShowCreatePackage(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;
