
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomerActionsProps {
  hasEmail: boolean;
  isMobile?: boolean;
}

const CustomerActions: React.FC<CustomerActionsProps> = ({ hasEmail, isMobile = false }) => {
  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Packages</DropdownMenuItem>
          {hasEmail && (
            <DropdownMenuItem>Contact</DropdownMenuItem>
          )}
          <DropdownMenuItem>Edit Customer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm">
        View Packages
      </Button>
      {hasEmail && (
        <Button variant="outline" size="sm">
          Contact
        </Button>
      )}
      <Button variant="outline" size="sm">
        Edit
      </Button>
    </div>
  );
};

export default CustomerActions;
