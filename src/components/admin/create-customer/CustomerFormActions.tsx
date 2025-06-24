
import React from 'react';
import { Button } from '@/components/ui/button';

interface CustomerFormActionsProps {
  onCancel: () => void;
  isCreating: boolean;
  isMobile: boolean;
}

const CustomerFormActions: React.FC<CustomerFormActionsProps> = ({ 
  onCancel, 
  isCreating, 
  isMobile 
}) => {
  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-end space-x-2'} pt-4`}>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className={isMobile ? 'w-full h-12' : ''}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isCreating}
        className={isMobile ? 'w-full h-12' : ''}
      >
        {isCreating ? 'Creating...' : 'Create Customer'}
      </Button>
    </div>
  );
};

export default CustomerFormActions;
