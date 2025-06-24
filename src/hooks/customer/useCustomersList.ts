
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerWithStats } from '@/types/customer';

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<CustomerWithStats[]> => {
      // Get customers from the new customers table
      const { data: customersData, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!customersData) return [];

      // Get package stats for each customer
      const customersWithStats = await Promise.all(
        customersData.map(async (customer: Customer) => {
          const { data: packages } = await supabase
            .from('packages')
            .select('id, status, package_value, total_due, created_at')
            .eq('customer_id', customer.id);

          const packagesList = packages || [];
          const totalSpent = packagesList.reduce((sum, pkg) => sum + (pkg.package_value || 0), 0);
          const outstandingBalance = packagesList.reduce((sum, pkg) => sum + (pkg.total_due || 0), 0);
          const activePackages = packagesList.filter(pkg => 
            ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)
          ).length;
          const completedPackages = packagesList.filter(pkg => pkg.status === 'picked_up').length;
          const lastActivity = packagesList.length > 0 
            ? packagesList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : null;

          return {
            ...customer,
            total_packages: packagesList.length,
            active_packages: activePackages,
            completed_packages: completedPackages,
            total_spent: totalSpent,
            outstanding_balance: outstandingBalance,
            last_activity: lastActivity,
          };
        })
      );

      return customersWithStats;
    },
  });
};
