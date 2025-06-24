
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomerHeaderProps {
  fullName?: string | null;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ fullName }) => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-center'}`}>
      <div className={isMobile ? 'text-center' : ''}>
        <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-xl sm:text-2xl' : 'text-3xl'}`}>
          Welcome back, {fullName || 'Valued Customer'}!
        </h1>
        <p className={`text-gray-600 mt-2 ${isMobile ? 'text-sm' : ''}`}>
          Track and manage your packages from Miami to Jamaica
        </p>
      </div>
      <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
        <Badge variant="outline" className="flex items-center gap-1">
          <User className="h-3 w-3" />
          Customer
        </Badge>
      </div>
    </div>
  );
};

export default CustomerHeader;
