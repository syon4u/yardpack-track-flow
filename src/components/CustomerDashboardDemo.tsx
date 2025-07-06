import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Truck, CheckCircle, Clock, FileText, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';
import DashboardSkeleton from './loading/DashboardSkeleton';
import { PackageData } from '@/services';

const CustomerDashboardDemo = () => {
  const { profile } = useAuth();
  
  // Get live packages data - for customers, this will be filtered to their packages automatically
  const { data: packagesResult, isPending, error } = useOptimizedPackages({
    searchTerm: '',
    statusFilter: 'all'
  });

  const packages = packagesResult?.data || [];

  if (isPending) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Calculate statistics from live data
  const totalPackages = packages.length;
  const packagesInTransit = packages.filter(pkg => pkg.status === 'in_transit').length;
  const packagesReadyForPickup = packages.filter(pkg => pkg.status === 'ready_for_pickup').length;
  const totalDues = packages.reduce((sum, pkg) => sum + (pkg.total_due || 0), 0);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Total Packages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPackages}</div>
            <p className="text-sm text-gray-500">All packages associated with your account</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>In Transit</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{packagesInTransit}</div>
            <p className="text-sm text-gray-500">Packages currently on their way</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Ready for Pickup</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{packagesReadyForPickup}</div>
            <p className="text-sm text-gray-500">Packages awaiting pickup at our facility</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Total Dues</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalDues.toFixed(2)}</div>
            <p className="text-sm text-gray-500">Outstanding payments for your packages</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Packages</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {packages.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No packages found</p>
                <p className="text-sm text-gray-500 mt-1">Your packages will appear here once they arrive</p>
              </CardContent>
            </Card>
          ) : (
            packages.map(pkg => (
              <Card key={pkg.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {pkg.description}
                    <Badge variant="secondary">{pkg.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Tracking Number</p>
                    <p className="text-gray-600">{pkg.tracking_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-gray-600">{pkg.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Estimated Delivery</p>
                    <p className="text-gray-600">
                      {pkg.estimated_delivery ? new Date(pkg.estimated_delivery).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Notification</p>
                    <p className="text-gray-600">
                      {pkg.last_notification_status ? (
                        <>
                          <CheckCircle className="inline-block h-4 w-4 mr-1 text-green-500" />
                          Sent {pkg.last_notification_sent_at ? new Date(pkg.last_notification_sent_at).toLocaleDateString() : 'Recently'}
                        </>
                      ) : (
                        <>
                          <Clock className="inline-block h-4 w-4 mr-1 text-gray-500" />
                          No notifications sent
                        </>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="invoices">
          {packages.filter(pkg => pkg.invoice_uploaded).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No invoices available</p>
                <p className="text-sm text-gray-500 mt-1">Invoice documents will appear here when available</p>
              </CardContent>
            </Card>
          ) : (
            packages.map(pkg => (
              pkg.invoice_uploaded && (
                <Card key={pkg.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {pkg.description} - Invoices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">Invoice Available</p>
                        {pkg.total_due && (
                          <p className="text-sm text-muted-foreground">
                            Amount Due: ${pkg.total_due.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            ))
          )}
        </TabsContent>
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                If you have any questions or need assistance, please contact our support team.
              </p>
              <Button className="mt-4">Contact Support</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboardDemo;