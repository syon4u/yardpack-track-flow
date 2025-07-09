
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
        className="cursor-pointer vibrant-card group relative overflow-hidden bg-gradient-hero border-0 text-white hover:scale-105 transition-all duration-500 animate-fade-in"
        style={{ animationDelay: '0ms' }}
        onClick={() => handleCardClick('/dashboard?tab=packages')}
        role="button"
        tabIndex={0}
        aria-label="View all packages"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=packages')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
          <Package className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold animate-count-up">{packageStats.total}</div>
          <p className="text-xs text-white/80">
            {packageStats.received} received this period
          </p>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
      
      <Card 
        className="cursor-pointer vibrant-card group relative overflow-hidden bg-gradient-warm border-0 text-white hover:scale-105 transition-all duration-500 animate-fade-in"
        style={{ animationDelay: '100ms' }}
        onClick={() => handleCardClick('/dashboard?tab=customers', 'active=true')}
        role="button"
        tabIndex={0}
        aria-label="View active customers"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=customers', 'active=true')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <Users className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold animate-count-up">{customerStats.active}</div>
          <p className="text-xs text-white/80">
            {customerStats.registered} registered users
          </p>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
      
      <Card 
        className="cursor-pointer vibrant-card group relative overflow-hidden bg-gradient-cool border-0 text-white hover:scale-105 transition-all duration-500 animate-fade-in"
        style={{ animationDelay: '200ms' }}
        onClick={() => handleCardClick('/dashboard?tab=packages', 'in_transit')}
        role="button"
        tabIndex={0}
        aria-label="View packages in transit"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=packages', 'in_transit')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          <TrendingUp className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold animate-count-up">{packageStats.in_transit}</div>
          <p className="text-xs text-white/80">Currently shipping</p>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
      
      <Card 
        className="cursor-pointer vibrant-card group relative overflow-hidden bg-gradient-success border-0 text-white hover:scale-105 transition-all duration-500 animate-fade-in animate-pulse-glow"
        style={{ animationDelay: '300ms' }}
        onClick={() => handleCardClick('/dashboard?tab=packages', 'ready_for_pickup')}
        role="button"
        tabIndex={0}
        aria-label="View packages ready for pickup"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=packages', 'ready_for_pickup')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium">Pending Pickup</CardTitle>
          <Clock className="h-5 w-5 group-hover:animate-pulse transition-all duration-300" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold animate-count-up">{packageStats.ready_for_pickup}</div>
          <p className="text-xs text-white/80">Ready for customers</p>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </div>
  );
};

export default AdminDashboardStats;
