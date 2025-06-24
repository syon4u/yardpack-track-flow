
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import PackageList from '../PackageList';

interface CustomerPackagesTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const CustomerPackagesTab: React.FC<CustomerPackagesTabProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Filter Section */}
      <div className={`flex gap-2 sm:gap-4 ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'}`}>
        <div className="flex-1">
          <div className="relative">
            <Search className={`absolute left-3 text-gray-400 ${isMobile ? 'top-2.5 h-4 w-4' : 'top-3 h-4 w-4'}`} />
            <Input
              placeholder={isMobile ? "Search packages..." : "Search by tracking number or description..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${isMobile ? 'h-10 text-sm' : ''}`}
            />
          </div>
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
          
          {(searchTerm || statusFilter !== 'all') && (
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
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
