
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Scan } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminDashboardHeaderProps {
  onCreatePackage: () => void;
}

const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = ({ onCreatePackage }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage packages, users, and system operations</p>
      </div>
      <div className="flex gap-2">
        <Link to="/warehouse">
          <Button variant="outline" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            Warehouse Scanner
          </Button>
        </Link>
        <Button onClick={onCreatePackage} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Package
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboardHeader;
