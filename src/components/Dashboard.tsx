
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import CustomerDashboardDemo from './CustomerDashboardDemo';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  // For customers, show the demo dashboard with sample data
  if (profile?.role === 'customer') {
    return <CustomerDashboardDemo />;
  }

  // Fallback for any other roles (shouldn't happen with current setup)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Your dashboard is loading...
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
