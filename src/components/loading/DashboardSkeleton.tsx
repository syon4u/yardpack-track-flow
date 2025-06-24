
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardSkeleton: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className={`${isMobile ? 'h-6 w-48' : 'h-8 w-64'}`} />
        <Skeleton className={`${isMobile ? 'h-4 w-32' : 'h-5 w-40'}`} />
      </div>

      {/* Stats Cards Skeleton */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className={`${isMobile ? 'h-6 w-16' : 'h-8 w-20'}`} />
          </div>
        ))}
      </div>

      {/* Action Items Skeleton */}
      <div className="p-4 border rounded-lg border-orange-200 bg-orange-50 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className={`flex ${isMobile ? 'gap-1 overflow-x-auto' : 'gap-2'}`}>
          {Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => (
            <Skeleton key={i} className={`${isMobile ? 'h-10 w-20 flex-shrink-0' : 'h-10 w-24'}`} />
          ))}
        </div>

        {/* Tab Content Skeleton */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-6 border rounded-lg space-y-4">
              <Skeleton className="h-5 w-3/4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
