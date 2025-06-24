
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Scan } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminDashboardHeaderProps {
  onCreatePackage: () => void;
}

const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = ({ onCreatePackage }) => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'}`}>
      <div className={isMobile ? 'text-center' : ''}>
        <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-xl sm:text-2xl' : 'text-3xl'}`}>
          Admin Dashboard
        </h1>
        <p className={`text-gray-600 mt-2 ${isMobile ? 'text-sm' : ''}`}>
          Manage packages, users, and system operations
        </p>
      </div>
      <div className={`flex ${isMobile ? 'flex-col w-full space-y-2' : 'gap-2'}`}>
        <Link to="/warehouse" className={isMobile ? 'w-full' : ''}>
          <Button 
            variant="outline" 
            className={`flex items-center gap-2 ${isMobile ? 'w-full justify-center' : ''}`}
          >
            <Scan className="h-4 w-4" />
            {isMobile ? 'Scanner' : 'Warehouse Scanner'}
          </Button>
        </Link>
        <Button 
          onClick={onCreatePackage} 
          className={`flex items-center gap-2 ${isMobile ? 'w-full justify-center' : ''}`}
        >
          <Plus className="h-4 w-4" />
          Create Package
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboardHeader;
