
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import CustomerOverview from './CustomerOverview';
import AdminOverview from './AdminOverview';
import PackageManagement from './PackageManagement';
import CustomerManagement from './CustomerManagement';
import SystemUserManagement from './SystemUserManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import ProfileSettings from './ProfileSettings';
import SystemSettings from './SystemSettings';
import InvoiceManagement from './InvoiceManagement';
import NotificationManagement from './NotificationManagement';

const DashboardContent: React.FC = () => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const renderContent = () => {
    switch (activeTab) {
      case 'packages':
        return <PackageManagement />;
      case 'customers':
        return profile?.role === 'admin' ? <CustomerManagement /> : <CustomerOverview />;
      case 'users':
        return profile?.role === 'admin' ? <SystemUserManagement /> : <CustomerOverview />;
      case 'notifications':
        return profile?.role === 'admin' ? <NotificationManagement /> : <CustomerOverview />;
      case 'analytics':
        return profile?.role === 'admin' ? <AnalyticsDashboard /> : <CustomerOverview />;
      case 'invoices':
        return <InvoiceManagement />;
      case 'profile':
        return <ProfileSettings />;
      case 'settings':
        return profile?.role === 'admin' ? <SystemSettings /> : <ProfileSettings />;
      default:
        return profile?.role === 'admin' ? <AdminOverview /> : <CustomerOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardContent;
