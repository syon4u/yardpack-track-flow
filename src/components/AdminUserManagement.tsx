
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CreateUserForm from './admin/CreateUserForm';
import EditUserDialog from './admin/EditUserDialog';
import AdminUserStats from './admin/AdminUserStats';
import AdminUserFilters from './admin/AdminUserFilters';
import AdminUserTable from './admin/AdminUserTable';

const AdminUserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: users, isPending } = useQuery({
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

  // Calculate role-based stats for system users only
  const totalUsers = users?.length || 0;
  const adminUsers = users?.filter(u => u.role === 'admin').length || 0;
  const warehouseUsers = users?.filter(u => u.role === 'warehouse').length || 0;
  const customerServiceUsers = users?.filter(u => u.role === 'customer').length || 0;

  if (isPending) {
    return <div>Loading system users...</div>;
  }

  return (
    <div className="space-y-6">
      <AdminUserFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateUser={() => setShowCreateUser(true)}
      />

      <AdminUserStats
        totalUsers={totalUsers}
        adminUsers={adminUsers}
        warehouseUsers={warehouseUsers}
        customerServiceUsers={customerServiceUsers}
      />

      <AdminUserTable
        users={filteredUsers || []}
        onEditUser={setEditingUser}
      />

      {showCreateUser && (
        <CreateUserForm onClose={() => setShowCreateUser(false)} />
      )}

      {editingUser && (
        <EditUserDialog 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
        />
      )}
    </div>
  );
};

export default AdminUserManagement;
