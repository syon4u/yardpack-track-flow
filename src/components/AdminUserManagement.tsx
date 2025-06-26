
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Mail, Phone, MapPin, Calendar, UserPlus } from 'lucide-react';
import CreateUserForm from './admin/CreateUserForm';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminUserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const isMobile = useIsMobile();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredUsers = users?.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserStats = (userId: string) => {
    // This would typically be calculated from packages data
    return {
      totalPackages: Math.floor(Math.random() * 20) + 1,
      activePackages: Math.floor(Math.random() * 5),
      totalSpent: Math.floor(Math.random() * 2000) + 100
    };
  };

  // Calculate role-based stats
  const totalUsers = users?.length || 0;
  const adminUsers = users?.filter(u => u.role === 'admin').length || 0;
  const warehouseUsers = users?.filter(u => u.role === 'warehouse').length || 0;
  const customerUsers = users?.filter(u => u.role === 'customer').length || 0;

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'}`}>
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-4'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${isMobile ? 'w-full' : 'w-64'}`}
            />
          </div>
          <Button 
            onClick={() => setShowCreateUser(true)}
            className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}
          >
            <UserPlus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            <div className="text-sm text-gray-600">System users</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{adminUsers}</div>
            <div className="text-sm text-gray-600">Administrator accounts</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Warehouse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{warehouseUsers}</div>
            <div className="text-sm text-gray-600">Warehouse staff</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customerUsers}</div>
            <div className="text-sm text-gray-600">Customer accounts</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user) => {
                const stats = getUserStats(user.id);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          user.role === 'admin' ? 'default' : 
                          user.role === 'warehouse' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {user.role}
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
                            {user.address}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>{stats.totalPackages} total packages</div>
                        <div>{stats.activePackages} active</div>
                        <div className="font-medium">${stats.totalSpent} total spent</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showCreateUser && (
        <CreateUserForm onClose={() => setShowCreateUser(false)} />
      )}
    </div>
  );
};

export default AdminUserManagement;
