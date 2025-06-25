import React, { useState, useEffect } from 'react';
import { useOptimizedStats } from '@/hooks/useOptimizedStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Users, TrendingUp, Clock, Plus, Scan, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import ComponentErrorBoundary from '@/components/error/ComponentErrorBoundary';

const AdminOverview: React.FC = () => {
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { data: stats, isLoading, error, refetch, isRefetching } = useOptimizedStats({
    maxRetries: 2,
    timeout: 8000
  });

  // Implement loading timeout safeguard
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading && !loadingTimeout) {
      timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
        console.warn('Admin overview loading exceeded timeout threshold');
      }, 12000); // 12 second timeout
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
    console.log("AdminOverview - State:", { stats, isLoading, error, loadingTimeout });
    
    if (error) {
      console.error('AdminOverview - Query error:', error);
    }
    
    if (stats) {
      console.log('AdminOverview - Stats loaded:', stats);
    }
  }, [stats, isLoading, error, loadingTimeout]);

  const handleRetry = () => {
    setLoadingTimeout(false);
    setRetryCount(prev => prev + 1);
    refetch();
  };

  // Enhanced error handling with specific error types
  const renderError = () => {
    const isTimeout = error?.isTimeout || loadingTimeout;
    const isNetworkError = error?.isNetworkError;
    
    let errorMessage = "Failed to load dashboard data.";
    let errorIcon = AlertCircle;
    
    if (isTimeout) {
      errorMessage = "Dashboard is taking longer than expected to load. This may indicate server performance issues.";
    } else if (isNetworkError) {
      errorMessage = "Network connection issue. Please check your internet connection.";
      errorIcon = WifiOff;
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage packages, customers, and system operations</p>
        </div>
        <Alert variant="destructive">
          <errorIcon className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium mb-1">{errorMessage}</div>
              {retryCount > 0 && (
                <div className="text-sm text-muted-foreground">
                  Retry attempt: {retryCount}
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              disabled={isRefetching}
              className="ml-4 flex-shrink-0"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
              {isRefetching ? 'Retrying...' : 'Try Again'}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  // Show error state with retry option
  if (error || loadingTimeout) {
    console.error('AdminOverview - Rendering error/timeout state');
    return renderError();
  }

  // Show loading state
  if (isLoading) {
    console.log('AdminOverview - Rendering loading state');
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative h-32 bg-gray-200 rounded-lg animate-pulse">
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="flex items-center text-sm text-gray-500">
                  <Wifi className="h-4 w-4 mr-1 animate-pulse" />
                  Loading...
                </div>
              </div>
            </div>
          ))}
        </div>
        {loadingTimeout && (
          <div className="text-center">
            <div className="text-sm text-amber-600 font-medium">
              Loading is taking longer than expected...
            </div>
            <div className="text-xs text-gray-500 mt-1">
              The server may be experiencing high load
            </div>
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

  console.log('AdminOverview - Rendering with data:', { packageStats, customerStats });

  return (
    <ComponentErrorBoundary componentName="AdminOverview">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage packages, customers, and system operations</p>
          </div>
          <div className="flex gap-3">
            <Link to="/warehouse">
              <Button variant="outline" className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                Scanner
              </Button>
            </Link>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Package
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Packages</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{packageStats.total}</div>
              <p className="text-xs text-green-600 mt-1">
                +{packageStats.received} this period
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{customerStats.active}</div>
              <p className="text-xs text-gray-500 mt-1">
                {customerStats.registered} registered
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Transit</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{packageStats.in_transit}</div>
              <p className="text-xs text-gray-500 mt-1">Currently shipping</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Pickup</CardTitle>
              <Clock className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{packageStats.ready_for_pickup}</div>
              <p className="text-xs text-gray-500 mt-1">Ready for customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Package Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View, create, and manage all packages in the system</p>
              <Button variant="outline" className="w-full">Manage Packages</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Customer Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View customer profiles and manage accounts</p>
              <Button variant="outline" className="w-full">Manage Customers</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View detailed reports and analytics</p>
              <Button variant="outline" className="w-full">View Analytics</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
};

export default AdminOverview;
