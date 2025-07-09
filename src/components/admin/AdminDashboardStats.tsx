
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, TrendingUp, Clock } from 'lucide-react';
import { useOptimizedStats } from '@/hooks/useOptimizedCustomers';
import { useNavigate } from 'react-router-dom';

const AdminDashboardStats: React.FC = () => {
  const { data: stats, isPending } = useOptimizedStats();
  const navigate = useNavigate();

  const handleCardClick = (path: string, status?: string) => {
    if (status) {
      navigate(`${path}?status=${status}`);
    } else {
      navigate(path);
    }
  };

  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const packageStats = stats?.packages || {
    total: 0,
    received: 0,
    in_transit: 0,
    arrived: 0,
    ready_for_pickup: 0,
    picked_up: 0,
  };

  const customerStats = stats?.customers || {
    total: 0,
    registered: 0,
    package_only: 0,
    active: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card 
        className="cursor-pointer gradient-slate-blue hover-glow glass-card"
        onClick={() => handleCardClick('/dashboard?tab=packages')}
        role="button"
        tabIndex={0}
        aria-label="View all packages"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=packages')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Total Packages</CardTitle>
          <Package className="h-5 w-5 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{packageStats.total}</div>
          <p className="text-xs text-white/80">
            {packageStats.received} received this period
          </p>
        </CardContent>
      </Card>
      
      <Card 
        className="cursor-pointer gradient-slate-emerald hover-glow glass-card"
        onClick={() => handleCardClick('/dashboard?tab=customers', 'active=true')}
        role="button"
        tabIndex={0}
        aria-label="View active customers"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=customers', 'active=true')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Active Customers</CardTitle>
          <Users className="h-5 w-5 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{customerStats.active}</div>
          <p className="text-xs text-white/80">
            {customerStats.registered} registered users
          </p>
        </CardContent>
      </Card>
      
      <Card 
        className="cursor-pointer gradient-slate-cyan hover-glow glass-card"
        onClick={() => handleCardClick('/dashboard?tab=packages', 'in_transit')}
        role="button"
        tabIndex={0}
        aria-label="View packages in transit"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=packages', 'in_transit')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">In Transit</CardTitle>
          <TrendingUp className="h-5 w-5 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{packageStats.in_transit}</div>
          <p className="text-xs text-white/80">Currently shipping</p>
        </CardContent>
      </Card>
      
      <Card 
        className="cursor-pointer gradient-slate-amber hover-glow glass-card"
        onClick={() => handleCardClick('/dashboard?tab=packages', 'ready_for_pickup')}
        role="button"
        tabIndex={0}
        aria-label="View packages ready for pickup"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=packages', 'ready_for_pickup')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Pending Pickup</CardTitle>
          <Clock className="h-5 w-5 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{packageStats.ready_for_pickup}</div>
          <p className="text-xs text-white/80">Ready for customers</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardStats;
