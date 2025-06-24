
import { useState, useMemo } from 'react';
import { CustomerData } from './useAdminCustomers';

export const useCustomerFilters = (customers: CustomerData[] | undefined) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');

  const filteredCustomers = useMemo(() => {
    return customers?.filter(customer => {
      const matchesSearch = customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = customerTypeFilter === 'all' || customer.type === customerTypeFilter;
      
      const matchesActivity = activityFilter === 'all' || 
                             (activityFilter === 'active' && customer.active_packages > 0) ||
                             (activityFilter === 'inactive' && customer.active_packages === 0);
      
      return matchesSearch && matchesType && matchesActivity;
    });
  }, [customers, searchTerm, customerTypeFilter, activityFilter]);

  return {
    searchTerm,
    setSearchTerm,
    customerTypeFilter,
    setCustomerTypeFilter,
    activityFilter,
    setActivityFilter,
    filteredCustomers
  };
};
