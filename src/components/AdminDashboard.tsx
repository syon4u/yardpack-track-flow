
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import PackageList from './PackageList';
import CreatePackageForm from './CreatePackageForm';
import AdminUserManagement from './AdminUserManagement';
import AdminCustomerManagement from './AdminCustomerManagement';
import AdminAnalytics from './AdminAnalytics';
import AdminDashboardHeader from './admin/AdminDashboardHeader';
import AdminDashboardStats from './admin/AdminDashboardStats';
import AdminPackageFilters from './admin/AdminPackageFilters';
import AdminSettingsTab from './admin/AdminSettingsTab';

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('packages');
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const isMobile = useIsMobile();

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        {/* Mobile: Horizontal scrolling tabs */}
        {isMobile ? (
          <div className="overflow-x-auto">
            <TabsList className="inline-flex min-w-max space-x-1 bg-muted p-1 rounded-md">
              <TabsTrigger value="packages" className="whitespace-nowrap text-xs px-3">Packages</TabsTrigger>
              <TabsTrigger value="customers" className="whitespace-nowrap text-xs px-3">Customers</TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap text-xs px-3">Users</TabsTrigger>
              <TabsTrigger value="analytics" className="whitespace-nowrap text-xs px-3">Analytics</TabsTrigger>
              <TabsTrigger value="settings" className="whitespace-nowrap text-xs px-3">Settings</TabsTrigger>
            </TabsList>
          </div>
        ) : (
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="packages" className="space-y-4 sm:space-y-6">
          <AdminPackageFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          <PackageList searchTerm={searchTerm} statusFilter={statusFilter} />
        </TabsContent>

        <TabsContent value="customers">
          <AdminCustomerManagement />
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <AdminAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <AdminSettingsTab />
        </TabsContent>
      </Tabs>

      {showCreatePackage && (
        <CreatePackageForm onClose={() => setShowCreatePackage(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;
