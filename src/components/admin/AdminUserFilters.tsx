
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminUserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateUser: () => void;
}

const AdminUserFilters: React.FC<AdminUserFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onCreateUser,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'}`}>
      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-4'}`}>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search system users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`pl-10 ${isMobile ? 'w-full' : 'w-64'}`}
          />
        </div>
      </div>
      <Button 
        onClick={onCreateUser}
        className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}
      >
        <UserPlus className="h-4 w-4" />
        Create System User
      </Button>
    </div>
  );
};

export default AdminUserFilters;
