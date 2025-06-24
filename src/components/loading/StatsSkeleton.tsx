
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

interface StatsSkeletonProps {
  count?: number;
  showChart?: boolean;
}

const StatsSkeleton: React.FC<StatsSkeletonProps> = ({ 
  count = 4, 
  showChart = false 
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className={`${isMobile ? 'h-6 w-16' : 'h-8 w-20'} font-bold`} />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>

      {/* Chart Section */}
      {showChart && (
        <div className="p-6 border rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="space-y-2">
            {/* Chart bars simulation */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton 
                  className="h-4" 
                  style={{ width: `${Math.random() * 60 + 20}%` }}
                />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsSkeleton;
