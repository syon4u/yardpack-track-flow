
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import PickupVerificationModal from './pickup/PickupVerificationModal';
import PackageTableHeader from './package/PackageTableHeader';
import PackageTableRow from './package/PackageTableRow';
import { Package, PackageStatus } from './package/types';


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
