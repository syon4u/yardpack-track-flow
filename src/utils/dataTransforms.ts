
import { Database } from '@/integrations/supabase/types';
import { UnifiedCustomer, UnifiedPackage, StatusConfig } from '@/types/unified';

type DatabasePackage = Database['public']['Tables']['packages']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null;
  invoices?: Database['public']['Tables']['invoices']['Row'][];
};

type DatabaseProfile = Database['public']['Tables']['profiles']['Row'] & {
  packages?: (Database['public']['Tables']['packages']['Row'] & {
    invoices?: Database['public']['Tables']['invoices']['Row'][];
  })[];
};

// Memoization cache for expensive transformations
const transformCache = new Map<string, any>();

// Transform database package to unified format with memoization
export const transformPackageToUnified = (pkg: DatabasePackage): UnifiedPackage => {
  const cacheKey = `package_${pkg.id}_${pkg.updated_at}`;
  
  if (transformCache.has(cacheKey)) {
    return transformCache.get(cacheKey);
  }

  const transformed: UnifiedPackage = {
    id: pkg.id,
    tracking_number: pkg.tracking_number,
    external_tracking_number: pkg.external_tracking_number,
    description: pkg.description,
    status: pkg.status,
    
    created_at: pkg.created_at,
    updated_at: pkg.updated_at,
    date_received: pkg.date_received,
    estimated_delivery: pkg.estimated_delivery,
    delivery_estimate: pkg.delivery_estimate,
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
    
    invoice_uploaded: pkg.invoices ? pkg.invoices.length > 0 : false,
    duty_assessed: pkg.duty_amount !== null,
    
    notes: pkg.notes,
    api_sync_status: pkg.api_sync_status,
    last_api_sync: pkg.last_api_sync,
    
    // Add full compatibility property for legacy components
    profiles: pkg.profiles ? {
      full_name: pkg.profiles.full_name,
      email: pkg.profiles.email,
      address: pkg.profiles.address,
      created_at: pkg.profiles.created_at,
      id: pkg.profiles.id,
      phone_number: pkg.profiles.phone_number,
      role: pkg.profiles.role,
      updated_at: pkg.profiles.updated_at
    } : null,
  };

  // Cache the result for future use
  transformCache.set(cacheKey, transformed);
  
  // Limit cache size to prevent memory leaks
  if (transformCache.size > 1000) {
    const firstKey = transformCache.keys().next().value;
    transformCache.delete(firstKey);
  }

  return transformed;
};

// Transform profile to unified customer format with memoization
export const transformProfileToUnifiedCustomer = (profile: DatabaseProfile): UnifiedCustomer => {
  const cacheKey = `customer_${profile.id}_${profile.updated_at}`;
  
  if (transformCache.has(cacheKey)) {
    return transformCache.get(cacheKey);
  }

  const packages = profile.packages || [];
  
  // Optimized calculations using reduce for better performance
  const stats = packages.reduce(
    (acc, pkg) => {
      acc.totalSpent += pkg.package_value || 0;
      acc.outstandingBalance += pkg.total_due || 0;
      
      if (['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)) {
        acc.activePackages++;
      } else if (pkg.status === 'picked_up') {
        acc.completedPackages++;
      }
      
      if (!acc.lastActivity || new Date(pkg.created_at) > new Date(acc.lastActivity)) {
        acc.lastActivity = pkg.created_at;
      }
      
      return acc;
    },
    {
      totalSpent: 0,
      outstandingBalance: 0,
      activePackages: 0,
      completedPackages: 0,
      lastActivity: null as string | null,
    }
  );

  const transformed: UnifiedCustomer = {
    id: profile.id,
    type: 'registered',
    full_name: profile.full_name,
    email: profile.email,
    phone_number: profile.phone_number,
    address: profile.address,
    created_at: profile.created_at,
    total_packages: packages.length,
    active_packages: stats.activePackages,
    completed_packages: stats.completedPackages,
    total_spent: stats.totalSpent,
    outstanding_balance: stats.outstandingBalance,
    last_activity: stats.lastActivity,
    registration_status: 'registered'
  };

  transformCache.set(cacheKey, transformed);
  
  if (transformCache.size > 1000) {
    const firstKey = transformCache.keys().next().value;
    transformCache.delete(firstKey);
  }

  return transformed;
};

// Create package-only customer from packages with memoization
export const createPackageOnlyCustomer = (
  customerKey: string,
  customerName: string,
  address: string,
  packages: (Database['public']['Tables']['packages']['Row'] & {
    invoices?: Database['public']['Tables']['invoices']['Row'][];
  })[]
): UnifiedCustomer => {
  const cacheKey = `package_only_${customerKey}_${packages.length}`;
  
  if (transformCache.has(cacheKey)) {
    return transformCache.get(cacheKey);
  }

  // Optimized calculations
  const stats = packages.reduce(
    (acc, pkg) => {
      acc.totalSpent += pkg.package_value || 0;
      acc.outstandingBalance += pkg.total_due || 0;
      
      if (['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)) {
        acc.activePackages++;
      } else if (pkg.status === 'picked_up') {
        acc.completedPackages++;
      }
      
      if (!acc.lastActivity || new Date(pkg.created_at) > new Date(acc.lastActivity)) {
        acc.lastActivity = pkg.created_at;
      }
      
      return acc;
    },
    {
      totalSpent: 0,
      outstandingBalance: 0,
      activePackages: 0,
      completedPackages: 0,
      lastActivity: packages[0]?.created_at || new Date().toISOString(),
    }
  );

  const transformed: UnifiedCustomer = {
    id: customerKey,
    type: 'package_only',
    full_name: customerName,
    email: null,
    phone_number: null,
    address: address,
    created_at: stats.lastActivity,
    total_packages: packages.length,
    active_packages: stats.activePackages,
    completed_packages: stats.completedPackages,
    total_spent: stats.totalSpent,
    outstanding_balance: stats.outstandingBalance,
    last_activity: stats.lastActivity,
    registration_status: 'guest'
  };

  transformCache.set(cacheKey, transformed);
  
  if (transformCache.size > 1000) {
    const firstKey = transformCache.keys().next().value;
    transformCache.delete(firstKey);
  }

  return transformed;
};

// Status configuration for consistent display (cached)
const statusConfigCache = new Map<Database['public']['Enums']['package_status'], StatusConfig>();

export const getStatusConfig = (status: Database['public']['Enums']['package_status']): StatusConfig => {
  if (statusConfigCache.has(status)) {
    return statusConfigCache.get(status)!;
  }

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

  const config = configs[status];
  statusConfigCache.set(status, config);
  return config;
};

// Optimized filter functions with early returns
export const filterPackages = (packages: UnifiedPackage[], filters: any): UnifiedPackage[] => {
  if (!filters.searchTerm && (!filters.statusFilter || filters.statusFilter === 'all')) {
    return packages; // No filtering needed
  }

  return packages.filter(pkg => {
    // Search filter with early return
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        pkg.tracking_number.toLowerCase().includes(searchLower) ||
        pkg.description.toLowerCase().includes(searchLower) ||
        pkg.external_tracking_number?.toLowerCase().includes(searchLower) ||
        pkg.customer_name.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Status filter with early return
    if (filters.statusFilter && filters.statusFilter !== 'all') {
      if (pkg.status !== filters.statusFilter) return false;
    }

    return true;
  });
};

// Optimized customer filtering
export const filterCustomers = (customers: UnifiedCustomer[], filters: any): UnifiedCustomer[] => {
  if (!filters.searchTerm && 
      (!filters.customerTypeFilter || filters.customerTypeFilter === 'all') &&
      (!filters.activityFilter || filters.activityFilter === 'all')) {
    return customers; // No filtering needed
  }

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

// Clear cache function for memory management
export const clearTransformCache = (): void => {
  transformCache.clear();
  statusConfigCache.clear();
};

// Get cache statistics for monitoring
export const getCacheStats = (): { size: number; statusCacheSize: number } => {
  return {
    size: transformCache.size,
    statusCacheSize: statusConfigCache.size,
  };
};
