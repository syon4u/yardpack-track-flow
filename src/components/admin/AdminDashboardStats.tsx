
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Users, TrendingUp, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useOptimizedStats } from '@/hooks/useOptimizedStats';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ComponentErrorBoundary from '@/components/error/ComponentErrorBoundary';

const AdminDashboardStats: React.FC = () => {
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const { data: stats, isLoading, error, refetch, isRefetching } = useOptimizedStats({
    maxRetries: 2,
    timeout: 10000
  });

  // Implement loading timeout safeguard
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading && !loadingTimeout) {
      timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
        console.warn('Stats loading exceeded timeout threshold');
      }, 15000); // 15 second timeout for loading state
    } else if (!isLoading) {
      setLoadingTimeout(false);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, loadingTimeout]);

  React.useEffect(() => {
    console.log("AdminDashboardStats - State:", { stats, isLoading, error, loadingTimeout });
    
    if (error) {
      console.error('AdminDashboardStats - Query error:', error);
    }
    
    if (stats) {
      console.log('AdminDashboardStats - Stats loaded:', stats);
    }
  }, [stats, isLoading, error, loadingTimeout]);

  // Show error state with retry option
  if (error || loadingTimeout) {
    console.error('AdminDashboardStats - Rendering error/timeout state');
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            {loadingTimeout 
              ? "Dashboard data is taking longer than expected to load." 
              : "Failed to load dashboard statistics."
            }
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setLoadingTimeout(false);
              refetch();
            }}
            disabled={isRefetching}
            className="ml-4"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state with timeout indicator
  if (isLoading) {
    console.log('AdminDashboardStats - Rendering loading state');
    return (
      <div className="space-y-4">
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
        {loadingTimeout && (
          <div className="text-center text-sm text-gray-500">
            Loading is taking longer than expected...
          </div>
        )}
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
