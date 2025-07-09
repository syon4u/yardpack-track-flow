import React from 'react';
import { useOptimizedStats } from '@/hooks/useOptimizedCustomers';
import AdminDashboardStats from '../admin/AdminDashboardStats';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import ActionAlerts from './ActionAlerts';

const AdminOverview: React.FC = () => {
  const { data: stats, isPending } = useOptimizedStats();

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-lg">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Monitor your package management system at a glance</p>
      </div>

      {/* Stats Grid */}
      <AdminDashboardStats />

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        
        {/* Right Column - Quick Actions and Alerts */}
        <div className="space-y-6">
          <QuickActions />
          <ActionAlerts />
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
