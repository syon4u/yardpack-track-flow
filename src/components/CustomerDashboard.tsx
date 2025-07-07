
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomerHeader from './customer/CustomerHeader';
import CustomerStats from './customer/CustomerStats';
import CustomerPackagesTab from './customer/CustomerPackagesTab';
import CustomerInvoicesTab from './customer/CustomerInvoicesTab';
import EnhancedCustomerProfileTab from './customer/EnhancedCustomerProfileTab';
import PackageConsolidationRequest from './customer/PackageConsolidationRequest';
import CustomerHelpSection from './customer/CustomerHelpSection';
import DashboardSkeleton from './loading/DashboardSkeleton';
import ErrorBoundary from './error/ErrorBoundary';
import MobileHeader from './customer/MobileHeader';
import DashboardOverviewContent from './customer/DashboardOverviewContent';
import MobileTabNavigation from './customer/MobileTabNavigation';
import DesktopTabNavigation from './customer/DesktopTabNavigation';
import { useCustomerDashboardData } from './customer/hooks/useCustomerDashboardData';
import { useRefreshHandler } from './customer/hooks/useRefreshHandler';

const CustomerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();
  const { isRefreshing, handleRefresh } = useRefreshHandler();
  const { customerPackages, dashboardStats, isPending, error } = useCustomerDashboardData();

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
      <div className={`relative ${isMobile ? 'pb-20' : ''}`}>
        {isMobile && (
          <MobileHeader 
            isRefreshing={isRefreshing} 
            onRefresh={handleRefresh} 
          />
        )}

        <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'px-4 py-4' : 'p-6'}`}>
          {!isMobile && <CustomerHeader />}
          
          <div className="animate-fade-in">
            <CustomerStats />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-scale-in">
            {isMobile ? (
              <>
                <TabsContent value="overview" className="animate-slide-up">
                  <DashboardOverviewContent 
                    dashboardStats={dashboardStats}
                    customerPackages={customerPackages}
                    isMobile={true}
                  />
                  <PackageConsolidationRequest />
                </TabsContent>

                <TabsContent value="packages" className="animate-slide-up">
                  <CustomerPackagesTab />
                </TabsContent>

                <MobileTabNavigation />

                <TabsContent value="invoices" className="animate-slide-up">
                  <CustomerInvoicesTab />
                </TabsContent>

                <TabsContent value="profile" className="animate-slide-up">
                  <EnhancedCustomerProfileTab
                    profile={profile}
                    totalPackages={dashboardStats.totalPackages}
                    totalValue={dashboardStats.totalValue}
                    totalDue={dashboardStats.totalDue}
                    pickedUpPackages={dashboardStats.pickedUpPackages}
                  />
                </TabsContent>

                <TabsContent value="help" className="animate-slide-up">
                  <CustomerHelpSection />
                </TabsContent>
              </>
            ) : (
              <>
                <DesktopTabNavigation />

                <TabsContent value="overview" className="space-y-6 animate-fade-in">
                  <DashboardOverviewContent 
                    dashboardStats={dashboardStats}
                    customerPackages={customerPackages}
                    isMobile={false}
                  />
                </TabsContent>

                <TabsContent value="packages" className="animate-fade-in">
                  <CustomerPackagesTab />
                </TabsContent>

                <TabsContent value="invoices" className="animate-fade-in">
                  <CustomerInvoicesTab />
                </TabsContent>

                <TabsContent value="profile" className="animate-fade-in">
                  <EnhancedCustomerProfileTab
                    profile={profile}
                    totalPackages={dashboardStats.totalPackages}
                    totalValue={dashboardStats.totalValue}
                    totalDue={dashboardStats.totalDue}
                    pickedUpPackages={dashboardStats.pickedUpPackages}
                  />
                </TabsContent>

                <TabsContent value="help" className="animate-fade-in">
                  <CustomerHelpSection />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CustomerDashboard;
