
import { useState, useMemo } from 'react';

interface CustomerWithStats {
  id: string;
  customer_number: string;
  customer_type: 'registered' | 'guest' | 'package_only';
  full_name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  created_at: string;
  total_packages: number;
  active_packages: number;
  completed_packages: number;
  total_spent: number;
  outstanding_balance: number;
  last_activity: string | null;
}

export const useCustomerFilters = (customers: CustomerWithStats[] | undefined) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');

  const filteredCustomers = useMemo(() => {
    return customers?.filter(customer => {
      const matchesSearch = customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = customerTypeFilter === 'all' || customer.customer_type === customerTypeFilter;
      
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
