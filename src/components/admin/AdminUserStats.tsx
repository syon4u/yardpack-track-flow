
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, UserCheck } from 'lucide-react';

interface AdminUserStatsProps {
  totalUsers: number;
  adminUsers: number;
  warehouseUsers: number;
  customerServiceUsers: number;
}

const AdminUserStats: React.FC<AdminUserStatsProps> = ({
  totalUsers,
  adminUsers,
  warehouseUsers,
  customerServiceUsers,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total System Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <div className="text-xs text-gray-600">Active system accounts</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Administrators</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminUsers}</div>
          <div className="text-xs text-gray-600">Full system access</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Warehouse Staff</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{warehouseUsers}</div>
          <div className="text-xs text-gray-600">Package processing</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customer Service</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customerServiceUsers}</div>
          <div className="text-xs text-gray-600">Customer support staff</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserStats;
