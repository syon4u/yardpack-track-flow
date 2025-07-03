import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { PackageTableRowProps } from '@/types/packageTableRow';
import PackageActionsMenu from './PackageActionsMenu';
import {
  TrackingCell,
  CustomerCell,
  DescriptionCell,
  StatusCell,
  DateCell,
  EstimatedDeliveryCell,
  ValueCell,
  WeightCell,
  CarrierCell,
  MagayaCell,
  ReceiptStatusCell,
} from './PackageTableCell';

const PackageTableRow: React.FC<PackageTableRowProps> = ({
  package: pkg,
  userRole,
  onUploadReceipt,
  onViewReceipt,
  onViewDetails,
  onRecordPickup,
  onEditPackage,
  onSyncMagaya,
  onDeletePackage,
  onGenerateInvoice,
  onViewHistory,
}) => {
  return (
    <TableRow>
      <TrackingCell package={pkg} />
      <CustomerCell package={pkg} />
      <DescriptionCell package={pkg} />
      <StatusCell status={pkg.status} />
      <DateCell date={pkg.date_received} />
      <EstimatedDeliveryCell estimatedDelivery={pkg.estimated_delivery} />
      
      {userRole !== 'customer' && (
        <ValueCell value={pkg.package_value} />
      )}
      {userRole !== 'customer' && (
        <ValueCell value={pkg.duty_amount} />
      )}
      {userRole !== 'customer' && (
        <WeightCell weight={pkg.weight} />
      )}
      {userRole !== 'customer' && (
        <CarrierCell package={pkg} />
      )}
      {userRole !== 'customer' && (
        <MagayaCell package={pkg} />
      )}
      
      <ValueCell value={pkg.total_due} />
      <ReceiptStatusCell invoices={pkg.invoices} />
      
      <TableCell>
        <PackageActionsMenu
          package={pkg}
          userRole={userRole}
          onViewDetails={onViewDetails}
          onEditPackage={onEditPackage}
          onUploadReceipt={onUploadReceipt}
          onViewReceipt={onViewReceipt}
          onRecordPickup={onRecordPickup}
          onSyncMagaya={onSyncMagaya}
          onDeletePackage={onDeletePackage}
          onGenerateInvoice={onGenerateInvoice}
          onViewHistory={onViewHistory}
        />
      </TableCell>
    </TableRow>
  );
};

export default PackageTableRow;