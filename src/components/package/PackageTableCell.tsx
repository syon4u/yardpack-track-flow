import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import PackageStatusBadge from './PackageStatusBadge';
import { MagayaStatusIndicator } from '../magaya/MagayaStatusIndicator';
import { Database } from '@/integrations/supabase/types';

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

interface TrackingCellProps {
  package: Package;
}

export const TrackingCell: React.FC<TrackingCellProps> = ({ package: pkg }) => (
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
);

interface CustomerCellProps {
  package: Package;
}

export const CustomerCell: React.FC<CustomerCellProps> = ({ package: pkg }) => (
  <TableCell>
    <div className="flex flex-col">
      <span className="font-medium">{pkg.customer_name}</span>
      {pkg.customer_email && (
        <span className="text-xs text-muted-foreground">{pkg.customer_email}</span>
      )}
    </div>
  </TableCell>
);

interface DescriptionCellProps {
  package: Package;
}

export const DescriptionCell: React.FC<DescriptionCellProps> = ({ package: pkg }) => (
  <TableCell className="max-w-xs">
    <div className="flex flex-col">
      <span className="truncate">{pkg.description}</span>
      {pkg.dimensions && (
        <span className="text-xs text-muted-foreground">{pkg.dimensions}</span>
      )}
    </div>
  </TableCell>
);

interface StatusCellProps {
  status: PackageStatus;
}

export const StatusCell: React.FC<StatusCellProps> = ({ status }) => (
  <TableCell>
    <PackageStatusBadge status={status} />
  </TableCell>
);

interface DateCellProps {
  date: string;
  label?: string;
}

export const DateCell: React.FC<DateCellProps> = ({ date, label }) => (
  <TableCell>
    {date ? new Date(date).toLocaleDateString() : 'N/A'}
  </TableCell>
);

interface EstimatedDeliveryCellProps {
  estimatedDelivery?: string;
}

export const EstimatedDeliveryCell: React.FC<EstimatedDeliveryCellProps> = ({ estimatedDelivery }) => (
  <TableCell>
    {estimatedDelivery ? format(new Date(estimatedDelivery), 'yyyy-MM-dd') : 'N/A'}
  </TableCell>
);

interface ValueCellProps {
  value?: number;
  prefix?: string;
  suffix?: string;
}

export const ValueCell: React.FC<ValueCellProps> = ({ value, prefix = '$', suffix = '' }) => (
  <TableCell>
    {value ? `${prefix}${value.toFixed(2)}${suffix}` : 'N/A'}
  </TableCell>
);

interface WeightCellProps {
  weight?: number;
}

export const WeightCell: React.FC<WeightCellProps> = ({ weight }) => (
  <TableCell>
    {weight ? `${weight} lbs` : 'N/A'}
  </TableCell>
);

interface CarrierCellProps {
  package: Package;
}

export const CarrierCell: React.FC<CarrierCellProps> = ({ package: pkg }) => (
  <TableCell>
    <div className="flex flex-col">
      <span>{pkg.carrier || 'N/A'}</span>
      {pkg.sender_name && (
        <span className="text-xs text-muted-foreground">From: {pkg.sender_name}</span>
      )}
    </div>
  </TableCell>
);

interface MagayaCellProps {
  package: Package;
}

export const MagayaCell: React.FC<MagayaCellProps> = ({ package: pkg }) => (
  <TableCell>
    <div className="flex items-center gap-2">
      <MagayaStatusIndicator
        magayaShipmentId={pkg.magaya_shipment_id}
        warehouseLocation={pkg.warehouse_location}
        consolidationStatus={pkg.consolidation_status}
      />
    </div>
  </TableCell>
);

interface ReceiptStatusCellProps {
  invoices?: any[];
}

export const ReceiptStatusCell: React.FC<ReceiptStatusCellProps> = ({ invoices }) => (
  <TableCell>
    {invoices && invoices.length > 0 ? (
      <Badge variant="outline" className="text-green-600 border-green-300">
        Uploaded
      </Badge>
    ) : (
      <Badge variant="outline" className="text-orange-600 border-orange-300">
        Pending
      </Badge>
    )}
  </TableCell>
);