import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Search } from 'lucide-react';
import CustomerActionItems from './CustomerActionItems';
import CustomerStatusBreakdown from './CustomerStatusBreakdown';
import CustomerFinancialSummary from './CustomerFinancialSummary';
import CustomerRecentActivity from './CustomerRecentActivity';
import CustomerPackagesTab from './CustomerPackagesTab';
import CustomerReceiptsTab from './CustomerReceiptsTab';
import CustomerProfileTab from './CustomerProfileTab';
import CustomerHelpSection from './CustomerHelpSection';

interface CustomerDashboardMobileProps {
  packages: any[];
  stats: {
    totalPackages: number;
    totalValue: number;
    totalDue: number;
    pickedUpPackages: number;
    receivedPackages: number;
    inTransitPackages: number;
    arrivedPackages: number;
    readyForPickup: number;
    pendingReceipts: number;
  };
}

const CustomerDashboardMobile: React.FC<CustomerDashboardMobileProps> = ({ packages, stats }) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  return (
    <div className="relative pb-20">
      {/* Mobile Pull-to-Refresh Header */}
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

      <div className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-scale-in">
          <TabsContent value="overview" className="animate-slide-up">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <CustomerActionItems 
                  pendingReceipts={stats.pendingReceipts}
                  readyForPickup={stats.readyForPickup}
                />
                <CustomerStatusBreakdown 
                  receivedPackages={stats.receivedPackages}
                  inTransitPackages={stats.inTransitPackages}
                  arrivedPackages={stats.arrivedPackages}
                  readyForPickup={stats.readyForPickup}
                  pickedUpPackages={stats.pickedUpPackages}
                />
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <CustomerFinancialSummary
                  totalValue={stats.totalValue}
                  totalDue={stats.totalDue}
                  pendingReceipts={stats.pendingReceipts}
                />
                <CustomerRecentActivity packages={packages} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="packages" className="animate-slide-up">
            <CustomerPackagesTab />
          </TabsContent>

          <TabsContent value="receipts" className="animate-slide-up">
            <CustomerReceiptsTab />
          </TabsContent>

          <TabsContent value="profile" className="animate-slide-up">
            <CustomerProfileTab
              profile={profile}
              totalPackages={stats.totalPackages}
              totalValue={stats.totalValue}
              totalDue={stats.totalDue}
              pickedUpPackages={stats.pickedUpPackages}
            />
          </TabsContent>

          <TabsContent value="help" className="animate-slide-up">
            <CustomerHelpSection />
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
              <TabsTrigger value="receipts" className="flex-col gap-1 h-full touch-target">
                <div className="text-xs">Receipts</div>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex-col gap-1 h-full touch-target">
                <div className="text-xs">Profile</div>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex-col gap-1 h-full touch-target">
                <div className="text-xs">Help</div>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboardMobile;