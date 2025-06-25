
import React, { useState } from 'react';
import { usePackages } from '@/hooks/usePackages';
import PackageList from '../PackageList';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

const PackageManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
        <p className="text-gray-600 mt-1">View and manage all packages</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="arrived">Arrived</SelectItem>
            <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
            <SelectItem value="picked_up">Picked Up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PackageList searchTerm={searchTerm} statusFilter={statusFilter} />
    </div>
  );
};

export default PackageManagement;
