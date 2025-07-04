import React, { memo, useCallback, useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRenderTime, useMemoryMonitor } from '@/hooks/usePerformanceMonitor';

interface OptimizedTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
  }>;
  itemHeight?: number;
  overscan?: number;
  onRowClick?: (item: T) => void;
  className?: string;
}

function OptimizedTable<T extends Record<string, any>>({
  data,
  columns,
  itemHeight = 60,
  overscan = 5,
  onRowClick,
  className = ''
}: OptimizedTableProps<T>) {
  useRenderTime('OptimizedTable');
  useMemoryMonitor();
  
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => containerRef,
    estimateSize: () => itemHeight,
    overscan,
  });
  
  const handleRowClick = useCallback((item: T) => {
    onRowClick?.(item);
  }, [onRowClick]);
  
  const memoizedRows = useMemo(() => {
    return virtualizer.getVirtualItems().map((virtualItem) => {
      const item = data[virtualItem.index];
      
      return (
        <div
          key={virtualItem.key}
          className={`absolute top-0 left-0 w-full border-b border-gray-200 hover:bg-gray-50 transition-colors ${
            onRowClick ? 'cursor-pointer' : ''
          }`}
          style={{
            height: `${virtualItem.size}px`,
            transform: `translateY(${virtualItem.start}px)`,
          }}
          onClick={() => handleRowClick(item)}
        >
          <div className="flex items-center h-full px-4">
            {columns.map((column) => (
              <div key={column.key} className="flex-1 text-sm text-gray-900">
                {column.render ? column.render(item) : item[column.key]}
              </div>
            ))}
          </div>
        </div>
      );
    });
  }, [virtualizer.getVirtualItems(), data, columns, handleRowClick, onRowClick]);
  
  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          {columns.map((column) => (
            <div key={column.key} className="flex-1 text-sm font-medium text-gray-900">
              {column.header}
            </div>
          ))}
        </div>
      </div>
      
      {/* Virtualized Content */}
      <div
        ref={setContainerRef}
        className="h-96 overflow-auto"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {memoizedRows}
        </div>
      </div>
    </div>
  );
}

export default memo(OptimizedTable) as <T extends Record<string, any>>(
  props: OptimizedTableProps<T>
) => JSX.Element;