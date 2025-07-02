
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import DashboardSkeleton from './loading/DashboardSkeleton';
import ErrorBoundary from './error/ErrorBoundary';
import CustomerDashboardMobile from './customer/CustomerDashboardMobile';
import CustomerDashboardDesktop from './customer/CustomerDashboardDesktop';
import { useCustomerDashboardData } from '@/hooks/customer/useCustomerDashboardData';

const CustomerDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const { packages, isPending, error, stats } = useCustomerDashboardData();

  if (isPending) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {isMobile ? (
        <CustomerDashboardMobile packages={packages} stats={stats} />
      ) : (
        <CustomerDashboardDesktop packages={packages} stats={stats} />
      )}
    </ErrorBoundary>
  );
};

export default CustomerDashboard;
