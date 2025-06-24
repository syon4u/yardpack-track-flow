
import { Database } from '@/integrations/supabase/types';
import { UnifiedCustomer, UnifiedPackage, StatusConfig } from '@/types/unified';

type DatabasePackage = Database['public']['Tables']['packages']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null;
  invoices: Database['public']['Tables']['invoices']['Row'][];
};

type DatabaseProfile = Database['public']['Tables']['profiles']['Row'] & {
  packages?: DatabasePackage[];
};

// Transform database package to unified format
export const transformPackageToUnified = (pkg: DatabasePackage): UnifiedPackage => {
  return {
    id: pkg.id,
    tracking_number: pkg.tracking_number,
    external_tracking_number: pkg.external_tracking_number,
    description: pkg.description,
    status: pkg.status,
    
    created_at: pkg.created_at,
    date_received: pkg.date_received,
    estimated_delivery: pkg.estimated_delivery,
    actual_delivery: pkg.actual_delivery,
    
    customer_id: pkg.customer_id,
    customer_name: pkg.profiles?.full_name || 'Unknown Customer',
    customer_email: pkg.profiles?.email || null,
    
    sender_name: pkg.sender_name,
    sender_address: pkg.sender_address,
    delivery_address: pkg.delivery_address,
    carrier: pkg.carrier,
    weight: pkg.weight,
    dimensions: pkg.dimensions,
    package_value: pkg.package_value,
    
    duty_amount: pkg.duty_amount,
    duty_rate: pkg.duty_rate,
    total_due: pkg.total_due,
    
    invoices: pkg.invoices || [],
    
    invoice_uploaded: pkg.invoices && pkg.invoices.length > 0,
    duty_assessed: pkg.duty_amount !== null,
    
    notes: pkg.notes,
    api_sync_status: pkg.api_sync_status,
    last_api_sync: pkg.last_api_sync,
  };
};

// Transform profile to unified customer format
export const transformProfileToUnifiedCustomer = (profile: DatabaseProfile): UnifiedCustomer => {
  const packages = profile.packages || [];
  const totalSpent = packages.reduce((sum, pkg) => sum + (pkg.package_value || 0), 0);
  const outstandingBalance = packages.reduce((sum, pkg) => sum + (pkg.total_due || 0), 0);
  const activePackages = packages.filter(pkg => 
    ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)
  ).length;
  const completedPackages = packages.filter(pkg => pkg.status === 'picked_up').length;
  const lastActivity = packages.length > 0 
    ? packages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
    : null;

  return {
    id: profile.id,
    type: 'registered',
    full_name: profile.full_name,
    email: profile.email,
    phone_number: profile.phone_number,
    address: profile.address,
    created_at: profile.created_at,
    total_packages: packages.length,
    active_packages: activePackages,
    completed_packages: completedPackages,
    total_spent: totalSpent,
    outstanding_balance: outstandingBalance,
    last_activity: lastActivity,
    registration_status: 'registered'
  };
};

// Create package-only customer from packages
export const createPackageOnlyCustomer = (
  customerKey: string,
  customerName: string,
  address: string,
  packages: DatabasePackage[]
): UnifiedCustomer => {
  const totalSpent = packages.reduce((sum, pkg) => sum + (pkg.package_value || 0), 0);
  const outstandingBalance = packages.reduce((sum, pkg) => sum + (pkg.total_due || 0), 0);
  const activePackages = packages.filter(pkg => 
    ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)
  ).length;
  const completedPackages = packages.filter(pkg => pkg.status === 'picked_up').length;
  const lastActivity = packages.length > 0 
    ? packages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
    : null;

  return {
    id: customerKey,
    type: 'package_only',
    full_name: customerName,
    email: null,
    phone_number: null,
    address: address,
    created_at: packages[0]?.created_at || new Date().toISOString(),
    total_packages: packages.length,
    active_packages: activePackages,
    completed_packages: completedPackages,
    total_spent: totalSpent,
    outstanding_balance: outstandingBalance,
    last_activity: lastActivity,
    registration_status: 'guest'
  };
};

// Status configuration for consistent display
export const getStatusConfig = (status: Database['public']['Enums']['package_status']): StatusConfig => {
  const configs: Record<Database['public']['Enums']['package_status'], StatusConfig> = {
    received: {
      value: 'received',
      label: 'Received at Miami',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    },
    in_transit: {
      value: 'in_transit',
      label: 'In Transit',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    },
    arrived: {
      value: 'arrived',
      label: 'Arrived in Jamaica',
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800'
    },
    ready_for_pickup: {
      value: 'ready_for_pickup',
      label: 'Ready for Pickup',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    picked_up: {
      value: 'picked_up',
      label: 'Picked Up',
      color: 'gray',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    }
  };

  return configs[status];
};

// Filter packages based on unified filters
export const filterPackages = (packages: UnifiedPackage[], filters: any): UnifiedPackage[] => {
  return packages.filter(pkg => {
    // Search filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        pkg.tracking_number.toLowerCase().includes(searchLower) ||
        pkg.description.toLowerCase().includes(searchLower) ||
        pkg.external_tracking_number?.toLowerCase().includes(searchLower) ||
        pkg.customer_name.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.statusFilter && filters.statusFilter !== 'all') {
      if (pkg.status !== filters.statusFilter) return false;
    }

    return true;
  });
};

// Filter customers based on unified filters
export const filterCustomers = (customers: UnifiedCustomer[], filters: any): UnifiedCustomer[] => {
  return customers.filter(customer => {
    // Search filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        customer.full_name.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.address?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Customer type filter
    if (filters.customerTypeFilter && filters.customerTypeFilter !== 'all') {
      if (customer.type !== filters.customerTypeFilter) return false;
    }

    // Activity filter
    if (filters.activityFilter && filters.activityFilter !== 'all') {
      const isActive = customer.active_packages > 0;
      if (filters.activityFilter === 'active' && !isActive) return false;
      if (filters.activityFilter === 'inactive' && isActive) return false;
    }

    return true;
  });
};
