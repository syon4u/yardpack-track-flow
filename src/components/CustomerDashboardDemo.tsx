import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Truck, CheckCircle, Clock, FileText, DollarSign } from 'lucide-react';

interface DatabasePackage {
  id: string;
  tracking_number: string;
  description: string;
  status: 'received' | 'in_transit' | 'arrived' | 'ready_for_pickup' | 'picked_up';
  date_received: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  invoices: Array<{
    id: string;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploaded_at: string;
    uploaded_by: string;
    package_id: string;
  }>;
  duty_amount: number | null;
  total_due: number | null;
  customer_id: string;
  delivery_address: string;
  sender_name: string | null;
  sender_address: string | null;
  weight: number | null;
  dimensions: string | null;
  package_value: number | null;
  notes: string | null;
  carrier: string | null;
  external_tracking_number: string | null;
  created_at: string;
  updated_at: string;
  delivery_estimate: string | null;
  duty_rate: number | null;
  api_sync_status: string | null;
  last_api_sync: string | null;
  profiles: {
    full_name: string;
    email: string;
    address: string | null;
    created_at: string;
    id: string;
    phone_number: string | null;
    role: 'customer' | 'admin';
    updated_at: string;
  } | null;
  last_notification_status: string | null;
  last_notification_sent_at: string | null;
}

const CustomerDashboardDemo = () => {
  const mockPackages: DatabasePackage[] = [
    {
      id: '1',
      tracking_number: 'YP2024-001',
      description: 'Electronics - Smartphone',
      status: 'received' as const,
      date_received: '2024-01-15T10:00:00Z',
      estimated_delivery: '2024-01-25T00:00:00Z',
      actual_delivery: null,
      invoices: [],
      duty_amount: null,
      total_due: null,
      customer_id: 'cust-1',
      delivery_address: '123 Main St, Kingston, Jamaica',
      sender_name: 'Amazon',
      sender_address: '123 Business Ave, Miami, FL',
      weight: 2.5,
      dimensions: '10x8x3 inches',
      package_value: 299.99,
      notes: null,
      carrier: 'DHL',
      external_tracking_number: 'DHL123456789',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      delivery_estimate: '2024-01-25T00:00:00Z',
      duty_rate: 0.15,
      api_sync_status: 'synced',
      last_api_sync: '2024-01-15T10:00:00Z',
      last_notification_status: 'received' as const,
      last_notification_sent_at: '2024-01-15T10:05:00Z',
      profiles: {
        full_name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St, Kingston, Jamaica',
        created_at: '2024-01-01T00:00:00Z',
        id: 'profile-1',
        phone_number: '+1-876-555-0123',
        role: 'customer' as const,
        updated_at: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: '2',
      tracking_number: 'YP2024-002',
      description: 'Clothing - Winter Jacket',
      status: 'in_transit' as const,
      date_received: '2024-01-12T14:30:00Z',
      estimated_delivery: '2024-01-22T00:00:00Z',
      actual_delivery: null,
      invoices: [
        {
          id: 'inv-1',
          file_path: '/invoices/jacket-invoice.pdf',
          file_name: 'jacket-invoice.pdf',
          file_type: 'application/pdf',
          file_size: 245760,
          uploaded_at: '2024-01-12T15:00:00Z',
          uploaded_by: 'admin-1',
          package_id: '2'
        }
      ],
      duty_amount: 22.50,
      total_due: 22.50,
      customer_id: 'cust-1',
      delivery_address: '123 Main St, Kingston, Jamaica',
      sender_name: 'Fashion Store',
      sender_address: '456 Style Blvd, New York, NY',
      weight: 1.2,
      dimensions: '12x10x4 inches',
      package_value: 150.00,
      notes: 'Handle with care',
      carrier: 'FedEx',
      external_tracking_number: 'FDX987654321',
      created_at: '2024-01-12T14:30:00Z',
      updated_at: '2024-01-13T09:00:00Z',
      delivery_estimate: '2024-01-22T00:00:00Z',
      duty_rate: 0.15,
      api_sync_status: 'synced',
      last_api_sync: '2024-01-13T09:00:00Z',
      last_notification_status: 'in_transit' as const,
      last_notification_sent_at: '2024-01-13T09:05:00Z',
      profiles: {
        full_name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St, Kingston, Jamaica',
        created_at: '2024-01-01T00:00:00Z',
        id: 'profile-1',
        phone_number: '+1-876-555-0123',
        role: 'customer' as const,
        updated_at: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: '3',
      tracking_number: 'YP2024-003',
      description: 'Books - Educational Materials',
      status: 'ready_for_pickup' as const,
      date_received: '2024-01-10T08:00:00Z',
      estimated_delivery: '2024-01-20T00:00:00Z',
      actual_delivery: null,
      invoices: [
        {
          id: 'inv-2',
          file_path: '/invoices/books-invoice.pdf',
          file_name: 'books-invoice.pdf',
          file_type: 'application/pdf',
          file_size: 180240,
          uploaded_at: '2024-01-10T09:00:00Z',
          uploaded_by: 'admin-1',
          package_id: '3'
        }
      ],
      duty_amount: 15.75,
      total_due: 15.75,
      customer_id: 'cust-1',
      delivery_address: '123 Main St, Kingston, Jamaica',
      sender_name: 'BookStore Inc',
      sender_address: '789 Knowledge Ave, Boston, MA',
      weight: 3.0,
      dimensions: '14x11x6 inches',
      package_value: 105.00,
      notes: 'Educational materials',
      carrier: 'UPS',
      external_tracking_number: 'UPS456789123',
      created_at: '2024-01-10T08:00:00Z',
      updated_at: '2024-01-18T16:00:00Z',
      delivery_estimate: '2024-01-20T00:00:00Z',
      duty_rate: 0.15,
      api_sync_status: 'synced',
      last_api_sync: '2024-01-18T16:00:00Z',
      last_notification_status: 'ready_for_pickup' as const,
      last_notification_sent_at: '2024-01-18T16:05:00Z',
      profiles: {
        full_name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St, Kingston, Jamaica',
        created_at: '2024-01-01T00:00:00Z',
        id: 'profile-1',
        phone_number: '+1-876-555-0123',
        role: 'customer' as const,
        updated_at: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: '4',
      tracking_number: 'YP2024-004',
      description: 'Home Goods - Kitchen Appliance',
      status: 'picked_up' as const,
      date_received: '2024-01-05T12:00:00Z',
      estimated_delivery: '2024-01-15T00:00:00Z',
      actual_delivery: '2024-01-16T14:30:00Z',
      invoices: [
        {
          id: 'inv-3',
          file_path: '/invoices/appliance-invoice.pdf',
          file_name: 'appliance-invoice.pdf',
          file_type: 'application/pdf',
          file_size: 320480,
          uploaded_at: '2024-01-05T13:00:00Z',
          uploaded_by: 'admin-1',
          package_id: '4'
        }
      ],
      duty_amount: 37.50,
      total_due: 0, // Paid
      customer_id: 'cust-1',
      delivery_address: '123 Main St, Kingston, Jamaica',
      sender_name: 'Kitchen World',
      sender_address: '321 Appliance St, Chicago, IL',
      weight: 5.8,
      dimensions: '16x14x12 inches',
      package_value: 250.00,
      notes: 'Fragile - Kitchen appliance',
      carrier: 'DHL',
      external_tracking_number: 'DHL789123456',
      created_at: '2024-01-05T12:00:00Z',
      updated_at: '2024-01-16T14:30:00Z',
      delivery_estimate: '2024-01-15T00:00:00Z',
      duty_rate: 0.15,
      api_sync_status: 'synced',
      last_api_sync: '2024-01-16T14:30:00Z',
      last_notification_status: 'picked_up' as const,
      last_notification_sent_at: '2024-01-16T14:35:00Z',
      profiles: {
        full_name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St, Kingston, Jamaica',
        created_at: '2024-01-01T00:00:00Z',
        id: 'profile-1',
        phone_number: '+1-876-555-0123',
        role: 'customer' as const,
        updated_at: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: '5',
      tracking_number: 'YP2024-005',
      description: 'Sports Equipment - Tennis Racket',
      status: 'arrived' as const,
      date_received: '2024-01-08T16:00:00Z',
      estimated_delivery: '2024-01-18T00:00:00Z',
      actual_delivery: null,
      invoices: [
        {
          id: 'inv-4',
          file_path: '/invoices/sports-invoice.pdf',
          file_name: 'sports-invoice.pdf',
          file_type: 'application/pdf',
          file_size: 195840,
          uploaded_at: '2024-01-08T17:00:00Z',
          uploaded_by: 'admin-1',
          package_id: '5'
        }
      ],
      duty_amount: 18.00,
      total_due: 18.00,
      customer_id: 'cust-1',
      delivery_address: '123 Main St, Kingston, Jamaica',
      sender_name: 'SportsPro',
      sender_address: '654 Athletic Way, Los Angeles, CA',
      weight: 0.8,
      dimensions: '28x12x2 inches',
      package_value: 120.00,
      notes: 'Sports equipment',
      carrier: 'FedEx',
      external_tracking_number: 'FDX123789456',
      created_at: '2024-01-08T16:00:00Z',
      updated_at: '2024-01-17T11:00:00Z',
      delivery_estimate: '2024-01-18T00:00:00Z',
      duty_rate: 0.15,
      api_sync_status: 'synced',
      last_api_sync: '2024-01-17T11:00:00Z',
      last_notification_status: 'arrived' as const,
      last_notification_sent_at: '2024-01-17T11:05:00Z',
      profiles: {
        full_name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St, Kingston, Jamaica',
        created_at: '2024-01-01T00:00:00Z',
        id: 'profile-1',
        phone_number: '+1-876-555-0123',
        role: 'customer' as const,
        updated_at: '2024-01-01T00:00:00Z'
      }
    }
  ];

  const totalPackages = mockPackages.length;
  const packagesInTransit = mockPackages.filter(pkg => pkg.status === 'in_transit').length;
  const packagesReadyForPickup = mockPackages.filter(pkg => pkg.status === 'ready_for_pickup').length;
  const totalDues = mockPackages.reduce((sum, pkg) => sum + (pkg.total_due || 0), 0);

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
          {mockPackages.map(pkg => (
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
                  <p className="text-gray-600">{pkg.estimated_delivery || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Notification</p>
                  <p className="text-gray-600">
                    {pkg.last_notification_status ? (
                      <>
                        <CheckCircle className="inline-block h-4 w-4 mr-1 text-green-500" />
                        Sent {new Date(pkg.last_notification_sent_at || '').toLocaleDateString()}
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
          ))}
        </TabsContent>
        <TabsContent value="invoices">
          {mockPackages.map(pkg => (
            pkg.invoices.length > 0 && (
              <Card key={pkg.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {pkg.description} - Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pkg.invoices.map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between">
                      <p className="text-gray-600">{invoice.file_name}</p>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          ))}
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
