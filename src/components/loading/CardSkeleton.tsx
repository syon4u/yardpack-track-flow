
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

interface CardSkeletonProps {
  count?: number;
  variant?: 'package' | 'stats' | 'list';
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  count = 3, 
  variant = 'package' 
}) => {
  const isMobile = useIsMobile();

  const renderPackageCard = () => (
    <div className="p-6 border rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex gap-2">
        <Skeleton className={`h-8 ${isMobile ? 'w-20' : 'w-24'}`} />
        <Skeleton className={`h-8 ${isMobile ? 'w-20' : 'w-24'}`} />
      </div>
    </div>
  );

  const renderStatsCard = () => (
    <div className="p-4 border rounded-lg space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className={`${isMobile ? 'h-6 w-16' : 'h-8 w-20'}`} />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );

  const renderListCard = () => (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );

  const renderCard = () => {
    switch (variant) {
      case 'stats':
        return renderStatsCard();
      case 'list':
        return renderListCard();
      default:
        return renderPackageCard();
    }
  };

  return (
    <div className={`grid gap-4 ${
      isMobile 
        ? 'grid-cols-1' 
        : variant === 'stats' 
          ? 'grid-cols-2 md:grid-cols-4'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }`}>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>
          {renderCard()}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CardSkeleton;
