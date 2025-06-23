
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePackages } from '@/hooks/usePackages';
import { useUploadInvoice, useDownloadInvoice } from '@/hooks/useInvoices';
import PackageCard from './PackageCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Search, Clock, Truck, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

const CustomerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: packages, isLoading, error } = usePackages({ searchTerm, statusFilter });
  const uploadInvoiceMutation = useUploadInvoice();
  const downloadInvoiceMutation = useDownloadInvoice();

  // Calculate statistics
  const totalPackages = packages?.length || 0;
  const inTransitPackages = packages?.filter(p => p.status === 'in_transit').length || 0;
  const readyForPickup = packages?.filter(p => p.status === 'ready_for_pickup').length || 0;
  const pendingInvoices = packages?.filter(p => !p.invoices || p.invoices.length === 0).length || 0;
  const totalDue = packages?.reduce((sum, p) => sum + (p.total_due || 0), 0) || 0;

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
          console.error('Error uploading invoice:', error);
        }
      }
    };
    input.click();
  };

  const handleViewInvoice = async (packageId: string) => {
    const pkg = packages?.find(p => p.id === packageId);
    if (pkg && pkg.invoices && pkg.invoices.length > 0) {
      try {
        await downloadInvoiceMutation.mutateAsync(pkg.invoices[0].file_path);
      } catch (error) {
        console.error('Error downloading invoice:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.full_name || 'Valued Customer'}!
        </h1>
        <p className="text-blue-100">
          Track your packages from Miami to Jamaica with ease. We're here to get your items delivered safely.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPackages}</div>
            <p className="text-xs text-muted-foreground">All time shipments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inTransitPackages}</div>
            <p className="text-xs text-muted-foreground">On the way to Jamaica</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readyForPickup}</div>
            <p className="text-xs text-muted-foreground">Available for collection</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalDue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Outstanding balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      {(pendingInvoices > 0 || readyForPickup > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingInvoices > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  You have {pendingInvoices} package{pendingInvoices > 1 ? 's' : ''} waiting for invoice upload
                </span>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Pending
                </Badge>
              </div>
            )}
            {readyForPickup > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {readyForPickup} package{readyForPickup > 1 ? 's are' : ' is'} ready for pickup in Jamaica
                </span>
                <Badge className="bg-green-100 text-green-700">
                  Ready
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Your Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by tracking number or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="received">Received at Miami</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="arrived">Arrived in Jamaica</SelectItem>
                <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Packages List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Your Packages</h2>
          {packages && packages.length > 0 && (
            <Badge variant="secondary">
              {packages.length} package{packages.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-6 border rounded-lg">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 font-medium">Unable to load packages</p>
              <p className="text-red-500 text-sm">Please try again later or contact support</p>
            </CardContent>
          </Card>
        ) : !packages || packages.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No packages found' 
                  : 'No packages yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Contact YardPack to send your first package from Miami to Jamaica.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  View All Packages
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={{
                  id: pkg.id,
                  trackingNumber: pkg.tracking_number,
                  description: pkg.description,
                  status: pkg.status as any,
                  dateReceived: pkg.date_received,
                  estimatedDelivery: pkg.estimated_delivery || undefined,
                  invoiceUploaded: pkg.invoices && pkg.invoices.length > 0,
                  dutyAssessed: pkg.duty_amount !== null,
                  totalDue: pkg.total_due || undefined,
                  customerName: pkg.profiles?.full_name || 'Unknown Customer',
                }}
                userRole="customer"
                onUploadInvoice={handleUploadInvoice}
                onViewInvoice={handleViewInvoice}
              />
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Package Status Guide:</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• <strong>Received:</strong> Package arrived at Miami facility</li>
                <li>• <strong>In Transit:</strong> Package is on its way to Jamaica</li>
                <li>• <strong>Arrived:</strong> Package reached Jamaica facility</li>
                <li>• <strong>Ready:</strong> Package is ready for pickup</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Important Notes:</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Upload purchase invoices for customs clearance</li>
                <li>• Duty fees are calculated based on item value</li>
                <li>• Contact us for pickup arrangements</li>
                <li>• Track packages using your tracking numbers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
