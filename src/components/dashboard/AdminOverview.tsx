import React, { useState } from 'react';
import { useOptimizedStats } from '@/hooks/useOptimizedCustomers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Users, TrendingUp, Clock, Plus, Scan, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PackageList from '@/components/PackageList';

const AdminOverview: React.FC = () => {
  const { data: stats, isPending } = useOptimizedStats();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('');

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const packageStats = stats?.packages || {
    total: 0,
    received: 0,
    in_transit: 0,
    arrived: 0,
    ready_for_pickup: 0,
    picked_up: 0,
  };

  const customerStats = stats?.customers || {
    total: 0,
    registered: 0,
    package_only: 0,
    active: 0,
  };

  const handleCreatePackage = () => {
    navigate('/dashboard?tab=packages&action=create');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage packages, customers, and system operations</p>
        </div>
        <div className="flex gap-3">
          <Link to="/warehouse">
            <Button variant="outline" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Scanner
            </Button>
          </Link>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Package
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{packageStats.total}</div>
            <p className="text-xs text-green-600 mt-1">
              +{packageStats.received} this period
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{customerStats.active}</div>
            <p className="text-xs text-gray-500 mt-1">
              {customerStats.registered} registered
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Transit</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{packageStats.in_transit}</div>
            <p className="text-xs text-gray-500 mt-1">Currently shipping</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Pickup</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{packageStats.ready_for_pickup}</div>
            <p className="text-xs text-gray-500 mt-1">Ready for customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Package Management Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Package Management</h2>
          <Button onClick={handleCreatePackage} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Package
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="arrived">Arrived</SelectItem>
                <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:w-48">
            <Input
              placeholder="Filter by customer..."
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Packages Table */}
        <PackageList
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          customerFilter={customerFilter}
          viewMode="table"
          itemsPerPage={15}
        />
      </div>
    </div>
  );
};

export default AdminOverview;
