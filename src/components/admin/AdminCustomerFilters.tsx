
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface AdminCustomerFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  customerTypeFilter: string;
  setCustomerTypeFilter: (value: string) => void;
  activityFilter: string;
  setActivityFilter: (value: string) => void;
}

const AdminCustomerFilters: React.FC<AdminCustomerFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  customerTypeFilter,
  setCustomerTypeFilter,
  activityFilter,
  setActivityFilter
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="registered">Registered Users</SelectItem>
          <SelectItem value="package_only">Package-Only</SelectItem>
        </SelectContent>
      </Select>
      <Select value={activityFilter} onValueChange={setActivityFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by activity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Activity</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AdminCustomerFilters;
