
import React, { useState } from 'react';
import { usePackages, useUpdatePackageStatus } from '@/hooks/usePackages';
import { useUploadReceipt, useDownloadReceipt } from '@/hooks/useInvoices';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PackageCard from './PackageCard';
import PackageTable from './PackageTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Package } from './PackageCard';
import CardSkeleton from './loading/CardSkeleton';
import TableSkeleton from './loading/TableSkeleton';
import ErrorBoundary from './error/ErrorBoundary';
import { Database } from '@/integrations/supabase/types';

type PackageStatus = Database['public']['Enums']['package_status'];

interface PackageListProps {
  searchTerm?: string;
  statusFilter?: string;
  viewMode?: 'tiles' | 'table';
  onViewModeChange?: (mode: 'tiles' | 'table') => void;
  customerFilter?: string;
  itemsPerPage?: number;
}

const PackageList: React.FC<PackageListProps> = ({ 
  searchTerm, 
  statusFilter, 
  viewMode = 'tiles',
  onViewModeChange,
  customerFilter,
  itemsPerPage
}) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: packages, isPending, error } = usePackages({ searchTerm, statusFilter, customerFilter });
  const updateStatusMutation = useUpdatePackageStatus();
  const uploadReceiptMutation = useUploadReceipt();
  const downloadReceiptMutation = useDownloadReceipt();

  const handleStatusUpdate = async (packageId: string, status: PackageStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ packageId, status });
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleUploadReceipt = async (packageId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await uploadReceiptMutation.mutateAsync({ packageId, file });
        } catch (error) {
          // Error handling is done by the mutation
        }
      }
    };
    input.click();
  };

  const handleViewReceipt = async (packageId: string) => {
    const pkg = packages?.find(p => p.id === packageId);
    if (pkg && pkg.invoices && pkg.invoices.length > 0) {
      try {
        await downloadReceiptMutation.mutateAsync(pkg.invoices[0].file_path);
      } catch (error) {
        // Error handling is done by the mutation
      }
    }
  };

  const handleViewDetails = (packageId: string) => {
    navigate(`/package/${packageId}`);
  };

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const packagesPerPage = itemsPerPage || (viewMode === 'table' ? 10 : 12);
  const totalPages = Math.ceil((packages?.length || 0) / packagesPerPage);
  const startIndex = (currentPage - 1) * packagesPerPage;
  const paginatedPackages = packages?.slice(startIndex, startIndex + packagesPerPage) || [];

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, customerFilter]);

  if (isPending) {
    return (
      <div className="space-y-4">
        {onViewModeChange && (
          <div className="flex justify-end">
            <div className="flex border rounded-lg">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        )}
        {viewMode === 'tiles' ? (
          <CardSkeleton count={6} variant="package" />
        ) : (
          <TableSkeleton rows={6} columns={5} />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading packages. Please try again.</p>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          {searchTerm || statusFilter !== 'all' 
            ? 'No packages found matching your filters.' 
            : 'No packages found.'}
        </p>
        {profile?.role === 'customer' && !searchTerm && statusFilter === 'all' && (
          <p className="text-sm text-gray-500 mt-2">
            Contact YardPack to add your first package.
          </p>
        )}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* View Mode Toggle */}
        {onViewModeChange && (
          <div className="flex justify-end">
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'tiles' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('tiles')}
                className="rounded-r-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('table')}
                className="rounded-l-none"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Package Content */}
        {viewMode === 'tiles' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={{
                  id: pkg.id,
                  trackingNumber: pkg.tracking_number,
                  description: pkg.description,
                  status: pkg.status,
                  dateReceived: pkg.date_received,
                  estimatedDelivery: pkg.estimated_delivery || undefined,
                  receiptUploaded: pkg.receipt_uploaded,
                  dutyAssessed: pkg.duty_amount !== null,
                  totalDue: pkg.total_due || undefined,
                  customerName: pkg.customer_name,
                  // Magaya fields
                  magayaShipmentId: pkg.magaya_shipment_id,
                  magayaReferenceNumber: pkg.magaya_reference_number,
                  warehouseLocation: pkg.warehouse_location,
                  consolidationStatus: pkg.consolidation_status,
                }}
                userRole={profile?.role as 'customer' | 'admin' | 'warehouse' || 'customer'}
                onStatusUpdate={handleStatusUpdate}
                onUploadReceipt={handleUploadReceipt}
                onViewReceipt={handleViewReceipt}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <PackageTable
            packages={paginatedPackages}
            userRole={profile?.role as 'customer' | 'admin' | 'warehouse' || 'customer'}
            onUploadReceipt={handleUploadReceipt}
            onViewReceipt={handleViewReceipt}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + packagesPerPage, packages?.length || 0)} of {packages?.length || 0} packages
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default PackageList;
