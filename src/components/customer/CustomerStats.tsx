
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, CheckCircle, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';
import { useNavigate } from 'react-router-dom';

const CustomerStats: React.FC = () => {
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleCardClick = (path: string, status?: string) => {
    if (status) {
      navigate(`${path}?status=${status}`);
    } else {
      navigate(path);
    }
  };
  
  // Fetch packages for the current customer
  const { data: packageData, isPending } = useOptimizedPackages(
    { customerId: profile?.id },
    { page: 1, limit: 1000 } // Get all packages for stats
  );

  const packages = packageData?.data || [];

  // Calculate statistics from actual data
  const totalPackages = packages.length;
  const inTransitPackages = packages.filter(p => p.status === 'in_transit').length;
  const readyForPickup = packages.filter(p => p.status === 'ready_for_pickup').length;
  const totalDue = packages.reduce((sum, p) => sum + (p.total_due || 0), 0);

  if (isPending) {
    return (
      <div className={`grid gap-3 sm:gap-4 md:gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className={`${isMobile ? 'p-3' : ''} animate-fade-in`} style={{ animationDelay: `${i * 100}ms` }}>
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
              <div className="h-4 w-16 bg-loading-skeleton rounded loading-shimmer"></div>
              <div className="h-4 w-4 bg-loading-skeleton rounded loading-shimmer"></div>
            </CardHeader>
            <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
              <div className={`bg-loading-skeleton rounded loading-shimmer mb-1 ${isMobile ? 'h-5 w-12' : 'h-8 w-16'}`}></div>
              <div className="h-3 w-20 bg-loading-skeleton rounded loading-shimmer"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 sm:gap-4 md:gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
      <Card 
        className={`${isMobile ? 'p-3' : ''} interactive-hover animate-fade-in touch-target cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10`} 
        style={{ animationDelay: '0ms' }}
        onClick={() => handleCardClick('/dashboard?tab=packages')}
        role="button"
        tabIndex={0}
        aria-label="View all packages"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=packages')}
      >
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
          <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Total' : 'Total Packages'}
          </CardTitle>
          <Package className={`text-muted-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'} animate-scale-in`} style={{ animationDelay: '200ms' }}>{totalPackages}</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {isMobile ? 'All shipments' : 'All time shipments'}
          </p>
        </CardContent>
      </Card>
      
      <Card 
        className={`${isMobile ? 'p-3' : ''} interactive-hover animate-fade-in touch-target cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10`} 
        style={{ animationDelay: '100ms' }}
        onClick={() => handleCardClick('/dashboard?tab=packages', 'in_transit')}
        role="button"
        tabIndex={0}
        aria-label="View packages in transit"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=packages', 'in_transit')}
      >
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
          <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Transit' : 'In Transit'}
          </CardTitle>
          <Truck className={`text-blue-500 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className={`font-bold text-blue-600 ${isMobile ? 'text-lg' : 'text-2xl'} animate-scale-in`} style={{ animationDelay: '300ms' }}>{inTransitPackages}</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {isMobile ? 'To Jamaica' : 'On the way to Jamaica'}
          </p>
        </CardContent>
      </Card>
      
      <Card 
        className={`${isMobile ? 'p-3' : ''} interactive-hover animate-fade-in touch-target cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10`} 
        style={{ animationDelay: '200ms' }}
        onClick={() => handleCardClick('/dashboard?tab=packages', 'ready_for_pickup')}
        role="button"
        tabIndex={0}
        aria-label="View packages ready for pickup"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=packages', 'ready_for_pickup')}
      >
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
          <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Ready' : 'Ready for Pickup'}
          </CardTitle>
          <CheckCircle className={`text-green-500 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${readyForPickup > 0 ? 'animate-pulse-glow' : ''}`} />
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className={`font-bold text-green-600 ${isMobile ? 'text-lg' : 'text-2xl'} animate-scale-in`} style={{ animationDelay: '400ms' }}>{readyForPickup}</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {isMobile ? 'For collection' : 'Available for collection'}
          </p>
        </CardContent>
      </Card>
      
      <Card 
        className={`${isMobile ? 'p-3' : ''} interactive-hover animate-fade-in touch-target cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10`} 
        style={{ animationDelay: '300ms' }}
        onClick={() => handleCardClick('/dashboard?tab=invoices')}
        role="button"
        tabIndex={0}
        aria-label="View invoices and outstanding balance"
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/dashboard?tab=invoices')}
      >
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
          <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Due' : 'Total Due'}
          </CardTitle>
          <DollarSign className={`text-orange-500 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${totalDue > 0 ? 'animate-pulse-glow' : ''}`} />
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className={`font-bold text-orange-600 ${isMobile ? 'text-lg' : 'text-2xl'} animate-scale-in`} style={{ animationDelay: '500ms' }}>${totalDue.toFixed(2)}</div>
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {isMobile ? 'Outstanding' : 'Outstanding balance'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerStats;
