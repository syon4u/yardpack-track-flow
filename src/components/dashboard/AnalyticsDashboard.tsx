
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerLifetimeValueDashboard from '@/components/analytics/CustomerLifetimeValueDashboard';
import SeasonalDemandForecast from '@/components/analytics/SeasonalDemandForecast';
import RouteOptimizationAnalytics from '@/components/analytics/RouteOptimizationAnalytics';
import AdminAnalytics from '../AdminAnalytics';
import { 
  TrendingUp, 
  Users, 
  Calendar,
  MapPin,
  BarChart3
} from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="text-gray-600 mt-1">Business intelligence and performance insights</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="clv" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer CLV
          </TabsTrigger>
          <TabsTrigger value="demand" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Demand Forecast
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Route Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminAnalytics />
        </TabsContent>

        <TabsContent value="clv" className="space-y-6">
          <CustomerLifetimeValueDashboard />
        </TabsContent>

        <TabsContent value="demand" className="space-y-6">
          <SeasonalDemandForecast />
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <RouteOptimizationAnalytics />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Overall Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customer Satisfaction</span>
                  <span className="font-semibold">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Delivery Efficiency</span>
                  <span className="font-semibold">87.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cost Optimization</span>
                  <span className="font-semibold">+12.5%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Key Recommendations</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Focus on High-Value Customers</p>
                  <p className="text-xs text-blue-700">Target top 20% for premium services</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Optimize Peak Seasons</p>
                  <p className="text-xs text-green-700">Prepare for Q4 demand increase</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900">Route Efficiency</p>
                  <p className="text-xs text-yellow-700">Consider consolidation opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
