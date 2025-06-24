
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePackages } from '@/hooks/usePackages';
import PackageList from './PackageList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Search, Clock, Truck, CheckCircle, AlertCircle, DollarSign, Calendar, MapPin, FileText, User } from 'lucide-react';

const CustomerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: packages, isLoading, error } = usePackages({ searchTerm, statusFilter });

  // Calculate statistics
  const totalPackages = packages?.length || 0;
  const receivedPackages = packages?.filter(p => p.status === 'received').length || 0;
  const inTransitPackages = packages?.filter(p => p.status === 'in_transit').length || 0;
  const arrivedPackages = packages?.filter(p => p.status === 'arrived').length || 0;
  const readyForPickup = packages?.filter(p => p.status === 'ready_for_pickup').length || 0;
  const pickedUpPackages = packages?.filter(p => p.status === 'picked_up').length || 0;
  const pendingInvoices = packages?.filter(p => !p.invoices || p.invoices.length === 0).length || 0;
  const totalValue = packages?.reduce((sum, p) => sum + (p.package_value || 0), 0) || 0;
  const totalDue = packages?.reduce((sum, p) => sum + (p.total_due || 0), 0) || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'arrived': return 'bg-purple-100 text-purple-800';
      case 'ready_for_pickup': return 'bg-green-100 text-green-800';
      case 'picked_up': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'Valued Customer'}!
          </h1>
          <p className="text-gray-600 mt-2">Track and manage your packages from Miami to Jamaica</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Customer
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packages">My Packages</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Package Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Package Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Received at Miami</span>
                  <Badge variant="secondary">{receivedPackages}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">In Transit</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{inTransitPackages}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Arrived in Jamaica</span>
                  <Badge className="bg-purple-100 text-purple-800">{arrivedPackages}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ready for Pickup</span>
                  <Badge className="bg-green-100 text-green-800">{readyForPickup}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Picked Up</span>
                  <Badge variant="outline">{pickedUpPackages}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Package Value</span>
                  <span className="font-bold">${totalValue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Outstanding Balance</span>
                  <span className="font-bold text-orange-600">${totalDue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pending Invoices</span>
                  <Badge variant={pendingInvoices > 0 ? "destructive" : "outline"}>
                    {pendingInvoices}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Package Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages?.slice(0, 5).map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.tracking_number}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">{pkg.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(pkg.status)}>
                          {formatStatus(pkg.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(pkg.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {pkg.package_value ? `$${pkg.package_value.toFixed(2)}` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {packages && packages.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No packages found. Your packages will appear here once they're registered.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by tracking number or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                <SelectItem value="picked_up">Picked Up</SelectItem>
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

          {/* Packages List */}
          <PackageList
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Invoice management features will be available here.</p>
                <p className="text-sm">Upload and manage your purchase invoices for customs clearance.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border">
                    {profile?.full_name || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border">
                    {profile?.email || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border">
                    {profile?.phone_number || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border">
                    <Badge variant="outline">{profile?.role || 'Customer'}</Badge>
                  </div>
                </div>
              </div>
              
              {profile?.address && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                    {profile.address}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Account Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalPackages}</div>
                    <div className="text-xs text-gray-600">Total Packages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">Total Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">${totalDue.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">Amount Due</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{pickedUpPackages}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                <li>• <strong>Picked Up:</strong> Package has been collected</li>
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
