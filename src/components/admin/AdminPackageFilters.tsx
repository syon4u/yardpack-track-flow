
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, RefreshCw } from 'lucide-react';

interface AdminPackageFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  magayaStatusFilter?: string;
  setMagayaStatusFilter?: (value: string) => void;
  warehouseFilter?: string;
  setWarehouseFilter?: (value: string) => void;
  onBulkSync?: () => void;
  syncInProgress?: boolean;
}

const AdminPackageFilters: React.FC<AdminPackageFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  magayaStatusFilter = 'all',
  setMagayaStatusFilter,
  warehouseFilter = 'all',
  setWarehouseFilter,
  onBulkSync,
  syncInProgress = false,
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || 
    magayaStatusFilter !== 'all' || warehouseFilter !== 'all';

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setMagayaStatusFilter?.('all');
    setWarehouseFilter?.('all');
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by tracking number, description, or external tracking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
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
      </div>

      {/* Magaya-specific Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex gap-2">
          {setMagayaStatusFilter && (
            <Select value={magayaStatusFilter} onValueChange={setMagayaStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Magaya Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Magaya Status</SelectItem>
                <SelectItem value="not_synced">Not Synced</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_warehouse">In Warehouse</SelectItem>
                <SelectItem value="consolidated">Consolidated</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
              </SelectContent>
            </Select>
          )}

          {setWarehouseFilter && (
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Warehouse Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                <SelectItem value="miami">Miami</SelectItem>
                <SelectItem value="kingston">Kingston</SelectItem>
                <SelectItem value="montego_bay">Montego Bay</SelectItem>
              </SelectContent>
            </Select>
          )}

          {onBulkSync && (
            <Button 
              onClick={onBulkSync}
              disabled={syncInProgress}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncInProgress ? 'animate-spin' : ''}`} />
              Bulk Sync
            </Button>
          )}
        </div>

        {/* Active Filters & Clear */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Search: {searchTerm.substring(0, 20)}
                    {searchTerm.length > 20 && '...'}
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {statusFilter}
                  </Badge>
                )}
                {magayaStatusFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Magaya: {magayaStatusFilter}
                  </Badge>
                )}
                {warehouseFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Warehouse: {warehouseFilter}
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs"
              >
                <X className="h-3 w-3" />
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPackageFilters;
