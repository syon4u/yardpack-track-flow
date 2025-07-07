import { useMemo } from 'react';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';

export const useCustomerDashboardData = () => {
  const { data: packagesResult, isPending, error } = useOptimizedPackages({
    searchTerm: '',
    statusFilter: 'all'
  });

  const customerPackages = packagesResult?.data || [];

  const dashboardStats = useMemo(() => {
    const totalPackages = customerPackages.length;
    const totalValue = customerPackages.reduce((sum, p) => sum + (p.package_value || 0), 0);
    const totalDue = customerPackages.reduce((sum, p) => sum + (p.total_due || 0), 0);
    const pickedUpPackages = customerPackages.filter(p => p.status === 'picked_up').length;

    // Status breakdown
    const receivedPackages = customerPackages.filter(p => p.status === 'received').length;
    const inTransitPackages = customerPackages.filter(p => p.status === 'in_transit').length;
    const arrivedPackages = customerPackages.filter(p => p.status === 'arrived').length;
    const readyForPickup = customerPackages.filter(p => p.status === 'ready_for_pickup').length;

    // Pending invoices (packages without invoices)
    const pendingInvoices = customerPackages.filter(p => !p.invoice_uploaded).length;

    return {
      totalPackages,
      totalValue,
      totalDue,
      pickedUpPackages,
      receivedPackages,
      inTransitPackages,
      arrivedPackages,
      readyForPickup,
      pendingInvoices
    };
  }, [customerPackages]);

  return {
    customerPackages,
    dashboardStats,
    isPending,
    error
  };
};