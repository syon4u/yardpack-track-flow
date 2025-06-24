
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

interface FormSkeletonProps {
  fields?: number;
  showButtons?: boolean;
  title?: boolean;
}

const FormSkeleton: React.FC<FormSkeletonProps> = ({ 
  fields = 4, 
  showButtons = true,
  title = true 
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`space-y-4 ${isMobile ? 'space-y-6' : ''}`}>
      {title && (
        <Skeleton className={`${isMobile ? 'h-6 w-48' : 'h-7 w-56'}`} />
      )}
      
      {/* Form Fields */}
      <div className={`space-y-4 ${isMobile ? 'space-y-6' : ''}`}>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className={`${isMobile ? 'h-12' : 'h-10'} w-full`} />
          </div>
        ))}
      </div>

      {/* Form Buttons */}
      {showButtons && (
        <div className={`flex gap-2 ${isMobile ? 'flex-col pt-4' : 'justify-end'}`}>
          <Skeleton className={`${isMobile ? 'h-12' : 'h-10'} w-20`} />
          <Skeleton className={`${isMobile ? 'h-12' : 'h-10'} w-24`} />
        </div>
      )}
    </div>
  );
};

export default FormSkeleton;
