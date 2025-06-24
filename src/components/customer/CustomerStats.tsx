
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, CheckCircle, DollarSign } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPackages}</div>
          <p className="text-xs text-muted-foreground">All time shipments</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          <Truck className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{inTransitPackages}</div>
          <p className="text-xs text-muted-foreground">On the way to Jamaica</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{readyForPickup}</div>
          <p className="text-xs text-muted-foreground">Available for collection</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Due</CardTitle>
          <DollarSign className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">${totalDue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Outstanding balance</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerStats;
