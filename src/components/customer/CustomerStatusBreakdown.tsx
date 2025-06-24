
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomerStatusBreakdownProps {
  receivedPackages: number;
  inTransitPackages: number;
  arrivedPackages: number;
  readyForPickup: number;
  pickedUpPackages: number;
}

const CustomerStatusBreakdown: React.FC<CustomerStatusBreakdownProps> = ({
  receivedPackages,
  inTransitPackages,
  arrivedPackages,
  readyForPickup,
  pickedUpPackages
}) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader className={isMobile ? 'pb-3' : ''}>
        <CardTitle className={isMobile ? 'text-base' : ''}>
          {isMobile ? 'Package Status' : 'Package Status Breakdown'}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-3 ${isMobile ? 'space-y-4' : 'space-y-4'}`}>
        <div className="flex items-center justify-between">
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'At Miami' : 'Received at Miami'}
          </span>
          <Badge variant="secondary" className={isMobile ? 'text-xs px-2 py-1' : ''}>
            {receivedPackages}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>In Transit</span>
          <Badge className={`bg-yellow-100 text-yellow-800 ${isMobile ? 'text-xs px-2 py-1' : ''}`}>
            {inTransitPackages}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'In Jamaica' : 'Arrived in Jamaica'}
          </span>
          <Badge className={`bg-purple-100 text-purple-800 ${isMobile ? 'text-xs px-2 py-1' : ''}`}>
            {arrivedPackages}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Ready' : 'Ready for Pickup'}
          </span>
          <Badge className={`bg-green-100 text-green-800 ${isMobile ? 'text-xs px-2 py-1' : ''}`}>
            {readyForPickup}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Picked Up</span>
          <Badge variant="outline" className={isMobile ? 'text-xs px-2 py-1' : ''}>
            {pickedUpPackages}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerStatusBreakdown;
