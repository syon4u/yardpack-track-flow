import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { InvoiceWithPackage } from '@/types/invoice';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

interface CustomerFinancialAnalyticsProps {
  period: string;
  dateRange?: DateRange;
  invoices: InvoiceWithPackage[];
}

const CustomerFinancialAnalytics: React.FC<CustomerFinancialAnalyticsProps> = ({ 
  period, 
  dateRange, 
  invoices 
}) => {
  const { customerStats, topCustomers, customerSegments, customerTrends } = useMemo(() => {
    // Group invoices by customer (using delivery address as identifier)
    const customerGroups = invoices.reduce((acc, invoice) => {
      const customerId = invoice.packages?.customers?.full_name || invoice.packages?.description || 'Unknown';
      
      if (!acc[customerId]) {
        acc[customerId] = {
          id: customerId,
          name: customerId.split(',')[0] || 'Unknown Customer',
          fullAddress: customerId,
          invoices: [],
          totalAmount: 0,
          paidAmount: 0,
          overdueAmount: 0,
          invoiceCount: 0,
          lastInvoiceDate: null as Date | null
        };
      }
      
      acc[customerId].invoices.push(invoice);
      acc[customerId].totalAmount += invoice.total_amount || 0;
      acc[customerId].invoiceCount++;
      
      if (invoice.status === 'paid') {
        acc[customerId].paidAmount += invoice.total_amount || 0;
      } else if (invoice.status === 'overdue') {
        acc[customerId].overdueAmount += invoice.total_amount || 0;
      }
      
      const invoiceDate = new Date(invoice.uploaded_at);
      if (!acc[customerId].lastInvoiceDate || invoiceDate > acc[customerId].lastInvoiceDate) {
        acc[customerId].lastInvoiceDate = invoiceDate;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const customers = Object.values(customerGroups);
    
    // Customer statistics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.invoiceCount > 0).length;
    const averageOrderValue = customers.reduce((sum, c) => sum + c.totalAmount, 0) / totalCustomers;
    const customerLifetimeValue = averageOrderValue; // Simplified CLV calculation

    const customerStats = {
      totalCustomers,
      activeCustomers,
      averageOrderValue,
      customerLifetimeValue,
      averageInvoicesPerCustomer: customers.reduce((sum, c) => sum + c.invoiceCount, 0) / totalCustomers
    };

    // Top customers by revenue
    const topCustomers = customers
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10)
      .map(customer => ({
        ...customer,
        paymentRate: customer.totalAmount > 0 ? (customer.paidAmount / customer.totalAmount) * 100 : 0
      }));

    // Customer segmentation
    const highValue = customers.filter(c => c.totalAmount > 1000);
    const mediumValue = customers.filter(c => c.totalAmount >= 500 && c.totalAmount <= 1000);
    const lowValue = customers.filter(c => c.totalAmount < 500);

    const customerSegments = [
      { segment: 'High Value', count: highValue.length, revenue: highValue.reduce((sum, c) => sum + c.totalAmount, 0) },
      { segment: 'Medium Value', count: mediumValue.length, revenue: mediumValue.reduce((sum, c) => sum + c.totalAmount, 0) },
      { segment: 'Low Value', count: lowValue.length, revenue: lowValue.reduce((sum, c) => sum + c.totalAmount, 0) }
    ];

    // Customer trends (simplified)
    const customerTrends = customers.map(customer => ({
      customer: customer.name,
      totalAmount: customer.totalAmount,
      invoiceCount: customer.invoiceCount,
      averageOrderValue: customer.totalAmount / customer.invoiceCount
    }));

    return { customerStats, topCustomers, customerSegments, customerTrends };
  }, [invoices]);

  const getCustomerTier = (amount: number) => {
    if (amount > 1000) return { label: 'Premium', color: 'bg-purple-100 text-purple-800' };
    if (amount >= 500) return { label: 'Standard', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Basic', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="space-y-6">
      {/* Customer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {customerStats.activeCustomers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customerStats.averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Per customer transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customerStats.customerLifetimeValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Invoices</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.averageInvoicesPerCustomer.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Per customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segmentation */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segmentation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerSegments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Invoices</TableHead>
                <TableHead>Avg Order Value</TableHead>
                <TableHead>Payment Rate</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Last Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomers.map((customer, index) => {
                const tier = getCustomerTier(customer.totalAmount);
                const avgOrderValue = customer.totalAmount / customer.invoiceCount;
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.fullAddress.length > 50 
                            ? customer.fullAddress.substring(0, 50) + '...'
                            : customer.fullAddress
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>${customer.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{customer.invoiceCount}</TableCell>
                    <TableCell>${avgOrderValue.toFixed(0)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{customer.paymentRate.toFixed(1)}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${customer.paymentRate}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={tier.color}>{tier.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {customer.lastInvoiceDate 
                        ? format(customer.lastInvoiceDate, 'MMM dd, yyyy')
                        : 'N/A'
                      }
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Value Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Value Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={customerTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="invoiceCount" name="Invoice Count" />
              <YAxis dataKey="totalAmount" name="Total Amount" />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'totalAmount' ? `$${value.toLocaleString()}` : value,
                  name === 'totalAmount' ? 'Total Amount' : 'Invoice Count'
                ]}
                labelFormatter={(label: string) => `Customer: ${label}`}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter name="Customers" dataKey="totalAmount" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerFinancialAnalytics;