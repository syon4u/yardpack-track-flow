import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  AlertCircle,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Users
} from 'lucide-react';
import { useOptimizedStats } from '@/hooks/useOptimizedCustomers';
import { useAllInvoices } from '@/hooks/useInvoices';
import RevenueAnalytics from './RevenueAnalytics';
import PaymentTracking from './PaymentTracking';
import CustomerFinancialAnalytics from './CustomerFinancialAnalytics';
import FinancialExports from './FinancialExports';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

const FinancialReportingDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { data: stats, isPending: statsLoading } = useOptimizedStats();
  const { data: invoices, isPending: invoicesLoading } = useAllInvoices();

  const financialStats = stats?.financial || {
    total_value: 0,
    total_due: 0,
    pending_invoices: 0,
  };

  // Calculate additional financial metrics
  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
  const paidInvoices = invoices?.filter(inv => inv.status === 'paid').length || 0;
  const overdue = invoices?.filter(inv => inv.status === 'overdue').length || 0;
  const paymentRate = invoices?.length ? (paidInvoices / invoices.length) * 100 : 0;

  if (statsLoading || invoicesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-12 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Reporting</h1>
          <p className="text-muted-foreground">
            Comprehensive financial analytics and reporting dashboard
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          {selectedPeriod === 'custom' && (
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />
          )}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialStats.total_due.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {financialStats.pending_invoices} pending invoices
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {paidInvoices} of {invoices?.length} invoices paid
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdue}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="exports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueAnalytics 
            period={selectedPeriod} 
            dateRange={dateRange}
            invoices={invoices || []}
          />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentTracking 
            period={selectedPeriod} 
            dateRange={dateRange}
            invoices={invoices || []}
          />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerFinancialAnalytics 
            period={selectedPeriod} 
            dateRange={dateRange}
            invoices={invoices || []}
          />
        </TabsContent>

        <TabsContent value="exports" className="space-y-6">
          <FinancialExports 
            period={selectedPeriod} 
            dateRange={dateRange}
            invoices={invoices || []}
            stats={financialStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReportingDashboard;