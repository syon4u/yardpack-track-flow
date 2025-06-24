
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import CustomerDashboardDemo from './CustomerDashboardDemo';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  // Debug log to check profile data
  console.log('Main Dashboard - Profile data:', profile);

  // For customers, show the real dashboard with actual data
  if (profile?.role === 'customer') {
    return <CustomerDashboard />;
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
