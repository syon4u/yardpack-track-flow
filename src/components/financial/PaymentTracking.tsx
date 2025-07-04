import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { InvoiceWithPackage } from '@/types/invoice';
import { DateRange } from 'react-day-picker';
import { format, differenceInDays, isAfter } from 'date-fns';
import { Clock, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';

interface PaymentTrackingProps {
  period: string;
  dateRange?: DateRange;
  invoices: InvoiceWithPackage[];
}

const PaymentTracking: React.FC<PaymentTrackingProps> = ({ period, dateRange, invoices }) => {
  const { paymentStats, overdueInvoices, paymentStatusData, agingData } = useMemo(() => {
    const now = new Date();
    
    // Calculate payment statistics
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.status === 'draft');
    const overdueInvoices = invoices.filter(inv => {
      if (!inv.due_date) return false;
      return inv.status !== 'paid' && isAfter(now, new Date(inv.due_date));
    });

    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const paidAmount = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    const paymentStats = {
      totalInvoices: invoices.length,
      paidInvoices: paidInvoices.length,
      pendingInvoices: pendingInvoices.length,
      overdueInvoices: overdueInvoices.length,
      totalAmount,
      paidAmount,
      overdueAmount,
      pendingAmount,
      paymentRate: invoices.length > 0 ? (paidInvoices.length / invoices.length) * 100 : 0,
      averagePaymentTime: 0 // Calculate if needed
    };

    // Payment status breakdown
    const paymentStatusData = [
      { name: 'Paid', value: paidAmount, count: paidInvoices.length, color: '#22c55e' },
      { name: 'Pending', value: pendingAmount, count: pendingInvoices.length, color: '#f59e0b' },
      { name: 'Overdue', value: overdueAmount, count: overdueInvoices.length, color: '#ef4444' }
    ];

    // Aging analysis
    const agingBuckets = {
      '0-30': { count: 0, amount: 0 },
      '31-60': { count: 0, amount: 0 },
      '61-90': { count: 0, amount: 0 },
      '90+': { count: 0, amount: 0 }
    };

    overdueInvoices.forEach(invoice => {
      if (!invoice.due_date) return;
      const daysOverdue = differenceInDays(now, new Date(invoice.due_date));
      const amount = invoice.total_amount || 0;

      if (daysOverdue <= 30) {
        agingBuckets['0-30'].count++;
        agingBuckets['0-30'].amount += amount;
      } else if (daysOverdue <= 60) {
        agingBuckets['31-60'].count++;
        agingBuckets['31-60'].amount += amount;
      } else if (daysOverdue <= 90) {
        agingBuckets['61-90'].count++;
        agingBuckets['61-90'].amount += amount;
      } else {
        agingBuckets['90+'].count++;
        agingBuckets['90+'].amount += amount;
      }
    });

    const agingData = Object.entries(agingBuckets).map(([range, data]) => ({
      range,
      count: data.count,
      amount: data.amount
    }));

    return { 
      paymentStats, 
      overdueInvoices: overdueInvoices.slice(0, 10), // Top 10 overdue
      paymentStatusData, 
      agingData 
    };
  }, [invoices]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.paymentRate.toFixed(1)}%</div>
            <Progress value={paymentStats.paymentRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentStats.paidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {paymentStats.paidInvoices} invoices paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentStats.pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {paymentStats.pendingInvoices} invoices pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentStats.overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {paymentStats.overdueInvoices} invoices overdue
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Aging Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Aging Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Overdue Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueInvoices.map((invoice) => {
                const daysOverdue = invoice.due_date 
                  ? differenceInDays(new Date(), new Date(invoice.due_date))
                  : 0;

                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                    </TableCell>
                    <TableCell>
                      {invoice.packages?.customers?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>${(invoice.total_amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      {invoice.due_date ? format(new Date(invoice.due_date), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className="text-red-600 font-medium">
                        {daysOverdue} days
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status || 'unknown')}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Send Reminder
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTracking;