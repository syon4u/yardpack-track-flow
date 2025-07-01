import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Package, Upload, Eye, Edit, ExternalLink, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { MagayaStatusIndicator } from './magaya/MagayaStatusIndicator';
import { MagayaSyncButton } from './magaya/MagayaSyncButton';
import PickupVerificationModal from './pickup/PickupVerificationModal';

// Use the actual database enum type
type PackageStatus = Database['public']['Enums']['package_status'];

export interface Package {
  id: string;
  trackingNumber: string;
  description: string;
  status: PackageStatus;
  dateReceived: string;
  estimatedDelivery?: string;
  invoiceUploaded: boolean;
  dutyAssessed: boolean;
  totalDue?: number;
  customerName?: string;
  // Magaya fields
  magayaShipmentId?: string | null;
  magayaReferenceNumber?: string | null;
  warehouseLocation?: string | null;
  consolidationStatus?: string | null;
}

interface PackageCardProps {
  package: Package;
  userRole: 'customer' | 'admin' | 'warehouse';
  onStatusUpdate?: (packageId: string, status: PackageStatus) => void;
  onUploadInvoice?: (packageId: string) => void;
  onViewInvoice?: (packageId: string) => void;
  onViewDetails?: (packageId: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  userRole,
  onStatusUpdate,
  onUploadInvoice,
  onViewInvoice,
  onViewDetails
}) => {
  const [selectedPackageForPickup, setSelectedPackageForPickup] = useState<any>(null);

  const statusColors = {
    received: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-yellow-100 text-yellow-800',
    arrived: 'bg-green-100 text-green-800',
    ready_for_pickup: 'bg-purple-100 text-purple-800',
    picked_up: 'bg-gray-100 text-gray-800',
  };

  const getStatusLabel = (status: PackageStatus) => {
    switch (status) {
      case 'received': return 'Received';
      case 'in_transit': return 'In Transit';
      case 'arrived': return 'Arrived';
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'picked_up': return 'Picked Up';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error("Error formatting date", dateString, error);
      return 'Invalid Date';
    }
  };

  const canRecordPickup = (packageData: Package) => {
    return userRole !== 'customer' && packageData.status === 'ready_for_pickup';
  };

  // Convert PackageCard format to PackageTable format for pickup modal
  const convertToTableFormat = (cardPackage: Package) => ({
    id: cardPackage.id,
    tracking_number: cardPackage.trackingNumber,
    description: cardPackage.description,
    status: cardPackage.status,
    date_received: cardPackage.dateReceived,
    estimated_delivery: cardPackage.estimatedDelivery,
    magaya_shipment_id: cardPackage.magayaShipmentId,
    magaya_reference_number: cardPackage.magayaReferenceNumber,
    warehouse_location: cardPackage.warehouseLocation,
    consolidation_status: cardPackage.consolidationStatus,
  });

  return (
    <>
      <Card className="bg-white shadow-md rounded-lg overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold">{pkg.description}</CardTitle>
            {userRole !== 'customer' && (
              <MagayaSyncButton
                packageId={pkg.id}
                magayaShipmentId={pkg.magayaShipmentId}
                size="sm"
                variant="ghost"
                showLabel={false}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-2">
            <p className="text-gray-600 text-sm">
              Tracking Number: <span className="font-medium">{pkg.trackingNumber}</span>
            </p>
            <p className="text-gray-600 text-sm">
              Date Received: <span className="font-medium">{formatDate(pkg.dateReceived)}</span>
            </p>
            {pkg.estimatedDelivery && (
              <p className="text-gray-600 text-sm">
                Estimated Delivery: <span className="font-medium">{formatDate(pkg.estimatedDelivery)}</span>
              </p>
            )}
            {pkg.customerName && userRole === 'admin' && (
              <p className="text-gray-600 text-sm">
                Customer: <span className="font-medium">{pkg.customerName}</span>
              </p>
            )}
          </div>

          {/* Magaya Status Section */}
          {(pkg.magayaShipmentId || userRole !== 'customer') && (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <MagayaStatusIndicator
                  magayaShipmentId={pkg.magayaShipmentId}
                  warehouseLocation={pkg.warehouseLocation}
                  consolidationStatus={pkg.consolidationStatus}
                  className="flex-1"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <Badge className={`text-xs font-medium ${statusColors[pkg.status]}`}>
              {getStatusLabel(pkg.status)}
            </Badge>
            {userRole !== 'customer' && onStatusUpdate && (
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-auto p-2"
                value={pkg.status}
                onChange={(e) => onStatusUpdate(pkg.id, e.target.value as PackageStatus)}
              >
                <option value="received">Received</option>
                <option value="in_transit">In Transit</option>
                <option value="arrived">Arrived</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="picked_up">Picked Up</option>
              </select>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {pkg.invoiceUploaded ? (
                <Button variant="secondary" size="sm" onClick={() => onViewInvoice && onViewInvoice(pkg.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Invoice
                </Button>
              ) : (
                userRole !== 'customer' && (
                  <Button variant="outline" size="sm" onClick={() => onUploadInvoice && onUploadInvoice(pkg.id)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Invoice
                  </Button>
                )
              )}
              {canRecordPickup(pkg) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPackageForPickup(convertToTableFormat(pkg))}
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Record Pickup
                </Button>
              )}
              {onViewDetails && (
                <Button variant="outline" size="sm" onClick={() => onViewDetails(pkg.id)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Details
                </Button>
              )}
            </div>
            {pkg.dutyAssessed && pkg.totalDue !== undefined && (
              <div className="text-right">
                <p className="text-gray-600 text-sm">
                  Total Due: <span className="font-medium">${pkg.totalDue.toFixed(2)}</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PickupVerificationModal
        package={selectedPackageForPickup}
        isOpen={!!selectedPackageForPickup}
        onClose={() => setSelectedPackageForPickup(null)}
        onSuccess={() => {
          console.log('Pickup recorded successfully');
        }}
      />
    </>
  );
};

export default PackageCard;
