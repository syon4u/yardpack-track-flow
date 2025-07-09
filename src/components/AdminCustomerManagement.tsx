
import React, { useState, useEffect } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserPlus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminCustomerStats from './admin/AdminCustomerStats';
import AdminCustomerFilters from './admin/AdminCustomerFilters';
import AdminCustomerTable from './admin/AdminCustomerTable';
import CreateCustomerForm from './admin/CreateCustomerForm';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminCustomerManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const isMobile = useIsMobile();

  // Get filters from URL params
  const urlType = searchParams.get('type');
  const urlActive = searchParams.get('active');

  // Set filters from URL params on mount
  useEffect(() => {
    if (urlType && urlType !== 'all') {
      setTypeFilter(urlType);
    }
    if (urlActive === 'true') {
      setActiveFilter(true);
    }
  }, [urlType, urlActive]);

  const { data: customers, isPending, error } = useCustomers();

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || customer.customer_type === typeFilter;
    const matchesActive = !activeFilter || (customer.active_packages && customer.active_packages > 0);
    
    return matchesSearch && matchesType && matchesActive;
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
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'}`}>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-4'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${isMobile ? 'w-full' : 'w-64'}`}
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className={isMobile ? 'w-full' : 'w-48'}>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="registered">Registered</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
              <SelectItem value="package_only">Package Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={() => setShowCreateCustomer(true)}
          className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}
        >
          <UserPlus className="h-4 w-4" />
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
