import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePackagesQuery } from '@/hooks/packages/usePackagesQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';
import PackageProcessFlow from '@/components/package/PackageProcessFlow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MagayaStatusIndicator } from '@/components/magaya/MagayaStatusIndicator';
import PickupRecordsTable from '@/components/pickup/PickupRecordsTable';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type PackageStatus = Database['public']['Enums']['package_status'];

const PackageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: packages, isLoading, error } = usePackagesQuery({});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h1>
            <Button onClick={() => navigate('/dashboard?tab=packages')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const packageData = packages?.find(pkg => pkg.id === id);

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h1>
            <p className="text-gray-600 mb-6">The package you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate('/dashboard?tab=packages')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

  const userRole = profile?.role as 'customer' | 'admin' | 'warehouse';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard?tab=packages')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <h1 className="text-2xl font-bold text-gray-900">Package Details</h1>
            </div>
          </div>
          <Badge className={statusColors[packageData.status]}>
            {getStatusLabel(packageData.status)}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Package Process Flow */}
          <PackageProcessFlow 
            packageData={packageData} 
            userRole={userRole}
            onStatusChange={() => {
              // The data will refresh automatically via React Query
              console.log('Package status updated');
            }}
          />

          <Separator />

          {/* Basic Package Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Package Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking Number:</span>
                  <span className="font-mono font-medium">{packageData.tracking_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{packageData.description}</span>
                </div>
                {packageData.external_tracking_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">External Tracking:</span>
                    <span className="font-mono">{packageData.external_tracking_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{packageData.customer_name}</span>
                </div>
                {packageData.customer_email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{packageData.customer_email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dates & Timeline</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Received:</span>
                  <span className="font-medium">{format(new Date(packageData.date_received), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                {packageData.estimated_delivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Delivery:</span>
                    <span className="font-medium">{format(new Date(packageData.estimated_delivery), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                {packageData.actual_delivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Delivery:</span>
                    <span className="font-medium">{format(new Date(packageData.actual_delivery), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                )}
                {packageData.last_notification_sent_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Notification:</span>
                    <span className="font-medium">{format(new Date(packageData.last_notification_sent_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Magaya Integration Status */}
          {userRole !== 'customer' && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-4">Warehouse Integration</h3>
                <MagayaStatusIndicator
                  magayaShipmentId={packageData.magaya_shipment_id}
                  warehouseLocation={packageData.warehouse_location}
                  consolidationStatus={packageData.consolidation_status}
                />
              </div>
            </>
          )}

          {/* Financial Information */}
          {(packageData.total_due || packageData.duty_amount || packageData.package_value) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-4">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {packageData.package_value && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Package Value</p>
                      <p className="text-xl font-semibold">${packageData.package_value.toFixed(2)}</p>
                    </div>
                  )}
                  {packageData.duty_amount && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Duty Amount</p>
                      <p className="text-xl font-semibold">${packageData.duty_amount.toFixed(2)}</p>
                    </div>
                  )}
                  {packageData.total_due && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Due</p>
                      <p className="text-xl font-semibold text-green-600">${packageData.total_due.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Pickup Verification Records */}
          {userRole !== 'customer' && (
            <>
              <Separator />
              <PickupRecordsTable
                packageId={packageData.id}
                onViewDetails={(recordId) => {
                  console.log('View pickup record details:', recordId);
                }}
              />
            </>
          )}

          {/* Additional Details */}
          {(packageData.notes || packageData.sender_name || packageData.sender_address) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-4">Additional Information</h3>
                <div className="space-y-3">
                  {packageData.sender_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sender:</span>
                      <span className="font-medium">{packageData.sender_name}</span>
                    </div>
                  )}
                  {packageData.sender_address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sender Address:</span>
                      <span className="text-right max-w-xs font-medium">{packageData.sender_address}</span>
                    </div>
                  )}
                  {packageData.notes && (
                    <div>
                      <span className="text-gray-600">Notes:</span>
                      <p className="mt-2 p-3 bg-gray-50 rounded-md text-sm">{packageData.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageDetailPage;