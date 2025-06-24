
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  // Debug log to check profile data
  console.log('Main Dashboard - Profile data:', profile);

  // Route to appropriate dashboard based on user role
  if (profile?.role === 'customer') {
    return <CustomerDashboard />;
  }

  if (profile?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Fallback for loading or unknown roles
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
