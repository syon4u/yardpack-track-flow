
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, CheckCircle, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomerStatsProps {
  totalPackages: number;
  inTransitPackages: number;
  readyForPickup: number;
  totalDue: number;
}

const CustomerStats: React.FC<CustomerStatsProps> = ({
  totalPackages,
  inTransitPackages,
  readyForPickup,
  totalDue
}) => {
  const isMobile = useIsMobile();

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
