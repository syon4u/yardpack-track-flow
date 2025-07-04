import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCustomerAnalytics } from '@/hooks/useCustomerAnalytics';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Award,
  Target
} from 'lucide-react';

const CustomerLifetimeValueDashboard: React.FC = () => {
  const { 
    clvData, 
    segmentationData, 
    isLoading, 
    getTopCustomers, 
    calculateAverageClv,
    getPredictedRevenue 
  } = useCustomerAnalytics();

  const topCustomers = getTopCustomers(5);
  const averageClv = calculateAverageClv();
  const predictedRevenue = getPredictedRevenue(12);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getSegmentColor = (segment: string) => {
    switch (segment.toLowerCase()) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSegmentBadgeVariant = (segment: string) => {
    switch (segment.toLowerCase()) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CLV</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageClv)}</div>
            <p className="text-xs text-muted-foreground">
              Across {clvData?.length || 0} customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clvData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active customer base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(predictedRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Next 12 months projection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Value Customers</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clvData?.filter(c => c.segment === 'high').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Premium customer segment
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers by CLV */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Customers by CLV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.customerId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{customer.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.packageCount} packages • {customer.customerTenureMonths} months
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(customer.clvScore)}</p>
                    <Badge variant={getSegmentBadgeVariant(customer.segment)}>
                      {customer.segment}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Segmentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Segmentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {segmentationData?.map((segment) => (
                <div key={segment.segment} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getSegmentColor(segment.segment)}`}></div>
                      <span className="font-medium capitalize">{segment.segment} Value</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {segment.customerCount} customers ({segment.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={segment.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg CLV: {formatCurrency(segment.avgClv)}</span>
                    <span>Total: {formatCurrency(segment.totalValue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerLifetimeValueDashboard;