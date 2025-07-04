import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { InvoiceWithPackage } from '@/types/invoice';
import { DateRange } from 'react-day-picker';
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

interface RevenueAnalyticsProps {
  period: string;
  dateRange?: DateRange;
  invoices: InvoiceWithPackage[];
}

const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({ period, dateRange, invoices }) => {
  const { revenueData, categoryData, monthlyData } = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (period === 'custom' && dateRange?.from && dateRange?.to) {
      startDate = dateRange.from;
      endDate = dateRange.to;
    } else {
      const days = parseInt(period);
      startDate = subDays(now, days);
    }

    // Filter invoices by date range
    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.uploaded_at);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });

    // Generate daily revenue data
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const revenueData = days.map(day => {
      const dayInvoices = filteredInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.uploaded_at);
        return format(invoiceDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      
      const revenue = dayInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const count = dayInvoices.length;
      
      return {
        date: format(day, 'MM/dd'),
        revenue,
        count,
        fullDate: format(day, 'yyyy-MM-dd')
      };
    });

    // Category breakdown
    const categoryBreakdown = filteredInvoices.reduce((acc, invoice) => {
      const category = invoice.document_type || 'Other';
      acc[category] = (acc[category] || 0) + (invoice.total_amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      percentage: ((value / filteredInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)) * 100).toFixed(1)
    }));

    // Monthly comparison data
    const monthlyData = eachMonthOfInterval({
      start: startOfMonth(subDays(now, 365)),
      end: endOfMonth(now)
    }).map(month => {
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.uploaded_at);
        return format(invoiceDate, 'yyyy-MM') === format(month, 'yyyy-MM');
      });
      
      return {
        month: format(month, 'MMM yyyy'),
        revenue: monthInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
        count: monthInvoices.length
      };
    }).slice(-12);

    return { revenueData, categoryData, monthlyData };
  }, [period, dateRange, invoices]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalInvoices = revenueData.reduce((sum, item) => sum + item.count, 0);
  const averageDaily = totalRevenue / revenueData.length;

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">Invoices processed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageDaily.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Average per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueAnalytics;