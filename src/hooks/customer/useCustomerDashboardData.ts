import { usePackages } from '@/hooks/usePackages';

export const useCustomerDashboardData = () => {
  // Get packages for this customer - let service handle filtering automatically for customer role
  const { data: packages, isPending, error } = usePackages({
    searchTerm: '',
    statusFilter: 'all'
  });

  // For customer role, packages are already filtered by the service
  const customerPackages = packages || [];

  // Calculate statistics from packages
  const totalPackages = customerPackages.length;
  const totalValue = customerPackages.reduce((sum, p) => sum + (p.package_value || 0), 0);
  const totalDue = customerPackages.reduce((sum, p) => sum + (p.total_due || 0), 0);
  const pickedUpPackages = customerPackages.filter(p => p.status === 'picked_up').length;

  // Calculate status breakdown
  const receivedPackages = customerPackages.filter(p => p.status === 'received').length;
  const inTransitPackages = customerPackages.filter(p => p.status === 'in_transit').length;
  const arrivedPackages = customerPackages.filter(p => p.status === 'arrived').length;
  const readyForPickup = customerPackages.filter(p => p.status === 'ready_for_pickup').length;

  // Calculate pending invoices (packages without invoices)
  const pendingReceipts = customerPackages.filter(p => !p.receipt_uploaded).length;

  return {
    packages: customerPackages,
    isPending,
    error,
    stats: {
      totalPackages,
      totalValue,
      totalDue,
      pickedUpPackages,
      receivedPackages,
      inTransitPackages,
      arrivedPackages,
      readyForPickup,
      pendingReceipts
    }
  };
};