import React from 'react';
import { MoreHorizontal, Eye, Edit, Upload, Download, CheckCircle, RefreshCw, Trash2, FileText, History } from 'lucide-react';
import { PackageRowData } from '@/types/packageTableRow';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface PackageActionsMenuProps {
  package: PackageRowData;
  userRole: 'customer' | 'admin' | 'warehouse';
  onViewDetails?: (packageId: string) => void;
  onEditPackage?: (packageId: string) => void;
  onUploadReceipt?: (packageId: string) => void;
  onViewReceipt?: (packageId: string) => void;
  onRecordPickup?: (pkg: PackageRowData) => void;
  onSyncMagaya?: (packageId: string) => void;
  onDeletePackage?: (packageId: string) => void;
  onGenerateInvoice?: (packageId: string) => void;
  onViewHistory?: (packageId: string) => void;
}

const PackageActionsMenu: React.FC<PackageActionsMenuProps> = ({
  package: pkg,
  userRole,
  onViewDetails,
  onEditPackage,
  onUploadReceipt,
  onViewReceipt,
  onRecordPickup,
  onSyncMagaya,
  onDeletePackage,
  onGenerateInvoice,
  onViewHistory,
}) => {
  const canRecordPickup = userRole !== 'customer' && pkg.status === 'ready_for_pickup';
  const isAdmin = userRole === 'admin';
  const isCustomer = userRole === 'customer';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background border z-50">
        {onViewDetails && (
          <DropdownMenuItem onClick={() => onViewDetails(pkg.id)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        
        {isAdmin && onEditPackage && (
          <DropdownMenuItem onClick={() => onEditPackage(pkg.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Package
          </DropdownMenuItem>
        )}

        {onViewHistory && (
          <DropdownMenuItem onClick={() => onViewHistory(pkg.id)}>
            <History className="mr-2 h-4 w-4" />
            View History
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Receipt/Invoice Actions */}
        {isCustomer && (
          <>
            {(!pkg.invoices || pkg.invoices.length === 0) && onUploadReceipt && (
              <DropdownMenuItem onClick={() => onUploadReceipt(pkg.id)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Receipt
              </DropdownMenuItem>
            )}
            {pkg.invoices && pkg.invoices.length > 0 && onViewReceipt && (
              <DropdownMenuItem onClick={() => onViewReceipt(pkg.id)}>
                <Download className="mr-2 h-4 w-4" />
                View Receipt
              </DropdownMenuItem>
            )}
          </>
        )}

        {isAdmin && onGenerateInvoice && (
          <DropdownMenuItem onClick={() => onGenerateInvoice(pkg.id)}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Invoice
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Operational Actions */}
        {canRecordPickup && onRecordPickup && (
          <DropdownMenuItem onClick={() => onRecordPickup(pkg)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Record Pickup
          </DropdownMenuItem>
        )}

        {!isCustomer && onSyncMagaya && (
          <DropdownMenuItem onClick={() => onSyncMagaya(pkg.id)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Magaya
          </DropdownMenuItem>
        )}

        {isAdmin && onDeletePackage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDeletePackage(pkg.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Package
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PackageActionsMenu;