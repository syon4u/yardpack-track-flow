
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Eye, Edit, ExternalLink, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { MagayaStatusIndicator } from './magaya/MagayaStatusIndicator';
import { MagayaSyncButton } from './magaya/MagayaSyncButton';
import PickupVerificationModal from './pickup/PickupVerificationModal';

type PackageStatus = Database['public']['Enums']['package_status'];

interface Package {
  id: string;
  tracking_number: string;
  description: string;
  status: PackageStatus;
  date_received: string;
  estimated_delivery?: string;
  invoices?: any[];
  total_due?: number;
  customer_name?: string;
  // Magaya fields
  magaya_shipment_id?: string | null;
  magaya_reference_number?: string | null;
  warehouse_location?: string | null;
  consolidation_status?: string | null;
}

interface PackageTableProps {
  packages: Package[];
  userRole: 'customer' | 'admin' | 'warehouse';
  onUploadInvoice?: (packageId: string) => void;
  onViewInvoice?: (packageId: string) => void;
  onViewDetails?: (packageId: string) => void;
}

const getStatusColor = (status: PackageStatus) => {
  switch (status) {
    case 'received':
      return 'bg-blue-100 text-blue-800';
    case 'in_transit':
      return 'bg-yellow-100 text-yellow-800';
    case 'arrived':
      return 'bg-green-100 text-green-800';
    case 'ready_for_pickup':
      return 'bg-purple-100 text-purple-800';
    case 'picked_up':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: PackageStatus) => {
  switch (status) {
    case 'received':
      return 'Received';
    case 'in_transit':
      return 'In Transit';
    case 'arrived':
      return 'Arrived';
    case 'ready_for_pickup':
      return 'Ready for Pickup';
    case 'picked_up':
      return 'Picked Up';
    default:
      return 'Unknown';
  }
};

const PackageTable: React.FC<PackageTableProps> = ({
  packages,
  userRole,
  onUploadInvoice,
  onViewInvoice,
  onViewDetails,
}) => {
  const [selectedPackageForPickup, setSelectedPackageForPickup] = useState<Package | null>(null);

  const canRecordPickup = (pkg: Package) => {
    return userRole !== 'customer' && pkg.status === 'ready_for_pickup';
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Received</TableHead>
              <TableHead>Estimated Delivery</TableHead>
              {userRole !== 'customer' && <TableHead>Magaya Status</TableHead>}
              <TableHead>Total Due</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-gray-500" />
                    {pkg.tracking_number}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{pkg.description}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(pkg.status)}>
                    {getStatusLabel(pkg.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {pkg.date_received ? new Date(pkg.date_received).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {pkg.estimated_delivery ? format(new Date(pkg.estimated_delivery), 'yyyy-MM-dd') : 'N/A'}
                </TableCell>
                {userRole !== 'customer' && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MagayaStatusIndicator
                        magayaShipmentId={pkg.magaya_shipment_id}
                        warehouseLocation={pkg.warehouse_location}
                        consolidationStatus={pkg.consolidation_status}
                      />
                      <MagayaSyncButton
                        packageId={pkg.id}
                        magayaShipmentId={pkg.magaya_shipment_id}
                        size="sm"
                        variant="ghost"
                        showLabel={false}
                      />
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  {pkg.total_due ? `$${pkg.total_due.toFixed(2)}` : 'N/A'}
                </TableCell>
                <TableCell>
                  {pkg.invoices && pkg.invoices.length > 0 ? (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {userRole === 'customer' && (
                      <>
                        {(!pkg.invoices || pkg.invoices.length === 0) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUploadInvoice?.(pkg.id)}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        )}
                        {pkg.invoices && pkg.invoices.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewInvoice?.(pkg.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                    {canRecordPickup(pkg) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPackageForPickup(pkg)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {onViewDetails && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails(pkg.id)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PickupVerificationModal
        package={selectedPackageForPickup}
        isOpen={!!selectedPackageForPickup}
        onClose={() => setSelectedPackageForPickup(null)}
        onSuccess={() => {
          // Package status will be automatically updated by the database trigger
          console.log('Pickup recorded successfully');
        }}
      />
    </>
  );
};

export default PackageTable;
