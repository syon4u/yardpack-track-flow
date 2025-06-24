
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface AdminPackageFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

const AdminPackageFilters: React.FC<AdminPackageFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48">
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
      <Button variant="outline" className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        More Filters
      </Button>
    </div>
  );
};

export default AdminPackageFilters;
