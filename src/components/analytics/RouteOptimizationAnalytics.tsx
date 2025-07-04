import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { 
  MapPin, 
  Clock, 
  Truck, 
  TrendingDown,
  Route,
  Fuel,
  Target,
  AlertTriangle
} from 'lucide-react';

const RouteOptimizationAnalytics: React.FC = () => {
  // Mock data for route optimization
  const routeEfficiencyData = [
    {
      route: 'Kingston Central',
      deliveries: 45,
      avgTime: 2.3,
      fuelCost: 125.50,
      efficiency: 87,
      recommendations: ['Consolidate stops', 'Optimize timing']
    },
    {
      route: 'Spanish Town',
      deliveries: 32,
      avgTime: 3.1,
      fuelCost: 98.75,
      efficiency: 73,
      recommendations: ['Reroute traffic areas', 'Morning dispatch']
    },
    {
      route: 'Portmore',
      deliveries: 28,
      avgTime: 2.8,
      fuelCost: 89.25,
      efficiency: 81,
      recommendations: ['Group pickup locations']
    },
    {
      route: 'Half Way Tree',
      deliveries: 38,
      avgTime: 2.1,
      fuelCost: 115.00,
      efficiency: 92,
      recommendations: ['Current route optimal']
    }
  ];

  const totalDeliveries = routeEfficiencyData.reduce((sum, route) => sum + route.deliveries, 0);
  const totalFuelCost = routeEfficiencyData.reduce((sum, route) => sum + route.fuelCost, 0);
  const avgEfficiency = routeEfficiencyData.reduce((sum, route) => sum + route.efficiency, 0) / routeEfficiencyData.length;
  const potentialSavings = totalFuelCost * 0.15; // Estimated 15% savings with optimization

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 85) return 'text-green-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 85) return { variant: 'default' as const, label: 'Excellent' };
    if (efficiency >= 70) return { variant: 'secondary' as const, label: 'Good' };
    return { variant: 'destructive' as const, label: 'Needs Optimization' };
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              Across all routes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Costs</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalFuelCost)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getEfficiencyColor(avgEfficiency)}`}>
              {avgEfficiency.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Route optimization score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(potentialSavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              With optimization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Route Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Route Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routeEfficiencyData.map((route) => {
              const badge = getEfficiencyBadge(route.efficiency);
              return (
                <div key={route.route} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">{route.route}</h4>
                        <p className="text-sm text-muted-foreground">
                          {route.deliveries} deliveries • {route.avgTime}h avg time
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(route.fuelCost)}</p>
                        <p className="text-sm text-muted-foreground">Fuel cost</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Efficiency Score</span>
                      <span className={`text-sm font-semibold ${getEfficiencyColor(route.efficiency)}`}>
                        {route.efficiency}%
                      </span>
                    </div>
                    <Progress value={route.efficiency} className="h-2" />
                  </div>

                  {route.recommendations.length > 0 && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Recommendations:</p>
                        <ul className="text-sm text-muted-foreground mt-1">
                          {route.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-current rounded-full"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Peak Hours Analysis</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Avoid 7-9 AM and 4-6 PM windows to reduce delivery time by 25%
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Optimal window: 10 AM - 3 PM</span>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Consolidation Benefits</h4>
                <p className="text-sm text-green-800 mb-3">
                  Group nearby deliveries to reduce travel time and fuel costs
                </p>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Potential 20% time savings</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Cost Reduction Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Route Optimization</p>
                  <p className="text-sm text-muted-foreground">AI-powered route planning</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">-15%</p>
                  <p className="text-xs text-muted-foreground">Fuel savings</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Load Consolidation</p>
                  <p className="text-sm text-muted-foreground">Combine smaller deliveries</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">-12%</p>
                  <p className="text-xs text-muted-foreground">Trip reduction</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Dynamic Scheduling</p>
                  <p className="text-sm text-muted-foreground">Real-time traffic adaptation</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">-8%</p>
                  <p className="text-xs text-muted-foreground">Time savings</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RouteOptimizationAnalytics;