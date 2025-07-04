import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerAnalytics } from '@/hooks/useCustomerAnalytics';
import { formatCurrency } from '@/lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

const SeasonalDemandForecast: React.FC = () => {
  const { seasonalData, getCustomerGrowthTrend, isLoading } = useCustomerAnalytics();
  const growthTrendData = getCustomerGrowthTrend();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
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
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse h-80 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const currentMonth = seasonalData?.[seasonalData.length - 1];
  const previousMonth = seasonalData?.[seasonalData.length - 2];
  const monthlyGrowth = currentMonth && previousMonth 
    ? ((currentMonth.packageCount - previousMonth.packageCount) / previousMonth.packageCount) * 100
    : 0;

  const totalPackages = seasonalData?.reduce((sum, item) => sum + item.packageCount, 0) || 0;
  const totalValue = seasonalData?.reduce((sum, item) => sum + item.totalValue, 0) || 0;
  const avgMonthlyPackages = seasonalData?.length ? totalPackages / seasonalData.length : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPackages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last 12 months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total revenue generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgMonthlyPackages)}</div>
            <p className="text-xs text-muted-foreground">
              Packages per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            {monthlyGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs previous month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Package Volume Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Package Volume Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={seasonalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'packageCount' ? `${value} packages` : formatCurrency(value),
                    name === 'packageCount' ? 'Packages' : 'Value'
                  ]}
                  labelFormatter={(month) => `Month: ${month}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="packageCount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={seasonalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                  labelFormatter={(month) => `Month: ${month}`}
                />
                <Bar 
                  dataKey="totalValue" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {growthTrendData.slice(-6).map((item) => (
              <div key={`${item.month}-${item.year}`} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(item.trend)}
                    <span className="font-medium">{item.month} {item.year}</span>
                  </div>
                  <Badge variant="outline" className={getTrendColor(item.trend)}>
                    {item.trend}
                  </Badge>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Packages</p>
                    <p className="font-semibold">{item.packageCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="font-semibold">{formatCurrency(item.totalValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Avg Value</p>
                    <p className="font-semibold">{formatCurrency(item.avgValue)}</p>
                  </div>
                  {item.growthRate !== 0 && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Growth</p>
                      <p className={`font-semibold ${item.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.growthRate >= 0 ? '+' : ''}{item.growthRate.toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeasonalDemandForecast;