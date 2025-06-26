
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Calendar, Shield, Users, UserCheck } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone_number?: string;
  address?: string;
  created_at: string;
}

interface AdminUserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
}

const AdminUserTable: React.FC<AdminUserTableProps> = ({ users, onEditUser }) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'warehouse': return 'destructive';
      case 'customer': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'warehouse': return Users;
      case 'customer': return UserCheck;
      default: return Users;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'warehouse': return 'Warehouse Staff';
      case 'customer': return 'Customer Service';
      default: return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System User Directory</CardTitle>
        <p className="text-sm text-gray-600">
          Manage admin, warehouse, and customer service staff accounts
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <RoleIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.phone_number && (
                        <div className="text-sm flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.phone_number}
                        </div>
                      )}
                      {user.address && (
                        <div className="text-sm flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {user.address.substring(0, 30)}...
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onEditUser(user)}
                      >
                        Edit
                      </Button>
                      {user.role !== 'admin' && (
                        <Button variant="outline" size="sm" className="text-red-600">
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminUserTable;
