
import React, { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useFilters } from '@/hooks/useFilters';
import AdminCustomerStats from './admin/AdminCustomerStats';
import AdminCustomerFilters from './admin/AdminCustomerFilters';
import AdminCustomerTable from './admin/AdminCustomerTable';
import CreateCustomerForm from './admin/CreateCustomerForm';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminCustomerManagement: React.FC = () => {
  const { searchTerm, setSearchTerm, typeFilter, setTypeFilter, activityFilter, setActivityFilter } = useFilters();
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const isMobile = useIsMobile();

  const { data: customers, isPending, error } = useCustomers();

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || customer.customer_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Calculate stats from customers data
  const totalCustomers = customers?.length || 0;
  const registeredCustomers = customers?.filter(c => c.customer_type === 'registered').length || 0;
  const packageOnlyCustomers = customers?.filter(c => c.customer_type === 'package_only').length || 0;
  const activeCustomers = customers?.filter(c => c.active_packages > 0).length || 0;

  if (isPending) {
    return <div className="flex justify-center py-8">Loading customers...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading customers: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <AdminCustomerFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        customerTypeFilter={typeFilter}
        setCustomerTypeFilter={setTypeFilter}
        activityFilter={activityFilter}
        setActivityFilter={setActivityFilter}
      />

      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowCreateCustomer(true)}>
          Create Customer
        </Button>
      </div>

      <AdminCustomerStats 
        totalCustomers={totalCustomers}
        registeredCustomers={registeredCustomers}
        packageOnlyCustomers={packageOnlyCustomers}
        activeCustomers={activeCustomers}
      />

      <AdminCustomerTable customers={filteredCustomers || []} />

      {showCreateCustomer && (
        <CreateCustomerForm onClose={() => setShowCreateCustomer(false)} />
      )}
    </div>
  );
};

export default AdminCustomerManagement;
