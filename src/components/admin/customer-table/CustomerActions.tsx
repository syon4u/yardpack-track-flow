
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Package, Mail, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteCustomer } from '@/hooks/customer/useDeleteCustomer';
import { useToast } from '@/hooks/use-toast';

interface CustomerActionsProps {
  customerId: string;
  customerEmail?: string | null;
  customerName: string;
  hasEmail: boolean;
  isMobile?: boolean;
  onEdit: (customerId: string) => void;
}

const CustomerActions: React.FC<CustomerActionsProps> = ({ 
  customerId, 
  customerEmail, 
  customerName,
  hasEmail, 
  isMobile = false,
  onEdit 
}) => {
  const navigate = useNavigate();
  const deleteCustomerMutation = useDeleteCustomer();
  const { toast } = useToast();

  const handleViewPackages = () => {
    navigate(`/dashboard?tab=packages&customer=${customerId}`);
  };

  const handleContact = () => {
    if (customerEmail) {
      window.open(`mailto:${customerEmail}?subject=Regarding your YardPack account`);
    }
  };

  const handleEdit = () => {
    onEdit(customerId);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${customerName}? This action cannot be undone.`)) {
      try {
        await deleteCustomerMutation.mutateAsync(customerId);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleViewPackages}>
            <Package className="h-4 w-4 mr-2" />
            View Packages
          </DropdownMenuItem>
          {hasEmail && (
            <DropdownMenuItem onClick={handleContact}>
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={handleViewPackages}>
        <Package className="h-4 w-4 mr-1" />
        View Packages
      </Button>
      {hasEmail && (
        <Button variant="outline" size="sm" onClick={handleContact}>
          <Mail className="h-4 w-4 mr-1" />
          Contact
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={handleEdit}>
        <Edit className="h-4 w-4 mr-1" />
        Edit
      </Button>
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        <Trash className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
};

export default CustomerActions;
