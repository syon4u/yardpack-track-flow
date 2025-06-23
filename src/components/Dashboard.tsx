
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PackageList from './PackageList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, TrendingUp, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          {profile?.role === 'admin' 
            ? 'Manage all packages and track deliveries across the system.'
            : 'Track your packages from Miami to Jamaica.'}
        </p>
      </div>

      {/* Stats Cards - Show for admin only */}
      {profile?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">With active packages</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Currently shipping</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Pickup</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Ready for customers</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Packages Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {profile?.role === 'admin' ? 'All Packages' : 'Your Packages'}
        </h2>
        <PackageList />
      </div>
    </div>
  );
};

export default Dashboard;
