import React from 'react';
import { TableRow } from '@/components/ui/table';
import { Package, PackageStatus } from './types';
import PackageTrackingCell from './table-cells/PackageTrackingCell';
import PackageCustomerCell from './table-cells/PackageCustomerCell';
import PackageDescriptionCell from './table-cells/PackageDescriptionCell';
import PackageStatusCell from './table-cells/PackageStatusCell';
import { PackageDateReceivedCell, PackageEstimatedDeliveryCell } from './table-cells/PackageDatesCell';
import PackageValueCell from './table-cells/PackageValueCell';
import PackageDutyCell from './table-cells/PackageDutyCell';
import PackageWeightCell from './table-cells/PackageWeightCell';
import PackageCarrierCell from './table-cells/PackageCarrierCell';
import PackageMagayaCell from './table-cells/PackageMagayaCell';
import PackageTotalDueCell from './table-cells/PackageTotalDueCell';
import PackageInvoiceStatusCell from './table-cells/PackageInvoiceStatusCell';
import PackageActionsCell from './table-cells/PackageActionsCell';

interface PackageTableRowProps {
  package: Package;
  userRole: 'customer' | 'admin' | 'warehouse';
  onUploadInvoice?: (packageId: string) => void;
  onViewInvoice?: (packageId: string) => void;
  onViewDetails?: (packageId: string) => void;
  onRecordPickup?: (pkg: Package) => void;
  onStatusUpdate?: (packageId: string, status: PackageStatus) => void;
}

const PackageTableRow: React.FC<PackageTableRowProps> = ({
  package: pkg,
  userRole,
  onUploadInvoice,
  onViewInvoice,
  onViewDetails,
  onRecordPickup,
  onStatusUpdate,
}) => {
  return (
    <TableRow>
      <PackageTrackingCell 
        trackingNumber={pkg.tracking_number}
        externalTrackingNumber={pkg.external_tracking_number}
      />
      <PackageCustomerCell 
        customerName={pkg.customer_name}
        customerEmail={pkg.customer_email}
      />
      <PackageDescriptionCell 
        description={pkg.description}
        dimensions={pkg.dimensions}
      />
      <PackageStatusCell 
        status={pkg.status}
        userRole={userRole}
        packageId={pkg.id}
        onStatusUpdate={onStatusUpdate}
      />
      <PackageDateReceivedCell dateReceived={pkg.date_received} />
      <PackageEstimatedDeliveryCell estimatedDelivery={pkg.estimated_delivery} />
      <PackageValueCell packageValue={pkg.package_value} userRole={userRole} />
      <PackageDutyCell dutyAmount={pkg.duty_amount} userRole={userRole} />
      <PackageWeightCell weight={pkg.weight} userRole={userRole} />
      <PackageCarrierCell 
        carrier={pkg.carrier}
        senderName={pkg.sender_name}
        userRole={userRole}
      />
      <PackageMagayaCell 
        packageId={pkg.id}
        magayaShipmentId={pkg.magaya_shipment_id}
        warehouseLocation={pkg.warehouse_location}
        consolidationStatus={pkg.consolidation_status}
        userRole={userRole}
      />
      <PackageTotalDueCell totalDue={pkg.total_due} />
      <PackageInvoiceStatusCell invoices={pkg.invoices} />
      <PackageActionsCell 
        package={pkg}
        userRole={userRole}
        onUploadInvoice={onUploadInvoice}
        onViewInvoice={onViewInvoice}
        onViewDetails={onViewDetails}
        onRecordPickup={onRecordPickup}
      />
    </TableRow>
  );
};

export default PackageTableRow;