
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Package, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminCustomerStatsProps {
  totalCustomers: number;
  registeredCustomers: number;
  packageOnlyCustomers: number;
  activeCustomers: number;
}

const AdminCustomerStats: React.FC<AdminCustomerStatsProps> = ({
  totalCustomers,
  registeredCustomers,
  packageOnlyCustomers,
  activeCustomers
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
        onClick={() => handleCardClick('/dashboard?tab=customers')}
        role="button"
        tabIndex={0}
        aria-label="View all customers"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=customers')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-white/80" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalCustomers}</div>
          <p className="text-xs text-white/80">All customer records</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 interactive-hover"
        onClick={() => handleCardClick('/dashboard?tab=customers', 'type=registered')}
        role="button"
        tabIndex={0}
        aria-label="View registered customers"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=customers', 'type=registered')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{registeredCustomers}</div>
          <p className="text-xs text-muted-foreground">Have user accounts</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 interactive-hover"
        onClick={() => handleCardClick('/dashboard?tab=customers', 'type=package_only')}
        role="button"
        tabIndex={0}
        aria-label="View package-only customers"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=customers', 'type=package_only')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Package-Only</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{packageOnlyCustomers}</div>
          <p className="text-xs text-muted-foreground">From scanned packages</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 interactive-hover"
        onClick={() => handleCardClick('/dashboard?tab=customers', 'active=true')}
        role="button"
        tabIndex={0}
        aria-label="View active customers"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=customers', 'active=true')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCustomers}</div>
          <p className="text-xs text-muted-foreground">With pending packages</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomerStats;
