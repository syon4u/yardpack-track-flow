
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Search, Filter } from 'lucide-react';
import PackageCard, { Package as PackageType } from './PackageCard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data - replace with actual data fetching
  const [packages, setPackages] = useState<PackageType[]>([
    {
      id: '1',
      trackingNumber: 'YP2025001',
      description: 'Electronics Package',
      status: 'received',
      dateReceived: '2025-06-20',
      estimatedDelivery: '2025-06-28',
      invoiceUploaded: false,
      dutyAssessed: false,
      customerName: 'John Doe'
    },
    {
      id: '2',
      trackingNumber: 'YP2025002',
      description: 'Clothing Items',
      status: 'in_transit',
      dateReceived: '2025-06-18',
      estimatedDelivery: '2025-06-26',
      invoiceUploaded: true,
      dutyAssessed: true,
      totalDue: 125.50,
      customerName: 'Jane Smith'
    },
    {
      id: '3',
      trackingNumber: 'YP2025003',
      description: 'Books and Stationery',
      status: 'ready_for_pickup',
      dateReceived: '2025-06-15',
      invoiceUploaded: true,
      dutyAssessed: true,
      totalDue: 75.25,
      customerName: 'Mike Johnson'
    }
  ]);

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || pkg.status === statusFilter;
    const matchesUser = user?.role === 'admin' || pkg.customerName === user?.name;
    
    return matchesSearch && matchesFilter && matchesUser;
  });

  const handleStatusUpdate = (packageId: string, newStatus: PackageType['status']) => {
    setPackages(prev => prev.map(pkg => 
      pkg.id === packageId ? { ...pkg, status: newStatus } : pkg
    ));
    console.log(`Package ${packageId} status updated to ${newStatus}`);
  };

  const handleUploadInvoice = (packageId: string) => {
    console.log(`Upload invoice for package ${packageId}`);
    // In a real app, this would open a file upload dialog
    setPackages(prev => prev.map(pkg => 
      pkg.id === packageId ? { ...pkg, invoiceUploaded: true } : pkg
    ));
  };

  const handleViewInvoice = (packageId: string) => {
    console.log(`View invoice for package ${packageId}`);
  };

  const getStatusStats = () => {
    return {
      total: filteredPackages.length,
      received: filteredPackages.filter(p => p.status === 'received').length,
      in_transit: filteredPackages.filter(p => p.status === 'in_transit').length,
      ready: filteredPackages.filter(p => p.status === 'ready_for_pickup').length
    };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'My Packages'}
          </h2>
          <p className="text-muted-foreground">
            {user?.role === 'admin' 
              ? 'Manage packages and track shipments' 
              : 'Track your packages from Miami to Jamaica'
            }
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Miami</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.received}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Package className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_transit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ready}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Package Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Packages</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by tracking number or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filter">Status Filter</Label>
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <select
                  id="filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-input bg-background rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="received">Received</option>
                  <option value="in_transit">In Transit</option>
                  <option value="arrived">Arrived</option>
                  <option value="ready_for_pickup">Ready for Pickup</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPackages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            userRole={user?.role || 'customer'}
            onStatusUpdate={handleStatusUpdate}
            onUploadInvoice={handleUploadInvoice}
            onViewInvoice={handleViewInvoice}
          />
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No packages found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No packages to display at this time'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
