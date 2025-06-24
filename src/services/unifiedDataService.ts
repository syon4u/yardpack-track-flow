
import { supabase } from '@/integrations/supabase/client';
import { 
  UnifiedCustomer, 
  UnifiedPackage, 
  UnifiedStats 
} from '@/types/unified';
import { 
  transformPackageToUnified,
  transformProfileToUnifiedCustomer,
  createPackageOnlyCustomer 
} from '@/utils/dataTransforms';
import { Database } from '@/integrations/supabase/types';

export class UnifiedDataService {
  // Fetch all customers (registered + package-only)
  static async fetchAllCustomers(): Promise<UnifiedCustomer[]> {
    try {
      // Get registered users with their packages
      const { data: registeredUsers, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          packages!packages_customer_id_fkey(*)
        `);

      if (profilesError) throw profilesError;

      // Get all packages to find non-registered customers
      const { data: allPackages, error: packagesError } = await supabase
        .from('packages')
        .select(`
          *,
          invoices(*)
        `);

      if (packagesError) throw packagesError;

      const customerMap = new Map<string, UnifiedCustomer>();

      // Process registered users
      registeredUsers?.forEach(user => {
        // Add invoices to packages for registered users
        const packagesWithInvoices = (user.packages || []).map(pkg => ({
          ...pkg,
          invoices: []
        }));
        
        const userWithPackages = {
          ...user,
          packages: packagesWithInvoices
        };
        
        const unifiedCustomer = transformProfileToUnifiedCustomer(userWithPackages);
        customerMap.set(user.id, unifiedCustomer);
      });

      // Process package-only customers
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

      // Convert package-only customers to unified format
      packageOnlyCustomers.forEach((customerInfo, customerKey) => {
        const packagesWithInvoices = customerInfo.packages.map(pkg => ({
          ...pkg,
          invoices: pkg.invoices || []
        }));
        
        const unifiedCustomer = createPackageOnlyCustomer(
          customerKey,
          customerInfo.name,
          customerInfo.address,
          packagesWithInvoices
        );
        customerMap.set(customerKey, unifiedCustomer);
      });

      return Array.from(customerMap.values()).sort((a, b) => 
        new Date(b.last_activity || b.created_at).getTime() - 
        new Date(a.last_activity || a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Fetch all packages in unified format
  static async fetchAllPackages(options: {
    searchTerm?: string;
    statusFilter?: string;
    customerId?: string;
  } = {}): Promise<UnifiedPackage[]> {
    try {
      let query = supabase
        .from('packages')
        .select(`
          *,
          profiles:customer_id(full_name, email, address, created_at, id, phone_number, role, updated_at),
          invoices(*)
        `)
        .order('created_at', { ascending: false });

      // Apply customer filter if specified
      if (options.customerId) {
        query = query.eq('customer_id', options.customerId);
      }

      // Apply search filter
      if (options.searchTerm && options.searchTerm.trim()) {
        query = query.or(`tracking_number.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%,external_tracking_number.ilike.%${options.searchTerm}%`);
      }

      // Apply status filter
      if (options.statusFilter && options.statusFilter !== 'all') {
        const validStatuses: Database['public']['Enums']['package_status'][] = [
          'received', 'in_transit', 'arrived', 'ready_for_pickup', 'picked_up'
        ];
        
        if (validStatuses.includes(options.statusFilter as Database['public']['Enums']['package_status'])) {
          query = query.eq('status', options.statusFilter);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(pkg => transformPackageToUnified({
        ...pkg,
        invoices: pkg.invoices || []
      }));
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }

  // Get unified statistics
  static async fetchUnifiedStats(): Promise<UnifiedStats> {
    try {
      const [packages, customers] = await Promise.all([
        this.fetchAllPackages(),
        this.fetchAllCustomers()
      ]);

      const packageStats = {
        total: packages.length,
        received: packages.filter(p => p.status === 'received').length,
        in_transit: packages.filter(p => p.status === 'in_transit').length,
        arrived: packages.filter(p => p.status === 'arrived').length,
        ready_for_pickup: packages.filter(p => p.status === 'ready_for_pickup').length,
        picked_up: packages.filter(p => p.status === 'picked_up').length,
      };

      const customerStats = {
        total: customers.length,
        registered: customers.filter(c => c.type === 'registered').length,
        package_only: customers.filter(c => c.type === 'package_only').length,
        active: customers.filter(c => c.active_packages > 0).length,
      };

      const financialStats = {
        total_value: packages.reduce((sum, p) => sum + (p.package_value || 0), 0),
        total_due: packages.reduce((sum, p) => sum + (p.total_due || 0), 0),
        pending_invoices: packages.filter(p => !p.invoice_uploaded).length,
      };

      return {
        packages: packageStats,
        customers: customerStats,
        financial: financialStats,
      };
    } catch (error) {
      console.error('Error fetching unified stats:', error);
      throw error;
    }
  }
}
