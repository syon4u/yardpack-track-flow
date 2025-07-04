
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { RefreshCw, Plus, Search } from 'lucide-react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  // Pull-to-refresh functionality
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      // Add success haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }
    }, 1000);
  }, []);
  
  // Get packages for this customer - let service handle filtering automatically for customer role
  const { data: packages, isPending, error } = usePackages({
    searchTerm: '',
    statusFilter: 'all'
  });

  // For customer role, packages are already filtered by the service
  const customerPackages = packages || [];

  // Calculate statistics from packages
  const totalPackages = customerPackages.length;
  const totalValue = customerPackages.reduce((sum, p) => sum + (p.package_value || 0), 0);
  const totalDue = customerPackages.reduce((sum, p) => sum + (p.total_due || 0), 0);
  const pickedUpPackages = customerPackages.filter(p => p.status === 'picked_up').length;

  // Calculate status breakdown
  const receivedPackages = customerPackages.filter(p => p.status === 'received').length;
  const inTransitPackages = customerPackages.filter(p => p.status === 'in_transit').length;
  const arrivedPackages = customerPackages.filter(p => p.status === 'arrived').length;
  const readyForPickup = customerPackages.filter(p => p.status === 'ready_for_pickup').length;

  // Calculate pending invoices (packages without invoices)
  const pendingInvoices = customerPackages.filter(p => !p.invoice_uploaded).length;

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
        {/* Mobile Pull-to-Refresh Header */}
        {isMobile && (
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="touch-target"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <h1 className="text-lg font-semibold">Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="touch-target">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="touch-target">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'px-4 py-4' : 'p-6'}`}>
          {!isMobile && <CustomerHeader />}
          
          <div className="animate-fade-in">
            <CustomerStats />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-scale-in">
            {/* Mobile: Bottom Navigation */}
            {isMobile ? (
              <>
                <TabsContent value="overview" className="animate-slide-up">
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
                  </div>
                </TabsContent>

                <TabsContent value="packages" className="animate-slide-up">
                  <CustomerPackagesTab />
                </TabsContent>

                {/* Fixed Bottom Navigation for Mobile */}
                <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t px-4 py-2 z-50">
                  <TabsList className="grid w-full grid-cols-5 h-14">
                    <TabsTrigger value="overview" className="flex-col gap-1 h-full touch-target">
                      <div className="text-xs">Overview</div>
                    </TabsTrigger>
                    <TabsTrigger value="packages" className="flex-col gap-1 h-full touch-target">
                      <div className="text-xs">Packages</div>
                    </TabsTrigger>
                    <TabsTrigger value="invoices" className="flex-col gap-1 h-full touch-target">
                      <div className="text-xs">Invoices</div>
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex-col gap-1 h-full touch-target">
                      <div className="text-xs">Profile</div>
                    </TabsTrigger>
                    <TabsTrigger value="help" className="flex-col gap-1 h-full touch-target">
                      <div className="text-xs">Help</div>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="invoices" className="animate-slide-up">
                  <CustomerInvoicesTab />
                </TabsContent>

                <TabsContent value="profile" className="animate-slide-up">
                  <CustomerProfileTab
                    profile={profile}
                    totalPackages={totalPackages}
                    totalValue={totalValue}
                    totalDue={totalDue}
                    pickedUpPackages={pickedUpPackages}
                  />
                </TabsContent>

                <TabsContent value="help" className="animate-slide-up">
                  <CustomerHelpSection />
                </TabsContent>
              </>
            ) : (
              /* Desktop: Top Navigation */
              <>
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="packages">My Packages</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="help">Help</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-fade-in">
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
                </TabsContent>

                <TabsContent value="packages" className="animate-fade-in">
                  <CustomerPackagesTab />
                </TabsContent>

                <TabsContent value="invoices" className="animate-fade-in">
                  <CustomerInvoicesTab />
                </TabsContent>

                <TabsContent value="profile" className="animate-fade-in">
                  <CustomerProfileTab
                    profile={profile}
                    totalPackages={totalPackages}
                    totalValue={totalValue}
                    totalDue={totalDue}
                    pickedUpPackages={pickedUpPackages}
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
