
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
  const { profile, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Show loading state while auth is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle cases where profile is not loaded yet
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Loading your dashboard...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // Determine if user should see admin or customer content
    const isAdmin = profile.role === 'admin';
    const isWarehouse = profile.role === 'warehouse';
    
    switch (activeTab) {
      case 'packages':
        return <PackageManagement />;
      case 'customers':
        return isAdmin ? <CustomerManagement /> : <CustomerOverview />;
      case 'users':
        return isAdmin ? <SystemUserManagement /> : <CustomerOverview />;
      case 'notifications':
        return isAdmin ? <NotificationManagement /> : <CustomerOverview />;
      case 'analytics':
        return isAdmin ? <AnalyticsDashboard /> : <CustomerOverview />;
      case 'invoices':
        return <InvoiceManagement />;
      case 'profile':
        return <ProfileSettings />;
      case 'settings':
        return isAdmin ? <SystemSettings /> : <ProfileSettings />;
      default:
        // Fix: Properly route based on role for default overview
        if (isAdmin || isWarehouse) {
          return <AdminOverview />;
        } else {
          return <CustomerOverview />;
        }
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
