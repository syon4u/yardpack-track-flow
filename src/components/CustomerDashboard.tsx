
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { usePackages } from '@/hooks/usePackages';

const CustomerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();
  
  // Get customer record for this user
  const { data: customers } = useCustomers();
  const customerRecord = customers?.find(c => c.user_id === profile?.id);
  
  // Get packages for this customer
  const { data: packages, isLoading } = usePackages({
    searchTerm: '',
    statusFilter: 'all'
  });

  // Filter packages for current customer
  const customerPackages = packages?.filter(p => p.customer_id === customerRecord?.id) || [];

  // Calculate statistics from packages
  const totalPackages = customerPackages.length;
  const totalValue = customerPackages.reduce((sum, p) => sum + (p.package_value || 0), 0);
  const totalDue = customerPackages.reduce((sum, p) => sum + (p.total_due || 0), 0);
  const pickedUpPackages = customerPackages.filter(p => p.status === 'picked_up').length;

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
              <CustomerActionItems />
              <CustomerStatusBreakdown />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <CustomerFinancialSummary
                totalValue={totalValue}
                totalDue={totalDue}
              />
              <CustomerRecentActivity />
            </div>
          </TabsContent>

          <TabsContent value="packages">
            <CustomerPackagesTab />
          </TabsContent>

          {!isMobile && (
            <>
              <TabsContent value="invoices">
                <CustomerInvoicesTab />
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
