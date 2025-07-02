import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const EnhancedSkeleton = React.forwardRef<HTMLDivElement, EnhancedSkeletonProps>(
  ({ className, shimmer = true, rounded = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-loading-skeleton',
          shimmer && 'loading-shimmer',
          rounded === 'none' && 'rounded-none',
          rounded === 'sm' && 'rounded-sm',
          rounded === 'md' && 'rounded-md',
          rounded === 'lg' && 'rounded-lg',
          rounded === 'full' && 'rounded-full',
          className
        )}
        {...props}
      />
    );
  }
);

EnhancedSkeleton.displayName = 'EnhancedSkeleton';

export { EnhancedSkeleton };