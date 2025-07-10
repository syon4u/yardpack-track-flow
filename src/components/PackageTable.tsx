
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PickupVerificationModal from './pickup/PickupVerificationModal';
import PackageTableHeader from './package/PackageTableHeader';
import PackageTableRow from './package/PackageTableRow';
import TableColumnSelector from '@/components/ui/table-column-selector';
import { useTableColumns } from '@/hooks/useTableColumns';
import { Package, PackageStatus } from './package/types';


interface PackageTableProps {
  packages: Package[];
  userRole: 'customer' | 'admin' | 'warehouse';
  onUploadInvoice?: (packageId: string) => void;
  onViewInvoice?: (packageId: string) => void;
  onViewDetails?: (packageId: string) => void;
  onStatusUpdate?: (packageId: string, status: PackageStatus) => void;
  showColumnSelector?: boolean;
  title?: string;
}

const PackageTable: React.FC<PackageTableProps> = ({
  packages,
  userRole,
  onUploadInvoice,
  onViewInvoice,
  onViewDetails,
  onStatusUpdate,
  showColumnSelector = false,
  title,
}) => {
  const [selectedPackageForPickup, setSelectedPackageForPickup] = useState<Package | null>(null);

  // Define package table columns based on user role
  const getDefaultColumns = () => {
    const baseColumns = [
      { id: 'tracking', label: 'Tracking Number', visible: true, required: true },
      { id: 'customer', label: 'Customer', visible: true },
      { id: 'description', label: 'Description', visible: true },
      { id: 'status', label: 'Status', visible: true, required: true },
      { id: 'dateReceived', label: 'Date Received', visible: true },
      { id: 'estimatedDelivery', label: 'Est. Delivery', visible: true },
      { id: 'totalDue', label: 'Total Due', visible: true },
      { id: 'invoice', label: 'Invoice', visible: true },
      { id: 'actions', label: 'Actions', visible: true, required: true },
    ];

    // Add admin/warehouse only columns
    if (userRole !== 'customer') {
      baseColumns.splice(6, 0, 
        { id: 'packageValue', label: 'Package Value', visible: false },
        { id: 'dutyAmount', label: 'Duty Amount', visible: false },
        { id: 'weight', label: 'Weight', visible: false },
        { id: 'carrier', label: 'Carrier', visible: false },
        { id: 'magayaStatus', label: 'Magaya Status', visible: false }
      );
    }

    return baseColumns;
  };

  const { columns, updateColumns, isColumnVisible } = useTableColumns({
    defaultColumns: getDefaultColumns(),
    storageKey: `package-table-columns-${userRole}`,
  });

  const content = (
    <div className="border rounded-lg">
      <Table>
        <PackageTableHeader 
          userRole={userRole} 
          isColumnVisible={isColumnVisible}
        />
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
              isColumnVisible={isColumnVisible}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      {showColumnSelector && title ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {title}
              <TableColumnSelector 
                columns={columns} 
                onColumnChange={updateColumns}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {content}
          </CardContent>
        </Card>
      ) : (
        content
      )}

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
