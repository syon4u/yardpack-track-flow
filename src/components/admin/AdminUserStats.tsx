
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleCardClick = (path: string, filter?: string) => {
    if (filter) {
      navigate(`${path}&${filter}`);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card 
        className="cursor-pointer vibrant-card bg-gradient-hero text-white border-0 hover:scale-105 transition-all duration-500 animate-fade-in"
        onClick={() => handleCardClick('/dashboard?tab=users')}
        role="button"
        tabIndex={0}
        aria-label="View all system users"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=users')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Total System Users</CardTitle>
          <Users className="h-4 w-4 text-white/80" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalUsers}</div>
          <div className="text-xs text-white/80">Active system accounts</div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 interactive-hover"
        onClick={() => handleCardClick('/dashboard?tab=users', 'role=admin')}
        role="button"
        tabIndex={0}
        aria-label="View admin users"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=users', 'role=admin')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Administrators</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminUsers}</div>
          <div className="text-xs text-muted-foreground">Full system access</div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 interactive-hover"
        onClick={() => handleCardClick('/dashboard?tab=users', 'role=warehouse')}
        role="button"
        tabIndex={0}
        aria-label="View warehouse staff"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=users', 'role=warehouse')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Warehouse Staff</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{warehouseUsers}</div>
          <div className="text-xs text-muted-foreground">Package processing</div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 interactive-hover"
        onClick={() => handleCardClick('/dashboard?tab=users', 'role=customer')}
        role="button"
        tabIndex={0}
        aria-label="View customer service staff"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=users', 'role=customer')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customer Service</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customerServiceUsers}</div>
          <div className="text-xs text-muted-foreground">Customer support staff</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserStats;
