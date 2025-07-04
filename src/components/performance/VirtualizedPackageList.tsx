import React, { useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import PackageCard from '@/components/PackageCard';

interface Package {
  id: string;
  trackingNumber: string;
  description: string;
  status: 'received' | 'in_transit' | 'arrived' | 'ready_for_pickup' | 'picked_up';
  dateReceived: string;
  estimatedDelivery?: string;
  invoiceUploaded: boolean;
  dutyAssessed: boolean;
  totalDue?: number;
  customerName: string;
  magayaShipmentId?: string;
  magayaReferenceNumber?: string;
  warehouseLocation?: string;
  consolidationStatus?: string;
}

interface VirtualizedPackageListProps {
  packages: Package[];
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  loadNextPage: () => Promise<void>;
  onStatusUpdate?: (packageId: string, status: any) => void;
  onUploadInvoice?: (packageId: string) => void;
  onViewInvoice?: (packageId: string) => void;
  onViewDetails?: (packageId: string) => void;
  userRole: 'customer' | 'admin' | 'warehouse';
  itemHeight?: number;
  height?: number;
}

const VirtualizedPackageList: React.FC<VirtualizedPackageListProps> = ({
  packages,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  onStatusUpdate,
  onUploadInvoice,
  onViewInvoice,
  onViewDetails,
  userRole,
  itemHeight = 280,
  height = 600,
}) => {
  const itemCount = hasNextPage ? packages.length + 1 : packages.length;

  const isItemLoaded = useCallback(
    (index: number) => !!packages[index],
    [packages]
  );

  const loadMoreItems = useCallback(
    async (startIndex: number, stopIndex: number) => {
      if (!isNextPageLoading && hasNextPage) {
        await loadNextPage();
      }
    },
    [isNextPageLoading, hasNextPage, loadNextPage]
  );

  const Item = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const pkg = packages[index];

      if (!pkg) {
        return (
          <div style={style} className="flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full mx-4"></div>
          </div>
        );
      }

      return (
        <div style={style} className="px-4 py-2">
          <PackageCard
            package={pkg}
            userRole={userRole}
            onStatusUpdate={onStatusUpdate}
            onUploadInvoice={onUploadInvoice}
            onViewInvoice={onViewInvoice}
            onViewDetails={onViewDetails}
          />
        </div>
      );
    },
    [packages, userRole, onStatusUpdate, onUploadInvoice, onViewInvoice, onViewDetails]
  );

  return (
    <div className="h-full">
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            height={height}
            width="100%"
            itemCount={itemCount}
            itemSize={itemHeight}
            onItemsRendered={onItemsRendered}
            overscanCount={5}
          >
            {Item}
          </List>
        )}
      </InfiniteLoader>
    </div>
  );
};

export default VirtualizedPackageList;