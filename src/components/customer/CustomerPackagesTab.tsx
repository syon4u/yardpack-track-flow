
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFilters } from '@/hooks/useFilters';
import SearchFilter from '../common/SearchFilter';
import PackageList from '../PackageList';

const CustomerPackagesTab: React.FC = () => {
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, clearAllFilters, hasActiveFilters } = useFilters();
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Filter Section */}
      <div className={`flex gap-2 sm:gap-4 ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'}`}>
        <div className="flex-1">
          <SearchFilter
            placeholder={isMobile ? "Search packages..." : "Search by tracking number or description..."}
            value={searchTerm}
            onChange={setSearchTerm}
            className={isMobile ? 'h-10 text-sm' : ''}
          />
        </div>
        
        <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={`${isMobile ? 'w-full h-10' : 'w-full sm:w-48'}`}>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Packages</SelectItem>
              <SelectItem value="received">Received at Miami</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="arrived">Arrived in Jamaica</SelectItem>
              <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
              <SelectItem value="picked_up">Picked Up</SelectItem>
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={clearAllFilters}
              className={`${isMobile ? 'h-10 px-3' : ''} flex items-center gap-2`}
            >
              <X className="h-4 w-4" />
              {!isMobile && 'Clear'}
            </Button>
          )}
        </div>
      </div>

      {/* Packages List */}
      <PackageList
        searchTerm={searchTerm}
        statusFilter={statusFilter}
      />
    </div>
  );
};

export default CustomerPackagesTab;
