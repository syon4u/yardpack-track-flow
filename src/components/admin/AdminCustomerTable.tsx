
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { CustomerData } from '@/hooks/useAdminCustomers';

interface AdminCustomerTableProps {
  customers: CustomerData[];
}

const AdminCustomerTable: React.FC<AdminCustomerTableProps> = ({ customers }) => {
  return (
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
            {customers?.map((customer) => (
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
  );
};

export default AdminCustomerTable;
