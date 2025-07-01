import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, Calendar, MapPin, DollarSign, FileText, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { MagayaStatusIndicator } from './magaya/MagayaStatusIndicator';
import PickupRecordsTable from './pickup/PickupRecordsTable';

type PackageRow = Database['public']['Tables']['packages']['Row'];
type PackageStatus = Database['public']['Enums']['package_status'];

interface PackageDetailModalProps {
  packageData: PackageRow | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'customer' | 'admin' | 'warehouse';
}

const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  packageData: pkg,
  isOpen,
  onClose,
  userRole,
}) => {
  if (!pkg) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package Details - {pkg.tracking_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Package Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Package Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={statusColors[pkg.status]}>
                    {getStatusLabel(pkg.status)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{pkg.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking Number:</span>
                  <span className="font-mono">{pkg.tracking_number}</span>
                </div>
                {pkg.external_tracking_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">External Tracking:</span>
                    <span className="font-mono">{pkg.external_tracking_number}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Dates & Delivery</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Received:</span>
                  <span>{format(new Date(pkg.date_received), 'MMM dd, yyyy')}</span>
                </div>
                {pkg.estimated_delivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Delivery:</span>
                    <span>{format(new Date(pkg.estimated_delivery), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                {pkg.actual_delivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Delivery:</span>
                    <span>{format(new Date(pkg.actual_delivery), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Magaya Integration Status */}
          {userRole !== 'customer' && (
            <>
              <div>
                <h3 className="font-semibold text-lg mb-3">Warehouse Integration</h3>
                <MagayaStatusIndicator
                  magayaShipmentId={pkg.magaya_shipment_id}
                  warehouseLocation={pkg.warehouse_location}
                  consolidationStatus={pkg.consolidation_status}
                />
              </div>
              <Separator />
            </>
          )}

          {/* Financial Information */}
          {(pkg.total_due || pkg.duty_amount || pkg.package_value) && (
            <>
              <div>
                <h3 className="font-semibold text-lg mb-3">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pkg.package_value && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Package Value</p>
                        <p className="font-medium">${pkg.package_value.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  {pkg.duty_amount && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Duty Amount</p>
                        <p className="font-medium">${pkg.duty_amount.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  {pkg.total_due && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Due</p>
                        <p className="font-medium text-green-600">${pkg.total_due.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Pickup Verification Records */}
          {userRole !== 'customer' && (
            <>
              <PickupRecordsTable
                packageId={pkg.id}
                onViewDetails={(recordId) => {
                  console.log('View pickup record details:', recordId);
                }}
              />
              <Separator />
            </>
          )}

          {/* Additional Details */}
          {(pkg.notes || pkg.sender_name || pkg.sender_address) && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Additional Information</h3>
              <div className="space-y-2">
                {pkg.sender_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sender:</span>
                    <span>{pkg.sender_name}</span>
                  </div>
                )}
                {pkg.sender_address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sender Address:</span>
                    <span className="text-right max-w-xs">{pkg.sender_address}</span>
                  </div>
                )}
                {pkg.notes && (
                  <div>
                    <span className="text-gray-600">Notes:</span>
                    <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{pkg.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackageDetailModal;
