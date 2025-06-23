
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Upload, Download, Eye } from 'lucide-react';

export interface Package {
  id: string;
  trackingNumber: string;
  description: string;
  status: 'received' | 'in_transit' | 'arrived' | 'ready_for_pickup' | 'picked_up';
  dateReceived: string;
  estimatedDelivery?: string;
  invoiceUploaded: boolean;
  dutyAssessed: boolean;
  totalDue?: number;
  customerName: string;
}

interface PackageCardProps {
  package: Package;
  userRole: 'customer' | 'admin';
  onStatusUpdate?: (packageId: string, status: Package['status']) => void;
  onUploadInvoice?: (packageId: string) => void;
  onViewInvoice?: (packageId: string) => void;
}

const statusColors = {
  received: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-yellow-100 text-yellow-800',
  arrived: 'bg-orange-100 text-orange-800',
  ready_for_pickup: 'bg-green-100 text-green-800',
  picked_up: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  received: 'Received at Miami',
  in_transit: 'In Transit',
  arrived: 'Arrived in Jamaica',
  ready_for_pickup: 'Ready for Pickup',
  picked_up: 'Picked Up'
};

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  userRole,
  onStatusUpdate,
  onUploadInvoice,
  onViewInvoice
}) => {
  const getNextStatus = (currentStatus: Package['status']): Package['status'] | null => {
    const statusFlow: Package['status'][] = ['received', 'in_transit', 'arrived', 'ready_for_pickup', 'picked_up'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>#{pkg.trackingNumber}</span>
          </CardTitle>
          <Badge className={statusColors[pkg.status]}>
            {statusLabels[pkg.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Description</p>
          <p className="font-medium">{pkg.description}</p>
        </div>
        
        {userRole === 'admin' && (
          <div>
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-medium">{pkg.customerName}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Date Received</p>
            <p className="font-medium">{new Date(pkg.dateReceived).toLocaleDateString()}</p>
          </div>
          {pkg.estimatedDelivery && (
            <div>
              <p className="text-gray-600">Est. Delivery</p>
              <p className="font-medium">{new Date(pkg.estimatedDelivery).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Badge variant={pkg.invoiceUploaded ? 'default' : 'secondary'}>
              Invoice {pkg.invoiceUploaded ? 'Uploaded' : 'Pending'}
            </Badge>
            {pkg.dutyAssessed && (
              <Badge variant="default">Duty Assessed</Badge>
            )}
          </div>
          {pkg.totalDue && (
            <p className="font-bold text-lg">${pkg.totalDue.toFixed(2)}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {userRole === 'customer' && !pkg.invoiceUploaded && (
            <Button size="sm" onClick={() => onUploadInvoice?.(pkg.id)}>
              <Upload className="h-4 w-4 mr-1" />
              Upload Invoice
            </Button>
          )}
          
          {pkg.invoiceUploaded && (
            <Button variant="outline" size="sm" onClick={() => onViewInvoice?.(pkg.id)}>
              <Eye className="h-4 w-4 mr-1" />
              View Invoice
            </Button>
          )}

          {pkg.dutyAssessed && pkg.status === 'ready_for_pickup' && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download Final Invoice
            </Button>
          )}

          {userRole === 'admin' && getNextStatus(pkg.status) && (
            <Button 
              size="sm" 
              onClick={() => onStatusUpdate?.(pkg.id, getNextStatus(pkg.status)!)}
            >
              Mark as {statusLabels[getNextStatus(pkg.status)!]}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageCard;
