import React, { useState } from 'react';
import { useOptimizedStats } from '@/hooks/useOptimizedCustomers';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';
import { useUpdatePackageStatus } from '@/hooks/usePackages';
import { useUploadInvoice, useDownloadInvoice } from '@/hooks/useInvoices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Users, TrendingUp, Clock, Plus, Scan, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PackageTable from '../PackageTable';
import CreatePackageForm from '../CreatePackageForm';
import { Database } from '@/integrations/supabase/types';

type PackageStatus = Database['public']['Enums']['package_status'];

const AdminOverview: React.FC = () => {
  const { data: stats, isPending } = useOptimizedStats();
  const navigate = useNavigate();
  
  // Package management state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  
  // Package data and handlers
  const { data: packagesResult, isPending: packagesLoading } = useOptimizedPackages({
    searchTerm,
    statusFilter: statusFilter === 'all' ? undefined : statusFilter
  });
  
  const updateStatusMutation = useUpdatePackageStatus();
  const uploadInvoiceMutation = useUploadInvoice();
  const downloadInvoiceMutation = useDownloadInvoice();

  const handleStatusUpdate = async (packageId: string, status: PackageStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ packageId, status });
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleUploadInvoice = async (packageId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await uploadInvoiceMutation.mutateAsync({ packageId, file });
        } catch (error) {
          // Error handling is done by the mutation
        }
      }
    };
    input.click();
  };

  const handleViewInvoice = async (packageId: string) => {
    const pkg = packagesResult?.data?.find(p => p.id === packageId);
    if (pkg && pkg.invoices && pkg.invoices.length > 0) {
      try {
        await downloadInvoiceMutation.mutateAsync(pkg.invoices[0].file_path);
      } catch (error) {
        // Error handling is done by the mutation
      }
    }
  };

  const handleViewDetails = (packageId: string) => {
    navigate(`/package/${packageId}`);
  };

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const packageStats = stats?.packages || {
    total: 0,
    received: 0,
    in_transit: 0,
    arrived: 0,
    ready_for_pickup: 0,
    picked_up: 0,
  };

  const customerStats = stats?.customers || {
    total: 0,
    registered: 0,
    package_only: 0,
    active: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage packages, customers, and system operations</p>
        </div>
        <div className="flex gap-3">
          <Link to="/warehouse">
            <Button variant="outline" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Scanner
            </Button>
          </Link>
          <Button className="flex items-center gap-2" onClick={() => setShowCreatePackage(true)}>
            <Plus className="h-4 w-4" />
            Create Package
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{packageStats.total}</div>
            <p className="text-xs text-green-600 mt-1">
              +{packageStats.received} this period
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{customerStats.active}</div>
            <p className="text-xs text-gray-500 mt-1">
              {customerStats.registered} registered
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Transit</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{packageStats.in_transit}</div>
            <p className="text-xs text-gray-500 mt-1">Currently shipping</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Pickup</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{packageStats.ready_for_pickup}</div>
            <p className="text-xs text-gray-500 mt-1">Ready for customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Package Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <h2 className="text-lg font-semibold text-gray-900">Package Management</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="received">Received at Miami</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="arrived">Arrived in Jamaica</SelectItem>
                <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {packagesLoading ? (
          <div className="border rounded-lg p-8 text-center">
            <div className="animate-pulse">Loading packages...</div>
          </div>
        ) : packagesResult?.data && packagesResult.data.length > 0 ? (
          <PackageTable
            packages={packagesResult.data}
            userRole="admin"
            onUploadInvoice={handleUploadInvoice}
            onViewInvoice={handleViewInvoice}
            onViewDetails={handleViewDetails}
            onStatusUpdate={handleStatusUpdate}
          />
        ) : (
          <div className="border rounded-lg p-8 text-center text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'No packages found matching your filters.' 
              : 'No packages found.'}
          </div>
        )}
      </div>

      {/* Create Package Modal */}
      {showCreatePackage && (
        <CreatePackageForm onClose={() => setShowCreatePackage(false)} />
      )}
    </div>
  );
};

export default AdminOverview;
