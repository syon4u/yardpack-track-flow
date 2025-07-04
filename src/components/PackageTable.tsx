
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Database } from '@/integrations/supabase/types';
import PickupVerificationModal from './pickup/PickupVerificationModal';
import PackageTableHeader from './package/PackageTableHeader';
import PackageTableRow from './package/PackageTableRow';

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
  customer_email?: string;
  package_value?: number;
  duty_amount?: number;
  weight?: number;
  dimensions?: string;
  sender_name?: string;
  external_tracking_number?: string;
  carrier?: string;
  notes?: string;
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
  onStatusUpdate?: (packageId: string, status: PackageStatus) => void;
}

const PackageTable: React.FC<PackageTableProps> = ({
  packages,
  userRole,
  onUploadInvoice,
  onViewInvoice,
  onViewDetails,
  onStatusUpdate,
}) => {
  const [selectedPackageForPickup, setSelectedPackageForPickup] = useState<Package | null>(null);

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <PackageTableHeader userRole={userRole} />
          <TableBody>
            {packages.map((pkg) => (
              <PackageTableRow
                key={pkg.id}
                package={pkg}
                userRole={userRole}
                onUploadInvoice={onUploadInvoice}
                onViewInvoice={onViewInvoice}
                onViewDetails={onViewDetails}
                onRecordPickup={setSelectedPackageForPickup}
                onStatusUpdate={onStatusUpdate}
              />
            ))}
          </TableBody>
        </Table>
      </div>

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

export default PackageTable;
