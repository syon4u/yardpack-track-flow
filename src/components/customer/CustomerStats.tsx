
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, CheckCircle, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';

const CustomerStats: React.FC = () => {
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  
  // Fetch packages for the current customer
  const { data: packageData, isPending } = useOptimizedPackages(
    { customerId: profile?.id },
    { page: 1, limit: 1000 } // Get all packages for stats
  );

  const packages = packageData?.data || [];

  // Calculate statistics from actual data
  const totalPackages = packages.length;
  const inTransitPackages = packages.filter(p => p.status === 'in_transit').length;
  const readyForPickup = packages.filter(p => p.status === 'ready_for_pickup').length;
  const totalDue = packages.reduce((sum, p) => sum + (p.total_due || 0), 0);

  if (isPending) {
    return (
      <div className={`grid gap-3 sm:gap-4 md:gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className={isMobile ? 'p-3' : ''}>
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
              <div className={`bg-gray-200 rounded animate-pulse mb-1 ${isMobile ? 'h-5 w-12' : 'h-8 w-16'}`}></div>
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 sm:gap-4 md:gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
      <Card className={isMobile ? 'p-3' : ''}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
          <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Total' : 'Total Packages'}
          </CardTitle>
          <Package className={`text-muted-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>{totalPackages}</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {isMobile ? 'All shipments' : 'All time shipments'}
          </p>
        </CardContent>
      </Card>
      
      <Card className={isMobile ? 'p-3' : ''}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
          <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Transit' : 'In Transit'}
          </CardTitle>
          <Truck className={`text-blue-500 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className={`font-bold text-blue-600 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{inTransitPackages}</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {isMobile ? 'To Jamaica' : 'On the way to Jamaica'}
          </p>
        </CardContent>
      </Card>
      
      <Card className={isMobile ? 'p-3' : ''}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
          <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Ready' : 'Ready for Pickup'}
          </CardTitle>
          <CheckCircle className={`text-green-500 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className={`font-bold text-green-600 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{readyForPickup}</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {isMobile ? 'For collection' : 'Available for collection'}
          </p>
        </CardContent>
      </Card>
      
      <Card className={isMobile ? 'p-3' : ''}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
          <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Due' : 'Total Due'}
          </CardTitle>
          <DollarSign className={`text-orange-500 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className={`font-bold text-orange-600 ${isMobile ? 'text-lg' : 'text-2xl'}`}>${totalDue.toFixed(2)}</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {isMobile ? 'Outstanding' : 'Outstanding balance'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerStats;
