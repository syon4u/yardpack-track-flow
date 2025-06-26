
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PackageStatsCardProps {
  packages: any[] | undefined;
}

const PackageStatsCard: React.FC<PackageStatsCardProps> = ({ packages }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Package Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Total Packages:</p>
            <p className="text-2xl font-bold text-blue-600">{packages?.length || 0}</p>
          </div>
          <div>
            <p className="font-medium">Arrived Today:</p>
            <p className="text-2xl font-bold text-green-600">
              {packages?.filter(pkg => pkg.status === 'arrived').length || 0}
            </p>
          </div>
          <div>
            <p className="font-medium">With Carrier Tracking:</p>
            <p className="text-2xl font-bold text-purple-600">
              {packages?.filter(pkg => pkg.external_tracking_number).length || 0}
            </p>
          </div>
          <div>
            <p className="font-medium">API Synced:</p>
            <p className="text-2xl font-bold text-orange-600">
              {packages?.filter(pkg => pkg.api_sync_status === 'synced').length || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageStatsCard;
