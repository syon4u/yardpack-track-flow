import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { MagayaStatusIndicator } from '../magaya/MagayaStatusIndicator';
import PackageStatusBadge from './PackageStatusBadge';
import PackageActionsMenu from './PackageActionsMenu';

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

interface PackageTableRowProps {
  package: Package;
  userRole: 'customer' | 'admin' | 'warehouse';
  onUploadReceipt?: (packageId: string) => void;
  onViewReceipt?: (packageId: string) => void;
  onViewDetails?: (packageId: string) => void;
  onRecordPickup?: (pkg: Package) => void;
  onEditPackage?: (packageId: string) => void;
  onSyncMagaya?: (packageId: string) => void;
  onDeletePackage?: (packageId: string) => void;
  onGenerateInvoice?: (packageId: string) => void;
  onViewHistory?: (packageId: string) => void;
}

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
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="font-mono text-sm">{pkg.tracking_number}</span>
          {pkg.external_tracking_number && (
            <span className="text-xs text-muted-foreground">
              Ext: {pkg.external_tracking_number}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{pkg.customer_name}</span>
          {pkg.customer_email && (
            <span className="text-xs text-muted-foreground">{pkg.customer_email}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="max-w-xs">
        <div className="flex flex-col">
          <span className="truncate">{pkg.description}</span>
          {pkg.dimensions && (
            <span className="text-xs text-muted-foreground">{pkg.dimensions}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <PackageStatusBadge status={pkg.status} />
      </TableCell>
      <TableCell>
        {pkg.date_received ? new Date(pkg.date_received).toLocaleDateString() : 'N/A'}
      </TableCell>
      <TableCell>
        {pkg.estimated_delivery ? format(new Date(pkg.estimated_delivery), 'yyyy-MM-dd') : 'N/A'}
      </TableCell>
      {userRole !== 'customer' && (
        <TableCell>
          {pkg.package_value ? `$${pkg.package_value.toFixed(2)}` : 'N/A'}
        </TableCell>
      )}
      {userRole !== 'customer' && (
        <TableCell>
          {pkg.duty_amount ? `$${pkg.duty_amount.toFixed(2)}` : 'N/A'}
        </TableCell>
      )}
      {userRole !== 'customer' && (
        <TableCell>
          {pkg.weight ? `${pkg.weight} lbs` : 'N/A'}
        </TableCell>
      )}
      {userRole !== 'customer' && (
        <TableCell>
          <div className="flex flex-col">
            <span>{pkg.carrier || 'N/A'}</span>
            {pkg.sender_name && (
              <span className="text-xs text-muted-foreground">From: {pkg.sender_name}</span>
            )}
          </div>
        </TableCell>
      )}
      {userRole !== 'customer' && (
        <TableCell>
          <div className="flex items-center gap-2">
            <MagayaStatusIndicator
              magayaShipmentId={pkg.magaya_shipment_id}
              warehouseLocation={pkg.warehouse_location}
              consolidationStatus={pkg.consolidation_status}
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