import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload, Eye, ExternalLink, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { MagayaStatusIndicator } from '../magaya/MagayaStatusIndicator';
import { MagayaSyncButton } from '../magaya/MagayaSyncButton';
import PackageStatusBadge from './PackageStatusBadge';

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
  onUploadInvoice?: (packageId: string) => void;
  onViewInvoice?: (packageId: string) => void;
  onViewDetails?: (packageId: string) => void;
  onRecordPickup?: (pkg: Package) => void;
}

const PackageTableRow: React.FC<PackageTableRowProps> = ({
  package: pkg,
  userRole,
  onUploadInvoice,
  onViewInvoice,
  onViewDetails,
  onRecordPickup,
}) => {
  const canRecordPickup = (pkg: Package) => {
    return userRole !== 'customer' && pkg.status === 'ready_for_pickup';
  };

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
              onClick={() => onRecordPickup?.(pkg)}
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
  );
};

export default PackageTableRow;