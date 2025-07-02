import React from 'react';
import { cn } from '@/lib/utils';
import { EnhancedSkeleton } from './enhanced-skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

// Improved loading button component
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center',
          'transition-smooth focus-ring touch-target',
          loading && 'cursor-not-allowed',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        <span className={cn(loading && 'invisible')}>{children}</span>
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

// Enhanced loading card component
interface LoadingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'package' | 'customer' | 'compact';
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ 
  variant = 'default', 
  className,
  ...props
}) => {
  const isMobile = useIsMobile();

  return (
    <div 
      className={cn(
        'p-4 border rounded-lg space-y-3 animate-fade-in',
        isMobile && 'p-3 space-y-2',
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <EnhancedSkeleton className={cn(
            'h-5 w-3/4',
            variant === 'compact' && 'h-4 w-1/2'
          )} />
          <EnhancedSkeleton className={cn(
            'h-4 w-1/2',
            variant === 'compact' && 'h-3 w-1/3'
          )} />
        </div>
        {variant !== 'compact' && (
          <EnhancedSkeleton className="h-6 w-16 rounded-full" />
        )}
      </div>

      {/* Content */}
      {variant !== 'compact' && (
        <div className="space-y-2">
          <EnhancedSkeleton className="h-4 w-full" />
          <EnhancedSkeleton className="h-4 w-3/4" />
        </div>
      )}

      {/* Actions */}
      <div className={cn(
        'flex gap-2',
        isMobile ? 'flex-col' : 'justify-end'
      )}>
        <EnhancedSkeleton className={cn(
          'h-8 w-20',
          isMobile && 'h-10 w-full'
        )} />
        {variant !== 'compact' && (
          <EnhancedSkeleton className={cn(
            'h-8 w-24',
            isMobile && 'h-10 w-full'
          )} />
        )}
      </div>
    </div>
  );
};

// Loading list component
interface LoadingListProps {
  count?: number;
  variant?: 'default' | 'package' | 'customer' | 'compact';
  className?: string;
}

export const LoadingList: React.FC<LoadingListProps> = ({ 
  count = 6, 
  variant = 'default',
  className 
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      'space-y-4',
      isMobile && 'space-y-3',
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard 
          key={i} 
          variant={variant}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        />
      ))}
    </div>
  );
};

// Loading table component
interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const LoadingTable: React.FC<LoadingTableProps> = ({ 
  rows = 5, 
  columns = 4,
  className 
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <LoadingList count={rows} variant="compact" className={className} />;
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden animate-fade-in', className)}>
      {/* Header */}
      <div className="border-b p-4 bg-muted/50">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <EnhancedSkeleton key={i} className="h-4 w-20 flex-1" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div 
            key={i} 
            className="p-4 animate-fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, j) => (
                <EnhancedSkeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};