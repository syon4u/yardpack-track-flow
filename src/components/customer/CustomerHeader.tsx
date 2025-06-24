
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

interface CustomerHeaderProps {
  fullName?: string | null;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ fullName }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {fullName || 'Valued Customer'}!
        </h1>
        <p className="text-gray-600 mt-2">Track and manage your packages from Miami to Jamaica</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <User className="h-3 w-3" />
          Customer
        </Badge>
      </div>
    </div>
  );
};

export default CustomerHeader;
