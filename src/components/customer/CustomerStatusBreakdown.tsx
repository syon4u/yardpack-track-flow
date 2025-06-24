
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Received at Miami</span>
          <Badge variant="secondary">{receivedPackages}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">In Transit</span>
          <Badge className="bg-yellow-100 text-yellow-800">{inTransitPackages}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Arrived in Jamaica</span>
          <Badge className="bg-purple-100 text-purple-800">{arrivedPackages}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Ready for Pickup</span>
          <Badge className="bg-green-100 text-green-800">{readyForPickup}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Picked Up</span>
          <Badge variant="outline">{pickedUpPackages}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerStatusBreakdown;
