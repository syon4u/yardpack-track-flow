import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileOptimizedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  swipeActions?: {
    left?: () => void;
    right?: () => void;
  };
  interactive?: boolean;
  hapticFeedback?: boolean;
}

export const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  children,
  className,
  swipeActions,
  interactive = false,
  hapticFeedback = false,
  ...props
}) => {
  const isMobile = useIsMobile();

  const handleCardClick = () => {
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeActions) return;
    
    const startX = e.touches[0].clientX;
    const startY = e.touches[0].clientY;
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentX = moveEvent.touches[0].clientX;
      const currentY = moveEvent.touches[0].clientY;
      
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      
      // Only trigger if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && swipeActions.right) {
          swipeActions.right();
          if (navigator.vibrate) navigator.vibrate(50);
        } else if (deltaX < 0 && swipeActions.left) {
          swipeActions.left();
          if (navigator.vibrate) navigator.vibrate(50);
        }
        
        // Remove listeners after action
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <Card
      className={cn(
        'animate-fade-in',
        interactive && 'interactive-hover cursor-pointer',
        isMobile && 'touch-target',
        className
      )}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
    </Card>
  );
};

interface MobileOptimizedCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const MobileOptimizedCardHeader: React.FC<MobileOptimizedCardHeaderProps> = ({
  children,
  actions,
  className,
  ...props
}) => {
  const isMobile = useIsMobile();

  return (
    <CardHeader
      className={cn(
        'flex flex-row items-center justify-between space-y-0',
        isMobile ? 'pb-2' : 'pb-3',
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </CardHeader>
  );
};

interface MobileOptimizedCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const MobileOptimizedCardContent: React.FC<MobileOptimizedCardContentProps> = ({
  children,
  className,
  ...props
}) => {
  const isMobile = useIsMobile();

  return (
    <CardContent
      className={cn(
        isMobile ? 'pt-0' : '',
        className
      )}
      {...props}
    >
      {children}
    </CardContent>
  );
};