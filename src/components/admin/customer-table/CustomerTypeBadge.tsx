
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CustomerTypeBadgeProps {
  type: 'registered' | 'guest' | 'package_only';
}

const CustomerTypeBadge: React.FC<CustomerTypeBadgeProps> = ({ type }) => {
  const variants = {
    registered: 'default',
    guest: 'secondary', 
    package_only: 'outline'
  } as const;
  
  const labels = {
    registered: 'Registered',
    guest: 'Guest',
    package_only: 'Package-Only'
  };

  return (
    <Badge variant={variants[type] || 'secondary'}>
      {labels[type] || type}
    </Badge>
  );
};

export default CustomerTypeBadge;
