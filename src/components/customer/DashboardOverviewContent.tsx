import React from 'react';
import CustomerActionItems from './CustomerActionItems';
import CustomerStatusBreakdown from './CustomerStatusBreakdown';
import CustomerFinancialSummary from './CustomerFinancialSummary';
import CustomerRecentActivity from './CustomerRecentActivity';
import PackageConsolidationRequest from './PackageConsolidationRequest';

interface DashboardStats {
  totalPackages: number;
  totalValue: number;
  totalDue: number;
  pickedUpPackages: number;
  receivedPackages: number;
  inTransitPackages: number;
  arrivedPackages: number;
  readyForPickup: number;
  pendingInvoices: number;
}

interface DashboardOverviewContentProps {
  dashboardStats: DashboardStats;
  customerPackages: any[];
  isMobile?: boolean;
}

const DashboardOverviewContent: React.FC<DashboardOverviewContentProps> = ({
  dashboardStats,
  customerPackages,
  isMobile = false
}) => {
  const {
    pendingInvoices,
    readyForPickup,
    receivedPackages,
    inTransitPackages,
    arrivedPackages,
    pickedUpPackages,
    totalValue,
    totalDue
  } = dashboardStats;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <CustomerActionItems 
          pendingInvoices={pendingInvoices}
          readyForPickup={readyForPickup}
        />
        <CustomerStatusBreakdown 
          receivedPackages={receivedPackages}
          inTransitPackages={inTransitPackages}
          arrivedPackages={arrivedPackages}
          readyForPickup={readyForPickup}
          pickedUpPackages={pickedUpPackages}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <CustomerFinancialSummary
          totalValue={totalValue}
          totalDue={totalDue}
          pendingInvoices={pendingInvoices}
        />
        <CustomerRecentActivity 
          packages={customerPackages}
        />
      </div>

      {!isMobile && <PackageConsolidationRequest />}
    </div>
  );
};

export default DashboardOverviewContent;