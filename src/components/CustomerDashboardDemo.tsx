import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PackageCard from './PackageCard';
import PackageTable from './PackageTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Search, Truck, CheckCircle, AlertCircle, DollarSign, LayoutGrid, LayoutList } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { UnifiedPackage } from '@/types/unified';

type DatabasePackage = Database['public']['Tables']['packages']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null;
  invoices: Database['public']['Tables']['invoices']['Row'][];
};

// Sample data for demo purposes - now matching the full Package database structure with new tracking fields
const samplePackages: DatabasePackage[] = [
  {
    id: '1',
    tracking_number: 'YP2024008',
    description: 'MacBook Pro 16" and Accessories',
    status: 'received' as const,
    date_received: '2024-06-23T10:30:00-05:00',
    estimated_delivery: '2024-06-28T14:00:00-05:00',
    actual_delivery: null,
    invoices: [],
    duty_amount: null,
    duty_rate: 0.15,
    total_due: null,
    customer_id: 'sample-customer-id',
    delivery_address: '123 Main St, Kingston, Jamaica',
    sender_name: 'Apple Store',
    sender_address: '456 Tech Ave, Miami, FL',
    weight: 2.5,
    dimensions: '35x25x5 cm',
    package_value: 2500.00,
    notes: null,
    created_at: '2024-06-23T10:30:00-05:00',
    updated_at: '2024-06-23T10:30:00-05:00',
    carrier: 'USPS',
    external_tracking_number: '9405536896846285432100',
    last_api_sync: '2024-06-23T11:00:00-05:00',
    api_sync_status: 'synced',
    delivery_estimate: '2024-06-28T14:00:00-05:00',
    profiles: { 
      id: 'sample-customer-id',
      full_name: 'Adam Grant', 
      email: 'adam.grant@example.com',
      address: '123 Main St, Kingston, Jamaica',
      phone_number: '+1-876-555-0123',
      role: 'customer' as const,
      created_at: '2024-06-20T10:00:00-05:00',
      updated_at: '2024-06-20T10:00:00-05:00'
    }
  },
  {
    id: '2',
    tracking_number: 'YP2024009',
    description: 'Nike Sneakers and Athletic Wear',
    status: 'in_transit' as const,
    date_received: '2024-06-22T09:15:00-05:00',
    estimated_delivery: '2024-06-27T16:00:00-05:00',
    actual_delivery: null,
    invoices: [{ 
      id: '1', 
      file_path: '/invoices/invoice1.pdf', 
      file_name: 'invoice1.pdf', 
      file_type: 'pdf', 
      file_size: 1024, 
      uploaded_at: '2024-06-22T10:00:00-05:00', 
      uploaded_by: 'sample-customer-id', 
      package_id: '2' 
    }],
    duty_amount: 48.00,
    duty_rate: 0.15,
    total_due: 48.00,
    customer_id: 'sample-customer-id',
    delivery_address: '123 Main St, Kingston, Jamaica',
    sender_name: 'Nike Store',
    sender_address: '789 Sports Blvd, Miami, FL',
    weight: 1.2,
    dimensions: '30x20x15 cm',
    package_value: 320.00,
    notes: null,
    created_at: '2024-06-22T09:15:00-05:00',
    updated_at: '2024-06-22T09:15:00-05:00',
    carrier: 'FEDEX',
    external_tracking_number: '773875842019',
    last_api_sync: '2024-06-22T15:30:00-05:00',
    api_sync_status: 'synced',
    delivery_estimate: '2024-06-27T16:00:00-05:00',
    profiles: { 
      id: 'sample-customer-id',
      full_name: 'Adam Grant', 
      email: 'adam.grant@example.com',
      address: '123 Main St, Kingston, Jamaica',
      phone_number: '+1-876-555-0123',
      role: 'customer' as const,
      created_at: '2024-06-20T10:00:00-05:00',
      updated_at: '2024-06-20T10:00:00-05:00'
    }
  },
  {
    id: '3',
    tracking_number: 'YP2024010',
    description: 'Vitamins and Health Supplements',
    status: 'ready_for_pickup' as const,
    date_received: '2024-06-20T14:45:00-05:00',
    estimated_delivery: '2024-06-24T12:00:00-05:00',
    actual_delivery: null,
    invoices: [{ 
      id: '2', 
      file_path: '/invoices/invoice2.pdf', 
      file_name: 'invoice2.pdf', 
      file_type: 'pdf', 
      file_size: 512, 
      uploaded_at: '2024-06-20T15:00:00-05:00', 
      uploaded_by: 'sample-customer-id', 
      package_id: '3' 
    }],
    duty_amount: 12.75,
    duty_rate: 0.15,
    total_due: 12.75,
    customer_id: 'sample-customer-id',
    delivery_address: '123 Main St, Kingston, Jamaica',
    sender_name: 'Health Plus',
    sender_address: '321 Wellness Way, Miami, FL',
    weight: 0.8,
    dimensions: '20x15x10 cm',
    package_value: 85.00,
    notes: null,
    created_at: '2024-06-20T14:45:00-05:00',
    updated_at: '2024-06-20T14:45:00-05:00',
    carrier: 'UPS',
    external_tracking_number: '1Z999AA1234567890',
    last_api_sync: '2024-06-20T16:15:00-05:00',
    api_sync_status: 'synced',
    delivery_estimate: '2024-06-24T12:00:00-05:00',
    profiles: { 
      id: 'sample-customer-id',
      full_name: 'Adam Grant', 
      email: 'adam.grant@example.com',
      address: '123 Main St, Kingston, Jamaica',
      phone_number: '+1-876-555-0123',
      role: 'customer' as const,
      created_at: '2024-06-20T10:00:00-05:00',
      updated_at: '2024-06-20T10:00:00-05:00'
    }
  },
  {
    id: '4',
    tracking_number: 'YP2024011',
    description: 'iPhone 15 Pro Case and Screen Protector',
    status: 'picked_up' as const,
    date_received: '2024-06-18T11:30:00-05:00',
    estimated_delivery: '2024-06-22T10:00:00-05:00',
    actual_delivery: '2024-06-22T14:30:00-05:00',
    invoices: [{ 
      id: '3', 
      file_path: '/invoices/invoice3.pdf', 
      file_name: 'invoice3.pdf', 
      file_type: 'pdf', 
      file_size: 256, 
      uploaded_at: '2024-06-18T12:00:00-05:00', 
      uploaded_by: 'sample-customer-id', 
      package_id: '4' 
    }],
    duty_amount: 11.25,
    duty_rate: 0.15,
    total_due: 11.25,
    customer_id: 'sample-customer-id',
    delivery_address: '123 Main St, Kingston, Jamaica',
    sender_name: 'Best Buy',
    sender_address: '654 Electronics Dr, Miami, FL',
    weight: 0.3,
    dimensions: '15x10x3 cm',
    package_value: 75.00,
    notes: null,
    created_at: '2024-06-18T11:30:00-05:00',
    updated_at: '2024-06-22T14:30:00-05:00',
    carrier: 'USPS',
    external_tracking_number: '9405536896846285432101',
    last_api_sync: '2024-06-22T14:30:00-05:00',
    api_sync_status: 'synced',
    delivery_estimate: null,
    profiles: { 
      id: 'sample-customer-id',
      full_name: 'Adam Grant', 
      email: 'adam.grant@example.com',
      address: '123 Main St, Kingston, Jamaica',
      phone_number: '+1-876-555-0123',
      role: 'customer' as const,
      created_at: '2024-06-20T10:00:00-05:00',
      updated_at: '2024-06-20T10:00:00-05:00'
    }
  },
  {
    id: '5',
    tracking_number: 'YP2024012',
    description: 'Coffee Maker and Kitchen Accessories',
    status: 'arrived' as const,
    date_received: '2024-06-21T16:20:00-05:00',
    estimated_delivery: '2024-06-25T11:00:00-05:00',
    actual_delivery: null,
    invoices: [{ 
      id: '4', 
      file_path: '/invoices/invoice4.pdf', 
      file_name: 'invoice4.pdf', 
      file_type: 'pdf', 
      file_size: 768, 
      uploaded_at: '2024-06-21T17:00:00-05:00', 
      uploaded_by: 'sample-customer-id', 
      package_id: '5' 
    }],
    duty_amount: 67.50,
    duty_rate: 0.15,
    total_due: 67.50,
    customer_id: 'sample-customer-id',
    delivery_address: '123 Main St, Kingston, Jamaica',
    sender_name: 'Williams Sonoma',
    sender_address: '987 Kitchen St, Miami, FL',
    weight: 4.2,
    dimensions: '40x30x25 cm',
    package_value: 450.00,
    notes: null,
    created_at: '2024-06-21T16:20:00-05:00',
    updated_at: '2024-06-21T16:20:00-05:00',
    carrier: 'DHL',
    external_tracking_number: '1234567890',
    last_api_sync: '2024-06-21T18:00:00-05:00',
    api_sync_status: 'pending',
    delivery_estimate: '2024-06-25T11:00:00-05:00',
    profiles: { 
      id: 'sample-customer-id',
      full_name: 'Adam Grant', 
      email: 'adam.grant@example.com',
      address: '123 Main St, Kingston, Jamaica',
      phone_number: '+1-876-555-0123',
      role: 'customer' as const,
      created_at: '2024-06-20T10:00:00-05:00',
      updated_at: '2024-06-20T10:00:00-05:00'
    }
  }
];

// Transform sample packages to UnifiedPackage format
const transformedSamplePackages: UnifiedPackage[] = samplePackages.map(pkg => ({
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
  invoices: pkg.invoices,
  invoice_uploaded: pkg.invoices && pkg.invoices.length > 0,
  duty_assessed: pkg.duty_amount !== null,
  notes: pkg.notes,
  api_sync_status: pkg.api_sync_status,
  last_api_sync: pkg.last_api_sync,
  profiles: pkg.profiles
}));

const CustomerDashboardDemo: React.FC = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'tiles' | 'table'>('tiles');
  
  // Filter packages based on search and status
  const filteredPackages = transformedSamplePackages.filter(pkg => {
    const matchesSearch = !searchTerm || 
      pkg.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics using transformed packages
  const totalPackages = transformedSamplePackages.length;
  const inTransitPackages = transformedSamplePackages.filter(p => p.status === 'in_transit').length;
  const readyForPickup = transformedSamplePackages.filter(p => p.status === 'ready_for_pickup').length;
  const pendingInvoices = transformedSamplePackages.filter(p => !p.invoice_uploaded).length;
  const totalDue = transformedSamplePackages.reduce((sum, p) => sum + (p.total_due || 0), 0);

  const handleUploadInvoice = (packageId: string) => {
    console.log('Upload invoice for package:', packageId);
    // Demo function - would normally trigger file upload
  };

  const handleViewInvoice = (packageId: string) => {
    console.log('View invoice for package:', packageId);
    // Demo function - would normally download/view invoice
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, Adam Grant!
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
        </CardContent>
      </Card>

      {/* Packages List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Your Packages</h2>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              {filteredPackages.length} package{filteredPackages.length > 1 ? 's' : ''}
            </Badge>
            
            {/* View Mode Toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'tiles' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tiles')}
                className="rounded-r-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Package Content */}
        {viewMode === 'tiles' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={{
                  id: pkg.id,
                  trackingNumber: pkg.tracking_number,
                  description: pkg.description,
                  status: pkg.status,
                  dateReceived: pkg.date_received,
                  estimatedDelivery: pkg.estimated_delivery || undefined,
                  invoiceUploaded: pkg.invoice_uploaded,
                  dutyAssessed: pkg.duty_assessed,
                  totalDue: pkg.total_due || undefined,
                  customerName: pkg.customer_name,
                }}
                userRole="customer"
                onUploadInvoice={handleUploadInvoice}
                onViewInvoice={handleViewInvoice}
              />
            ))}
          </div>
        ) : (
          <PackageTable
            packages={filteredPackages}
            userRole="customer"
            onUploadInvoice={handleUploadInvoice}
            onViewInvoice={handleViewInvoice}
          />
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

export default CustomerDashboardDemo;
