
import React, { useState } from 'react';
import { usePackages, useUpdatePackageStatus } from '@/hooks/usePackages';
import { useUploadInvoice, useDownloadInvoice } from '@/hooks/useInvoices';
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
}

const PackageList: React.FC<PackageListProps> = ({ 
  searchTerm, 
  statusFilter, 
  viewMode = 'tiles',
  onViewModeChange 
}) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: packages, isPending, error } = usePackages({ searchTerm, statusFilter });
  const updateStatusMutation = useUpdatePackageStatus();
  const uploadInvoiceMutation = useUploadInvoice();
  const downloadInvoiceMutation = useDownloadInvoice();

  const handleStatusUpdate = async (packageId: string, status: PackageStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ packageId, status });
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleUploadInvoice = async (packageId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await uploadInvoiceMutation.mutateAsync({ packageId, file });
        } catch (error) {
          // Error handling is done by the mutation
        }
      }
    };
    input.click();
  };

  const handleViewInvoice = async (packageId: string) => {
    const pkg = packages?.find(p => p.id === packageId);
    if (pkg && pkg.invoices && pkg.invoices.length > 0) {
      try {
        await downloadInvoiceMutation.mutateAsync(pkg.invoices[0].file_path);
      } catch (error) {
        // Error handling is done by the mutation
      }
    }
  };

  const handleViewDetails = (packageId: string) => {
    navigate(`/package/${packageId}`);
  };

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
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={{
                  id: pkg.id,
                  trackingNumber: pkg.tracking_number,
                  description: pkg.description,
                  status: pkg.status,
                  dateReceived: pkg.date_received,
                  estimatedDelivery: pkg.estimated_delivery || undefined,
                  invoiceUploaded: pkg.invoices && pkg.invoices.length > 0,
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
                onUploadInvoice={handleUploadInvoice}
                onViewInvoice={handleViewInvoice}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <PackageTable
            packages={packages}
            userRole={profile?.role as 'customer' | 'admin' | 'warehouse' || 'customer'}
            onUploadInvoice={handleUploadInvoice}
            onViewInvoice={handleViewInvoice}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default PackageList;
