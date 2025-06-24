
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Mail, Phone, MapPin, Calendar, Package, DollarSign, Users, UserCheck } from 'lucide-react';

interface CustomerData {
  id: string;
  type: 'registered' | 'package_only';
  full_name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  created_at: string;
  total_packages: number;
  active_packages: number;
  completed_packages: number;
  total_spent: number;
  outstanding_balance: number;
  last_activity: string | null;
  registration_status: 'registered' | 'guest';
}

const AdminCustomerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      // Get registered users with their package stats
      const { data: registeredUsers, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          packages!packages_customer_id_fkey(
            id,
            status,
            package_value,
            duty_amount,
            total_due,
            created_at
          )
        `);

      if (profilesError) throw profilesError;

      // Get packages with sender information (for non-registered customers)
      const { data: allPackages, error: packagesError } = await supabase
        .from('packages')
        .select('*');

      if (packagesError) throw packagesError;

      const customerMap = new Map<string, CustomerData>();

      // Process registered users
      registeredUsers?.forEach(user => {
        const userPackages = user.packages || [];
        const totalSpent = userPackages.reduce((sum, pkg) => sum + (pkg.package_value || 0), 0);
        const outstandingBalance = userPackages.reduce((sum, pkg) => sum + (pkg.total_due || 0), 0);
        const activePackages = userPackages.filter(pkg => 
          ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)
        ).length;
        const completedPackages = userPackages.filter(pkg => pkg.status === 'picked_up').length;
        const lastActivity = userPackages.length > 0 
          ? userPackages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;

        customerMap.set(user.id, {
          id: user.id,
          type: 'registered',
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          address: user.address,
          created_at: user.created_at,
          total_packages: userPackages.length,
          active_packages: activePackages,
          completed_packages: completedPackages,
          total_spent: totalSpent,
          outstanding_balance: outstandingBalance,
          last_activity: lastActivity,
          registration_status: 'registered'
        });
      });

      // Process packages to find non-registered customers
      const packageOnlyCustomers = new Map<string, {
        name: string;
        address: string;
        packages: typeof allPackages;
      }>();

      allPackages?.forEach(pkg => {
        // Skip if this package belongs to a registered user
        if (customerMap.has(pkg.customer_id)) return;

        const customerKey = `${pkg.sender_name || 'Unknown'}_${pkg.delivery_address}`;
        
        if (!packageOnlyCustomers.has(customerKey)) {
          packageOnlyCustomers.set(customerKey, {
            name: pkg.sender_name || 'Unknown Customer',
            address: pkg.delivery_address,
            packages: []
          });
        }
        
        packageOnlyCustomers.get(customerKey)?.packages.push(pkg);
      });

      // Convert package-only customers to CustomerData format
      packageOnlyCustomers.forEach((customerInfo, customerKey) => {
        const packages = customerInfo.packages;
        const totalSpent = packages.reduce((sum, pkg) => sum + (pkg.package_value || 0), 0);
        const outstandingBalance = packages.reduce((sum, pkg) => sum + (pkg.total_due || 0), 0);
        const activePackages = packages.filter(pkg => 
          ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(pkg.status)
        ).length;
        const completedPackages = packages.filter(pkg => pkg.status === 'picked_up').length;
        const lastActivity = packages.length > 0 
          ? packages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;

        customerMap.set(customerKey, {
          id: customerKey,
          type: 'package_only',
          full_name: customerInfo.name,
          email: null,
          phone_number: null,
          address: customerInfo.address,
          created_at: packages[0]?.created_at || new Date().toISOString(),
          total_packages: packages.length,
          active_packages: activePackages,
          completed_packages: completedPackages,
          total_spent: totalSpent,
          outstanding_balance: outstandingBalance,
          last_activity: lastActivity,
          registration_status: 'guest'
        });
      });

      return Array.from(customerMap.values()).sort((a, b) => 
        new Date(b.last_activity || b.created_at).getTime() - new Date(a.last_activity || a.created_at).getTime()
      );
    }
  });

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = customerTypeFilter === 'all' || customer.type === customerTypeFilter;
    
    const matchesActivity = activityFilter === 'all' || 
                           (activityFilter === 'active' && customer.active_packages > 0) ||
                           (activityFilter === 'inactive' && customer.active_packages === 0);
    
    return matchesSearch && matchesType && matchesActivity;
  });

  const totalCustomers = customers?.length || 0;
  const registeredCustomers = customers?.filter(c => c.type === 'registered').length || 0;
  const packageOnlyCustomers = customers?.filter(c => c.type === 'package_only').length || 0;
  const activeCustomers = customers?.filter(c => c.active_packages > 0).length || 0;

  if (isLoading) {
    return <div>Loading customer data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Customer Management</h2>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">All customer records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registeredCustomers}</div>
            <p className="text-xs text-muted-foreground">Have user accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Package-Only</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packageOnlyCustomers}</div>
            <p className="text-xs text-muted-foreground">From scanned packages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">With pending packages</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="registered">Registered Users</SelectItem>
            <SelectItem value="package_only">Package-Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activityFilter} onValueChange={setActivityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Package Stats</TableHead>
                <TableHead>Financial</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers?.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.full_name}</div>
                      <div className="text-sm text-gray-600">
                        ID: {customer.id.length > 20 ? `${customer.id.substring(0, 8)}...` : customer.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.type === 'registered' ? 'default' : 'secondary'}>
                      {customer.type === 'registered' ? 'Registered' : 'Package-Only'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="text-sm flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone_number && (
                        <div className="text-sm flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {customer.phone_number}
                        </div>
                      )}
                      {customer.address && (
                        <div className="text-sm flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {customer.address.length > 30 ? `${customer.address.substring(0, 30)}...` : customer.address}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>{customer.total_packages} total packages</div>
                      <div className="text-green-600">{customer.active_packages} active</div>
                      <div className="text-gray-600">{customer.completed_packages} completed</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="font-medium">${customer.total_spent.toFixed(2)} spent</div>
                      {customer.outstanding_balance > 0 && (
                        <div className="text-red-600">${customer.outstanding_balance.toFixed(2)} due</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {customer.last_activity 
                        ? new Date(customer.last_activity).toLocaleDateString()
                        : new Date(customer.created_at).toLocaleDateString()
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Packages
                      </Button>
                      {customer.email && (
                        <Button variant="outline" size="sm">
                          Contact
                        </Button>
                      )}
                      {customer.type === 'package_only' && (
                        <Button variant="outline" size="sm">
                          Convert
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomerManagement;
