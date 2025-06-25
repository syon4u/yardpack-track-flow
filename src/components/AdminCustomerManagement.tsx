
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AdminCustomerStats from './admin/AdminCustomerStats';
import AdminCustomerFilters from './admin/AdminCustomerFilters';
import AdminCustomerTable from './admin/AdminCustomerTable';
import CreateCustomerForm from './admin/CreateCustomerForm';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { Customer } from '@/types/customer';

const AdminCustomerManagement: React.FC = () => {
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const { data: customers, isLoading } = useCustomers();
  
  // Transform Customer[] to CustomerWithStats[] for the filters hook
  const customersWithStats = React.useMemo(() => {
    if (!customers) return [];
    
    return customers.map((customer: Customer) => ({
      ...customer,
      total_packages: 0, // These would need to be calculated from packages table
      active_packages: 0,
      completed_packages: 0,
      total_spent: 0,
      outstanding_balance: 0,
      last_activity: customer.created_at,
      registration_status: customer.customer_type === 'registered' ? 'registered' as const : 'guest' as const
    }));
  }, [customers]);

  const {
    searchTerm,
    setSearchTerm,
    customerTypeFilter,
    setCustomerTypeFilter,
    activityFilter,
    setActivityFilter,
    filteredCustomers
  } = useCustomerFilters(customersWithStats);

  const totalCustomers = customers?.length || 0;
  const registeredCustomers = customers?.filter(c => c.customer_type === 'registered').length || 0;
  const packageOnlyCustomers = customers?.filter(c => c.customer_type === 'package_only').length || 0;
  // For now, assume all customers could be active since we don't have package stats
  const activeCustomers = totalCustomers;

  if (isLoading) {
    return <div>Loading customer data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Customer Management</h2>
        <Button onClick={() => setShowCreateCustomer(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Customer
        </Button>
      </div>

      <AdminCustomerStats
        totalCustomers={totalCustomers}
        registeredCustomers={registeredCustomers}
        packageOnlyCustomers={packageOnlyCustomers}
        activeCustomers={activeCustomers}
      />

      <AdminCustomerFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        customerTypeFilter={customerTypeFilter}
        setCustomerTypeFilter={setCustomerTypeFilter}
        activityFilter={activityFilter}
        setActivityFilter={setActivityFilter}
      />

      <AdminCustomerTable customers={filteredCustomers || []} />

      {showCreateCustomer && (
        <CreateCustomerForm onClose={() => setShowCreateCustomer(false)} />
      )}
    </div>
  );
};

export default AdminCustomerManagement;
