
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useOptimizedStats } from '@/hooks/useOptimizedCustomers';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ComponentErrorBoundary from '@/components/error/ComponentErrorBoundary';

const AdminDashboardStats: React.FC = () => {
  const { data: stats, isLoading, error } = useOptimizedStats();

  React.useEffect(() => {
    console.log('AdminDashboardStats - Effect running', { stats, isLoading, error });
    
    // Add error handling for potential runtime issues
    if (error) {
      console.error('AdminDashboardStats - Query error:', error);
    }
    
    if (stats) {
      console.log('AdminDashboardStats - Stats loaded:', stats);
    }
  }, [stats, isLoading, error]);

  if (error) {
    console.error('AdminDashboardStats - Rendering error state');
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard statistics. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    console.log('AdminDashboardStats - Rendering loading state');
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

  console.log('AdminDashboardStats - Rendering with data:', { packageStats, customerStats });

  return (
    <ComponentErrorBoundary componentName="AdminDashboardStats">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packageStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {packageStats.received} received this period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.active}</div>
            <p className="text-xs text-muted-foreground">
              {customerStats.registered} registered users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packageStats.in_transit}</div>
            <p className="text-xs text-muted-foreground">Currently shipping</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Pickup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packageStats.ready_for_pickup}</div>
            <p className="text-xs text-muted-foreground">Ready for customers</p>
          </CardContent>
        </Card>
      </div>
    </ComponentErrorBoundary>
  );
};

export default AdminDashboardStats;
