
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
import { useCustomers } from '@/hooks/useCustomers';

const CustomerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();
  
  // Get customer record for this user
  const { data: customers } = useCustomers();
  const customerRecord = customers?.find(c => c.user_id === profile?.id);
  
  // Use optimized packages hook with proper customer ID reference
  const { data: packageData, isLoading } = useOptimizedPackages(
    { customerId: customerRecord?.id },
    { page: 1, limit: 1000 }
  );

  const packages = packageData?.data || [];

  // Calculate statistics from packages
  const totalPackages = packages.length;
  const totalValue = packages.reduce((sum, p) => sum + (p.package_value || 0), 0);
  const totalDue = packages.reduce((sum, p) => sum + (p.total_due || 0), 0);
  const pickedUpPackages = packages.filter(p => p.status === 'picked_up').length;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'px-4 py-4' : 'p-6'}`}>
        <CustomerHeader />
        
        <CustomerStats />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-5'} mb-6`}>
            <TabsTrigger value="overview" className={isMobile ? 'text-xs' : ''}>
              {isMobile ? 'Overview' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="packages" className={isMobile ? 'text-xs' : ''}>
              {isMobile ? 'Packages' : 'My Packages'}
            </TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="help">Help</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <CustomerActionItems packages={packages} />
              <CustomerStatusBreakdown packages={packages} />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <CustomerFinancialSummary
                totalValue={totalValue}
                totalDue={totalDue}
                packages={packages}
              />
              <CustomerRecentActivity packages={packages} />
            </div>
          </TabsContent>

          <TabsContent value="packages">
            <CustomerPackagesTab />
          </TabsContent>

          {!isMobile && (
            <>
              <TabsContent value="invoices">
                <CustomerInvoicesTab packages={packages} />
              </TabsContent>

              <TabsContent value="profile">
                <CustomerProfileTab
                  profile={profile}
                  totalPackages={totalPackages}
                  totalValue={totalValue}
                  totalDue={totalDue}
                  pickedUpPackages={pickedUpPackages}
                />
              </TabsContent>

              <TabsContent value="help">
                <CustomerHelpSection />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

export default CustomerDashboard;
