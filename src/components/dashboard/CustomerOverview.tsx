
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CustomerOverview: React.FC = () => {
  const { profile } = useAuth();
  const { data: packageData, isLoading } = useOptimizedPackages(
    { customerId: profile?.id },
    { page: 1, limit: 10 }
  );

  const packages = packageData?.data || [];

  // Calculate stats
  const stats = {
    total: packages.length,
    received: packages.filter(p => p.status === 'received').length,
    inTransit: packages.filter(p => p.status === 'in_transit').length,
    readyForPickup: packages.filter(p => p.status === 'ready_for_pickup').length,
    pickedUp: packages.filter(p => p.status === 'picked_up').length,
  };

  const recentPackages = packages.slice(0, 5);

  if (isLoading) {
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your packages
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Transit</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.inTransit}</div>
            <p className="text-xs text-gray-500 mt-1">On the way</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready for Pickup</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.readyForPickup}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting collection</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.pickedUp}</div>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      {(stats.readyForPickup > 0 || stats.inTransit > 0) && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <AlertCircle className="h-5 w-5 mr-2" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.readyForPickup > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">
                    {stats.readyForPickup} package{stats.readyForPickup > 1 ? 's' : ''} ready for pickup
                  </p>
                  <p className="text-sm text-gray-600">Your packages are waiting at our facility</p>
                </div>
                <Button size="sm">View Details</Button>
              </div>
            )}
            {stats.inTransit > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">
                    {stats.inTransit} package{stats.inTransit > 1 ? 's' : ''} in transit
                  </p>
                  <p className="text-sm text-gray-600">Track your packages on their way to our facility</p>
                </div>
                <Button variant="outline" size="sm">Track</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPackages.length > 0 ? (
            <div className="space-y-4">
              {recentPackages.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Package className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{pkg.tracking_number}</p>
                      <p className="text-sm text-gray-600">{pkg.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      pkg.status === 'ready_for_pickup' ? 'default' :
                      pkg.status === 'in_transit' ? 'secondary' :
                      pkg.status === 'picked_up' ? 'outline' : 'secondary'
                    }>
                      {pkg.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(pkg.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No packages yet</p>
              <p className="text-sm text-gray-500">Your packages will appear here once they arrive</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerOverview;
