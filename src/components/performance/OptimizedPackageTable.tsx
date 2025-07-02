
import React, { useState, useMemo } from 'react';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';
import { VirtualizedTable } from './VirtualizedTable';
import { PaginationControls } from './PaginationControls';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { getStatusConfig } from '@/utils/dataTransforms';
import { useDebounce } from '@/hooks/useDebounce';

// Define the expected data type for the table
interface OptimizedPackageData {
  id: string;
  tracking_number: string;
  external_tracking_number: string | null;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  date_received: string;
  estimated_delivery: string | null;
  delivery_estimate: string | null;
  actual_delivery: string | null;
  customer_id: string;
  customer_name: string;
  customer_email: string | null;
  sender_name: string | null;
  sender_address: string | null;
  delivery_address: string;
  carrier: string | null;
  weight: number | null;
  dimensions: string | null;
  package_value: number | null;
  duty_amount: number | null;
  duty_rate: number | null;
  total_due: number | null;
  invoice_uploaded: boolean;
  duty_assessed: boolean;
  notes: string | null;
  api_sync_status: string | null;
  last_api_sync: string | null;
  customers: any;
  invoices: any[];
}

interface OptimizedPackageTableProps {
  customerId?: string;
  onPackageClick?: (packageItem: OptimizedPackageData) => void;
}

export const OptimizedPackageTable: React.FC<OptimizedPackageTableProps> = ({
  customerId,
  onPackageClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch optimized packages - destructure the query result properly
  const {
    data: queryResult,
    isPending,
    error,
  } = useOptimizedPackages(
    {
      searchTerm: debouncedSearchTerm,
      statusFilter,
      customerId,
    },
    {
      page: currentPage,
      limit: pageSize,
    }
  );

  const packages = queryResult?.data || [];
  const pagination = queryResult ? {
    page: currentPage,
    totalPages: Math.ceil(queryResult.total / pageSize),
    total: queryResult.total,
    hasMore: queryResult.hasMore
  } : null;

  // Define table columns - use OptimizedPackageData type
  const columns = useMemo(() => [
    {
      key: 'tracking_number',
      header: 'Tracking Number',
      width: 150,
      render: (pkg: OptimizedPackageData) => (
        <span className="font-mono text-sm font-medium">{pkg.tracking_number}</span>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      width: 200,
      render: (pkg: OptimizedPackageData) => (
        <div>
          <div className="font-medium">{pkg.customer_name}</div>
          {pkg.customer_email && (
            <div className="text-xs text-muted-foreground">{pkg.customer_email}</div>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      width: 250,
      render: (pkg: OptimizedPackageData) => (
        <span className="text-sm">{pkg.description}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 150,
      render: (pkg: OptimizedPackageData) => {
        const statusConfig = getStatusConfig(pkg.status as any);
        return (
          <Badge 
            variant="outline"
            className={`${statusConfig.bgColor} ${statusConfig.textColor} border-transparent`}
          >
            {statusConfig.label}
          </Badge>
        );
      },
    },
    {
      key: 'package_value',
      header: 'Value',
      width: 100,
      render: (pkg: OptimizedPackageData) => (
        <span className="text-sm font-medium">
          {pkg.package_value ? `$${pkg.package_value.toFixed(2)}` : '-'}
        </span>
      ),
    },
    {
      key: 'date_received',
      header: 'Date Received',
      width: 120,
      render: (pkg: OptimizedPackageData) => (
        <span className="text-sm">
          {new Date(pkg.date_received).toLocaleDateString()}
        </span>
      ),
    },
  ], []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Prefetch next page when user navigates
    if (page === currentPage + 1) {
      // prefetchNextPage();  // prefetchNextPage is not defined anymore
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading packages: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="arrived">Arrived</SelectItem>
              <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
              <SelectItem value="picked_up">Picked Up</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {isPending && (
        <div className="text-center py-8 text-muted-foreground">
          Loading packages...
        </div>
      )}

      {/* Table */}
      {!isPending && (
        <>
          <VirtualizedTable
            data={packages}
            columns={columns}
            itemHeight={80}
            height={600}
            onItemClick={onPackageClick}
          />

          {/* Pagination */}
          {pagination && (
            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              pageSize={pageSize}
              totalItems={pagination.total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}
    </div>
  );
};
