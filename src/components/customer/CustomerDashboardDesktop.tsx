import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerHeader from './CustomerHeader';
import CustomerStats from './CustomerStats';
import CustomerActionItems from './CustomerActionItems';
import CustomerStatusBreakdown from './CustomerStatusBreakdown';
import CustomerFinancialSummary from './CustomerFinancialSummary';
import CustomerRecentActivity from './CustomerRecentActivity';
import CustomerPackagesTab from './CustomerPackagesTab';
import CustomerInvoicesTab from './CustomerInvoicesTab';
import CustomerProfileTab from './CustomerProfileTab';
import CustomerHelpSection from './CustomerHelpSection';

interface CustomerDashboardDesktopProps {
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
    pendingInvoices: number;
  };
}

const CustomerDashboardDesktop: React.FC<CustomerDashboardDesktopProps> = ({ packages, stats }) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-4 sm:space-y-6 p-6">
      <CustomerHeader />
      
      <div className="animate-fade-in">
        <CustomerStats />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-scale-in">
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
              pendingInvoices={stats.pendingInvoices}
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
              pendingInvoices={stats.pendingInvoices}
            />
            <CustomerRecentActivity packages={packages} />
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
            totalPackages={stats.totalPackages}
            totalValue={stats.totalValue}
            totalDue={stats.totalDue}
            pickedUpPackages={stats.pickedUpPackages}
          />
        </TabsContent>

        <TabsContent value="help" className="animate-fade-in">
          <CustomerHelpSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboardDesktop;