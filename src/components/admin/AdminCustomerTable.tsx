
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Calendar, MoreVertical } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomerWithStats {
  id: string;
  customer_number: string;
  customer_type: 'registered' | 'guest' | 'package_only';
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
}

interface AdminCustomerTableProps {
  customers: CustomerWithStats[];
}

const AdminCustomerTable: React.FC<AdminCustomerTableProps> = ({ customers }) => {
  const isMobile = useIsMobile();

  const getCustomerTypeBadge = (type: string) => {
    const variants = {
      registered: 'default',
      guest: 'secondary', 
      package_only: 'outline'
    } as const;
    
    const labels = {
      registered: 'Registered',
      guest: 'Guest',
      package_only: 'Package-Only'
    };

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'secondary'}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  if (isMobile) {
    // Mobile card layout
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Directory</h3>
        {customers?.map((customer) => (
          <Card key={customer.id} className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-sm">{customer.full_name}</h4>
                  <p className="text-xs text-gray-600">
                    {customer.customer_number}
                  </p>
                </div>
                {getCustomerTypeBadge(customer.customer_type)}
              </div>

              {/* Contact Info */}
              <div className="space-y-1">
                {customer.email && (
                  <div className="text-xs flex items-center text-gray-600">
                    <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.phone_number && (
                  <div className="text-xs flex items-center text-gray-600">
                    <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span>{customer.phone_number}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="text-xs flex items-center text-gray-600">
                    <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {customer.address.length > 40 ? `${customer.address.substring(0, 40)}...` : customer.address}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-600">Packages</p>
                  <p className="font-medium">{customer.total_packages} total</p>
                  <p className="text-green-600">{customer.active_packages} active</p>
                </div>
                <div>
                  <p className="text-gray-600">Financial</p>
                  <p className="font-medium">${customer.total_spent.toFixed(2)} spent</p>
                  {customer.outstanding_balance > 0 && (
                    <p className="text-red-600">${customer.outstanding_balance.toFixed(2)} due</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs flex items-center text-gray-600">
                  <Calendar className="h-3 w-3 mr-1" />
                  {customer.last_activity 
                    ? new Date(customer.last_activity).toLocaleDateString()
                    : new Date(customer.created_at).toLocaleDateString()
                  }
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Packages</DropdownMenuItem>
                    {customer.email && (
                      <DropdownMenuItem>Contact</DropdownMenuItem>
                    )}
                    <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop table layout
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Directory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
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
                        {customer.customer_number}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getCustomerTypeBadge(customer.customer_type)}
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
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCustomerTable;
