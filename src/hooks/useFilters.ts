import { useState } from 'react';

export interface FilterState {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  customerFilter: string;
  magayaStatusFilter: string;
  warehouseFilter: string;
  activityFilter: string;
}

export interface FilterActions {
  setSearchTerm: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setTypeFilter: (value: string) => void;
  setCustomerFilter: (value: string) => void;
  setMagayaStatusFilter: (value: string) => void;
  setWarehouseFilter: (value: string) => void;
  setActivityFilter: (value: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

const defaultFilters: FilterState = {
  searchTerm: '',
  statusFilter: 'all',
  typeFilter: 'all',
  customerFilter: '',
  magayaStatusFilter: 'all',
  warehouseFilter: 'all',
  activityFilter: 'all',
};

export function useFilters(initialFilters: Partial<FilterState> = {}): FilterState & FilterActions {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = 
    filters.searchTerm !== '' ||
    filters.statusFilter !== 'all' ||
    filters.typeFilter !== 'all' ||
    filters.customerFilter !== '' ||
    filters.magayaStatusFilter !== 'all' ||
    filters.warehouseFilter !== 'all' ||
    filters.activityFilter !== 'all';

  return {
    ...filters,
    setSearchTerm: (value: string) => updateFilter('searchTerm', value),
    setStatusFilter: (value: string) => updateFilter('statusFilter', value),
    setTypeFilter: (value: string) => updateFilter('typeFilter', value),
    setCustomerFilter: (value: string) => updateFilter('customerFilter', value),
    setMagayaStatusFilter: (value: string) => updateFilter('magayaStatusFilter', value),
    setWarehouseFilter: (value: string) => updateFilter('warehouseFilter', value),
    setActivityFilter: (value: string) => updateFilter('activityFilter', value),
    clearAllFilters,
    hasActiveFilters,
  };
}