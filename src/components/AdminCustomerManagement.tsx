import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AdminCustomerStats from './admin/AdminCustomerStats';
import AdminCustomerFilters from './admin/AdminCustomerFilters';
import AdminCustomerTable from './admin/AdminCustomerTable';
import CreateCustomerForm from './admin/CreateCustomerForm';

interface CustomerData {
  id: string;
  type: 'registered' | 'package_only';
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
  registration_status: 'registered' | 'guest';
}

const AdminCustomerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      // Get registered users with their package stats
      const { data: registeredUsers, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          packages!packages_customer_id_fkey(
            id,
            status,
            package_value,
            duty_amount,
            total_due,
            created_at
          )
        `);

      if (profilesError) throw profilesError;

      // Get packages with sender information (for non-registered customers)
      const { data: allPackages, error: packagesError } = await supabase
        .from('packages')
        .select('*');

      if (packagesError) throw packagesError;

      const customerMap = new Map<string, CustomerData>();

      // Process registered users
      registeredUsers?.forEach(user => {
        const userPackages = user.packages || [];
        const totalSpent = userPackages.reduce((sum, pkg) => sum + (pkg.package_value || 0), 0);
        const outstandingBalance = userPackages.reduce((sum, pkg) => sum + (pkg.total_due || 0), 0);
        const activePackages = userPackages.filter(pkg => 
          ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)
        ).length;
        const completedPackages = userPackages.filter(pkg => pkg.status === 'picked_up').length;
        const lastActivity = userPackages.length > 0 
          ? userPackages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;

        customerMap.set(user.id, {
          id: user.id,
          type: 'registered',
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          address: user.address,
          created_at: user.created_at,
          total_packages: userPackages.length,
          active_packages: activePackages,
          completed_packages: completedPackages,
          total_spent: totalSpent,
          outstanding_balance: outstandingBalance,
          last_activity: lastActivity,
          registration_status: 'registered'
        });
      });

      // Process packages to find non-registered customers
      const packageOnlyCustomers = new Map<string, {
        name: string;
        address: string;
        packages: typeof allPackages;
      }>();

      allPackages?.forEach(pkg => {
        // Skip if this package belongs to a registered user
        if (customerMap.has(pkg.customer_id)) return;

        const customerKey = `${pkg.sender_name || 'Unknown'}_${pkg.delivery_address}`;
        
        if (!packageOnlyCustomers.has(customerKey)) {
          packageOnlyCustomers.set(customerKey, {
            name: pkg.sender_name || 'Unknown Customer',
            address: pkg.delivery_address,
            packages: []
          });
        }
        
        packageOnlyCustomers.get(customerKey)?.packages.push(pkg);
      });

      // Convert package-only customers to CustomerData format
      packageOnlyCustomers.forEach((customerInfo, customerKey) => {
        const packages = customerInfo.packages;
        const totalSpent = packages.reduce((sum, pkg) => sum + (pkg.package_value || 0), 0);
        const outstandingBalance = packages.reduce((sum, pkg) => sum + (pkg.total_due || 0), 0);
        const activePackages = packages.filter(pkg => 
          ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)
        ).length;
        const completedPackages = packages.filter(pkg => pkg.status === 'picked_up').length;
        const lastActivity = packages.length > 0 
          ? packages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;

        customerMap.set(customerKey, {
          id: customerKey,
          type: 'package_only',
          full_name: customerInfo.name,
          email: null,
          phone_number: null,
          address: customerInfo.address,
          created_at: packages[0]?.created_at || new Date().toISOString(),
          total_packages: packages.length,
          active_packages: activePackages,
          completed_packages: completedPackages,
          total_spent: totalSpent,
          outstanding_balance: outstandingBalance,
          last_activity: lastActivity,
          registration_status: 'guest'
        });
      });

      return Array.from(customerMap.values()).sort((a, b) => 
        new Date(b.last_activity || b.created_at).getTime() - new Date(a.last_activity || a.created_at).getTime()
      );
    }
  });

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = customerTypeFilter === 'all' || customer.type === customerTypeFilter;
    
    const matchesActivity = activityFilter === 'all' || 
                           (activityFilter === 'active' && customer.active_packages > 0) ||
                           (activityFilter === 'inactive' && customer.active_packages === 0);
    
    return matchesSearch && matchesType && matchesActivity;
  });

  const totalCustomers = customers?.length || 0;
  const registeredCustomers = customers?.filter(c => c.type === 'registered').length || 0;
  const packageOnlyCustomers = customers?.filter(c => c.type === 'package_only').length || 0;
  const activeCustomers = customers?.filter(c => c.active_packages > 0).length || 0;

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
