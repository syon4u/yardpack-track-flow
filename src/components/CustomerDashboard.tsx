
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePackages } from '@/hooks/usePackages';
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

const CustomerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const isMobile = useIsMobile();
  
  const { data: packages } = usePackages({ searchTerm, statusFilter });

  // Calculate statistics
  const totalPackages = packages?.length || 0;
  const receivedPackages = packages?.filter(p => p.status === 'received').length || 0;
  const inTransitPackages = packages?.filter(p => p.status === 'in_transit').length || 0;
  const arrivedPackages = packages?.filter(p => p.status === 'arrived').length || 0;
  const readyForPickup = packages?.filter(p => p.status === 'ready_for_pickup').length || 0;
  const pickedUpPackages = packages?.filter(p => p.status === 'picked_up').length || 0;
  const pendingInvoices = packages?.filter(p => !p.invoices || p.invoices.length === 0).length || 0;
  const totalValue = packages?.reduce((sum, p) => sum + (p.package_value || 0), 0) || 0;
  const totalDue = packages?.reduce((sum, p) => sum + (p.total_due || 0), 0) || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <CustomerHeader fullName={profile?.full_name} />

      <CustomerStats
        totalPackages={totalPackages}
        inTransitPackages={inTransitPackages}
        readyForPickup={readyForPickup}
        totalDue={totalDue}
      />

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
        </TabsContent>

        <TabsContent value="packages" className="space-y-4 sm:space-y-6">
          <CustomerPackagesTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4 sm:space-y-6">
          <CustomerInvoicesTab />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4 sm:space-y-6">
          <CustomerProfileTab
            profile={profile}
            totalPackages={totalPackages}
            totalValue={totalValue}
            totalDue={totalDue}
            pickedUpPackages={pickedUpPackages}
          />
        </TabsContent>
      </Tabs>

      <CustomerHelpSection />
    </div>
  );
};

export default CustomerDashboard;
