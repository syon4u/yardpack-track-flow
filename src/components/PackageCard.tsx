import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Package, Upload, Eye, Edit, ExternalLink, CheckCircle, Truck, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { MagayaStatusIndicator } from './magaya/MagayaStatusIndicator';
import { MagayaSyncButton } from './magaya/MagayaSyncButton';
import PickupVerificationModal from './pickup/PickupVerificationModal';
import { MobileOptimizedCard, MobileOptimizedCardHeader, MobileOptimizedCardContent } from './ui/mobile-optimized-card';
import { useIsMobile } from '@/hooks/use-mobile';

// Use the actual database enum type
type PackageStatus = Database['public']['Enums']['package_status'];

export interface Package {
  id: string;
  trackingNumber: string;
  description: string;
  status: PackageStatus;
  dateReceived: string;
  estimatedDelivery?: string;
  receiptUploaded: boolean;
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
  onUploadReceipt?: (packageId: string) => void;
  onViewReceipt?: (packageId: string) => void;
  onViewDetails?: (packageId: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  userRole,
  onStatusUpdate,
  onUploadReceipt,
  onViewReceipt,
  onViewDetails
}) => {
  const [selectedPackageForPickup, setSelectedPackageForPickup] = useState<any>(null);
  const isMobile = useIsMobile();

  const statusColors = {
    received: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    in_transit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    arrived: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    ready_for_pickup: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    picked_up: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };

  const statusIcons = {
    received: Package,
    in_transit: Truck,
    arrived: MapPin,
    ready_for_pickup: CheckCircle,
    picked_up: CheckCircle,
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

  // Swipe actions for mobile
  const swipeActions = isMobile ? {
    right: () => onViewDetails && onViewDetails(pkg.id),
    left: () => {
      if (pkg.receiptUploaded && onViewReceipt) {
        onViewReceipt(pkg.id);
      } else if (!pkg.receiptUploaded && userRole === 'customer' && onUploadReceipt) {
        onUploadReceipt(pkg.id);
      }
    }
  } : undefined;

  const StatusIcon = statusIcons[pkg.status];

  return (
    <>
      <MobileOptimizedCard 
        className={`shadow-md overflow-hidden transition-transform duration-200 ${
          pkg.status === 'ready_for_pickup' ? 'animate-pulse-glow' : ''
        }`}
        swipeActions={swipeActions}
        interactive={true}
        hapticFeedback={true}
      >
        <MobileOptimizedCardHeader
          actions={userRole !== 'customer' ? (
            <MagayaSyncButton
              packageId={pkg.id}
              magayaShipmentId={pkg.magayaShipmentId}
              size="sm"
              variant="ghost"
              showLabel={false}
            />
          ) : undefined}
        >
          <div className="space-y-1">
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold line-clamp-2`}>
              {pkg.description}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs font-medium flex items-center gap-1 ${statusColors[pkg.status]}`}>
                <StatusIcon className="h-3 w-3" />
                {getStatusLabel(pkg.status)}
              </Badge>
              {pkg.status === 'ready_for_pickup' && (
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        </MobileOptimizedCardHeader>
        <MobileOptimizedCardContent>
          {/* Package Details */}
          <div className={`space-y-2 ${isMobile ? 'text-sm' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tracking:</span>
              <span className="font-medium font-mono text-xs">{pkg.trackingNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Received:
              </span>
              <span className="font-medium">{formatDate(pkg.dateReceived)}</span>
            </div>
            {pkg.estimatedDelivery && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Est. Delivery:
                </span>
                <span className="font-medium">{formatDate(pkg.estimatedDelivery)}</span>
              </div>
            )}
            {pkg.customerName && userRole === 'admin' && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{pkg.customerName}</span>
              </div>
            )}
            {pkg.dutyAssessed && pkg.totalDue !== undefined && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-muted-foreground font-medium">Total Due:</span>
                <span className="font-bold text-orange-600">${pkg.totalDue.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Magaya Status Section */}
          {(pkg.magayaShipmentId || userRole !== 'customer') && (
            <div className="my-3 p-2 bg-muted/50 rounded-lg">
              <MagayaStatusIndicator
                magayaShipmentId={pkg.magayaShipmentId}
                warehouseLocation={pkg.warehouseLocation}
                consolidationStatus={pkg.consolidationStatus}
                className="text-xs"
              />
            </div>
          )}

          {/* Admin Status Update */}
          {userRole !== 'customer' && onStatusUpdate && (
            <div className="my-3">
              <select
                className={`w-full bg-background border border-input text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary p-2 ${isMobile ? 'touch-target' : ''}`}
                value={pkg.status}
                onChange={(e) => onStatusUpdate(pkg.id, e.target.value as PackageStatus)}
              >
                <option value="received">Received</option>
                <option value="in_transit">In Transit</option>
                <option value="arrived">Arrived</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="picked_up">Picked Up</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`flex gap-2 pt-3 border-t ${isMobile ? 'flex-col' : 'flex-wrap'}`}>
            {userRole === 'customer' && (
              <>
                {pkg.receiptUploaded ? (
                  <Button 
                    variant="secondary" 
                    size={isMobile ? "default" : "sm"} 
                    onClick={() => onViewReceipt && onViewReceipt(pkg.id)}
                    className={`${isMobile ? 'touch-target w-full' : ''} animate-fade-in`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Receipt
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size={isMobile ? "default" : "sm"} 
                    onClick={() => onUploadReceipt && onUploadReceipt(pkg.id)}
                    className={`${isMobile ? 'touch-target w-full' : ''} animate-fade-in`}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Receipt
                  </Button>
                )}
              </>
            )}
            
            {canRecordPickup(pkg) && (
              <Button
                variant="outline"
                size={isMobile ? "default" : "sm"}
                onClick={() => setSelectedPackageForPickup(convertToTableFormat(pkg))}
                className={`text-green-600 hover:text-green-700 ${isMobile ? 'touch-target w-full' : ''} animate-fade-in`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Record Pickup
              </Button>
            )}
            
            {onViewDetails && (
              <Button 
                variant="outline" 
                size={isMobile ? "default" : "sm"} 
                onClick={() => onViewDetails(pkg.id)}
                className={`${isMobile ? 'touch-target w-full' : ''} animate-fade-in`}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Details
              </Button>
            )}
          </div>

          {/* Mobile Swipe Instructions */}
          {isMobile && (
            <div className="text-xs text-muted-foreground text-center mt-2 animate-fade-in" style={{ animationDelay: '500ms' }}>
              ← Swipe for receipt • Swipe for details →
            </div>
          )}
        </MobileOptimizedCardContent>
      </MobileOptimizedCard>

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
