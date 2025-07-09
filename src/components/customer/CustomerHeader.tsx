
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomerHeaderProps {
  fullName?: string | null;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ fullName }) => {
  const isMobile = useIsMobile();

  // Extract first name for a more personal greeting
  const getFirstName = (name: string | null | undefined): string => {
    if (!name) return 'Valued Customer';
    const firstName = name.split(' ')[0];
    return firstName || 'Valued Customer';
  };

  const displayName = fullName || 'Valued Customer';
  const firstName = getFirstName(fullName);

  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-center'}`}>
      <div className={isMobile ? 'text-center' : ''}>
        <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-xl sm:text-2xl' : 'text-3xl'}`}>
          Welcome back, {firstName}!
        </h1>
        <p className={`text-gray-600 mt-2 ${isMobile ? 'text-sm' : ''}`}>
          Track and manage your packages from Miami to Jamaica
        </p>
        {fullName && (
          <p className={`text-muted-foreground mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Account: {displayName}
          </p>
        )}
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
