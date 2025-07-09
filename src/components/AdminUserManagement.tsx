
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import CreateUserForm from './admin/CreateUserForm';
import EditUserDialog from './admin/EditUserDialog';
import AdminUserStats from './admin/AdminUserStats';
import AdminUserFilters from './admin/AdminUserFilters';
import AdminUserTable from './admin/AdminUserTable';

const AdminUserManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Get filters from URL params
  const urlRole = searchParams.get('role');

  // Set filters from URL params on mount
  useEffect(() => {
    if (urlRole && urlRole !== 'all') {
      setRoleFilter(urlRole);
    }
  }, [urlRole]);

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

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

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
