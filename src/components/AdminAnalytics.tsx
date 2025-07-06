
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Package, TrendingUp, Users, DollarSign } from 'lucide-react';
import { AnalyticsService } from '@/services';

const AdminAnalytics: React.FC = () => {
  const { data: packages } = useQuery({
    queryKey: ['admin-analytics-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: seasonalData } = useQuery({
    queryKey: ['seasonal-demand-analytics'],
    queryFn: () => AnalyticsService.getSeasonalDemand(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: unifiedStats } = useQuery({
    queryKey: ['unified-stats-analytics'],
    queryFn: () => AnalyticsService.getUnifiedStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform seasonal data for charts
  const monthlyData = seasonalData?.slice(0, 6).reverse().map(item => ({
    month: item.month.substring(0, 3),
    packages: item.packageCount,
    revenue: item.totalValue
  })) || [];

  // Calculate status distribution from live data
  const statusData = packages ? [
    { 
      name: 'Received', 
      value: packages.filter(p => p.status === 'received').length,
      color: '#3b82f6' 
    },
    { 
      name: 'In Transit', 
      value: packages.filter(p => p.status === 'in_transit').length,
      color: '#f59e0b' 
    },
    { 
      name: 'Arrived', 
      value: packages.filter(p => p.status === 'arrived').length,
      color: '#10b981' 
    },
    { 
      name: 'Ready for Pickup', 
      value: packages.filter(p => p.status === 'ready_for_pickup').length,
      color: '#8b5cf6' 
    },
    { 
      name: 'Picked Up', 
      value: packages.filter(p => p.status === 'picked_up').length,
      color: '#06b6d4' 
    }
  ] : [];

  const totalRevenue = packages?.reduce((sum, pkg) => sum + (pkg.total_due || 0), 0) || 0;
  const averagePackageValue = packages?.length ? totalRevenue / packages.length : 0;

  // Calculate performance metrics from live data
  const calculateAverageProcessingTime = () => {
    if (!packages?.length) return 'N/A';
    const processed = packages.filter(p => p.actual_delivery && p.date_received);
    if (!processed.length) return 'N/A';
    
    const totalDays = processed.reduce((sum, pkg) => {
      const received = new Date(pkg.date_received);
      const delivered = new Date(pkg.actual_delivery!);
      const days = Math.ceil((delivered.getTime() - received.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    return `${(totalDays / processed.length).toFixed(1)} days`;
  };

  const calculateOnTimeDeliveryRate = () => {
    if (!packages?.length) return 'N/A';
    const withEstimates = packages.filter(p => p.estimated_delivery && p.actual_delivery);
    if (!withEstimates.length) return 'N/A';
    
    const onTime = withEstimates.filter(p => {
      const estimated = new Date(p.estimated_delivery!);
      const actual = new Date(p.actual_delivery!);
      return actual <= estimated;
    }).length;
    
    return `${((onTime / withEstimates.length) * 100).toFixed(1)}%`;
  };

  const getMostCommonCarrier = () => {
    if (!packages?.length) return 'N/A';
    const carriers = packages.reduce((acc, pkg) => {
      const carrier = pkg.carrier || 'Unknown';
      acc[carrier] = (acc[carrier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommon = Object.entries(carriers).sort(([,a], [,b]) => b - a)[0];
    return mostCommon ? mostCommon[0] : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <p className="text-gray-600 mt-2">Business insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Package Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averagePackageValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">Monthly package growth</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <p className="text-xs text-muted-foreground">Based on 127 reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Package Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="packages" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Package Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Processing Time</span>
              <span className="text-sm text-gray-600">{calculateAverageProcessingTime()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">On-Time Delivery Rate</span>
              <span className="text-sm text-gray-600">{calculateOnTimeDeliveryRate()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Packages</span>
              <span className="text-sm text-gray-600">{packages?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Customers</span>
              <span className="text-sm text-gray-600">{unifiedStats?.customers?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Most Common Carrier</span>
              <span className="text-sm text-gray-600">{getMostCommonCarrier()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
