import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Upload, Eye, ExternalLink, CheckCircle } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type PackageStatus = Database['public']['Enums']['package_status'];

interface Package {
  id: string;
  status: PackageStatus;
  invoices?: any[];
}

interface PackageActionsCellProps {
  package: Package;
  userRole: 'customer' | 'admin' | 'warehouse';
  onUploadInvoice?: (packageId: string) => void;
  onViewInvoice?: (packageId: string) => void;
  onViewDetails?: (packageId: string) => void;
  onRecordPickup?: (pkg: Package) => void;
}

const PackageActionsCell: React.FC<PackageActionsCellProps> = ({
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
  );
};

export default PackageActionsCell;