import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomerHeader from './customer/CustomerHeader';
import CustomerStats from './customer/CustomerStats';
import CustomerActionItems from './customer/CustomerActionItems';
import CustomerStatusBreakdown from './customer/CustomerStatusBreakdown';
import CustomerFinancialSummary from './customer/CustomerFinancialSummary';
import CustomerRecentActivity from './customer/CustomerRecentActivity';
import CustomerPackagesTab from './customer/CustomerPackagesTab';
import CustomerInvoicesTab from './customer/CustomerInvoicesTab';
import CustomerProfileTab from './customer/CustomerProfileTab';
import CustomerHelpSection from './customer/CustomerHelpSection';
import DashboardSkeleton from './loading/DashboardSkeleton';
import ErrorBoundary from './error/ErrorBoundary';

const CustomerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();
  
  // Use optimized packages hook for better performance
  const { data: packageData, isLoading } = useOptimizedPackages(
    { 
      customerId: profile?.id
    },
    { page: 1, limit: 1000 }
  );

  const packages = packageData?.data || [];

  // Calculate statistics from real data
  const totalPackages = packages.length;
  const receivedPackages = packages.filter(p => p.status === 'received').length;
  const inTransitPackages = packages.filter(p => p.status === 'in_transit').length;
  const arrivedPackages = packages.filter(p => p.status === 'arrived').length;
  const readyForPickup = packages.filter(p => p.status === 'ready_for_pickup').length;
  const pickedUpPackages = packages.filter(p => p.status === 'picked_up').length;
  const pendingInvoices = packages.filter(p => !p.invoices || p.invoices.length === 0).length;
  const totalValue = packages.reduce((sum, p) => sum + (p.package_value || 0), 0);
  const totalDue = packages.reduce((sum, p) => sum + (p.total_due || 0), 0);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4 sm:space-y-6">
        <CustomerHeader fullName={profile?.full_name} />

        <CustomerStats />

        <CustomerActionItems
          pendingInvoices={pendingInvoices}
          readyForPickup={readyForPickup}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className={`${isMobile ? 'grid w-full grid-cols-2 h-auto' : 'grid w-full grid-cols-4'}`}>
            <TabsTrigger value="overview" className={isMobile ? 'text-xs py-3' : ''}>
              {isMobile ? 'Overview' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="packages" className={isMobile ? 'text-xs py-3' : ''}>
              {isMobile ? 'Packages' : 'My Packages'}
            </TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Mobile: Additional tabs in second row */}
          {isMobile && (
            <TabsList className="grid w-full grid-cols-2 h-auto mt-2">
              <TabsTrigger value="invoices" className="text-xs py-3">
                Invoices
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs py-3">
                Profile
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <ErrorBoundary>
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
                <CustomerStatusBreakdown
                  receivedPackages={receivedPackages}
                  inTransitPackages={inTransitPackages}
                  arrivedPackages={arrivedPackages}
                  readyForPickup={readyForPickup}
                  pickedUpPackages={pickedUpPackages}
                />

                <CustomerFinancialSummary
                  totalValue={totalValue}
                  totalDue={totalDue}
                  pendingInvoices={pendingInvoices}
                />
              </div>

              <CustomerRecentActivity packages={packages} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="packages" className="space-y-4 sm:space-y-6">
            <ErrorBoundary>
              <CustomerPackagesTab />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4 sm:space-y-6">
            <ErrorBoundary>
              <CustomerInvoicesTab />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <ErrorBoundary>
              <CustomerProfileTab
                profile={profile}
                totalPackages={totalPackages}
                totalValue={totalValue}
                totalDue={totalDue}
                pickedUpPackages={pickedUpPackages}
              />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>

        <CustomerHelpSection />
      </div>
    </ErrorBoundary>
  );
};

export default CustomerDashboard;
