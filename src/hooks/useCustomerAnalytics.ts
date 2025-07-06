import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { defaultQueryRetryOptions } from '@/utils/retryUtils';
import { AnalyticsService } from '@/services';

// Import types from the analytics service
import type {
  CustomerLifetimeValue,
  SeasonalDemand,
  CustomerSegmentation
} from '@/services';

export const useCustomerAnalytics = () => {
  const { user, profile } = useAuth();

  const { data: clvData, isLoading: clvLoading } = useQuery({
    queryKey: ['customer-clv', user?.id],
    queryFn: async (): Promise<CustomerLifetimeValue[]> => {
      if (!user || profile?.role !== 'admin') return [];
      
      try {
        return await AnalyticsService.getCustomerLifetimeValue();
      } catch (error) {
        console.error('Error fetching CLV data:', error);
        return [];
      }
    },
    enabled: !!user && profile?.role === 'admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...defaultQueryRetryOptions,
  });

  const { data: seasonalData, isLoading: seasonalLoading } = useQuery({
    queryKey: ['seasonal-demand', user?.id],
    queryFn: async (): Promise<SeasonalDemand[]> => {
      if (!user || profile?.role !== 'admin') return [];
      
      try {
        return await AnalyticsService.getSeasonalDemand();
      } catch (error) {
        console.error('Error fetching seasonal data:', error);
        return [];
      }
    },
    enabled: !!user && profile?.role === 'admin',
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...defaultQueryRetryOptions,
  });

  const { data: segmentationData, isLoading: segmentationLoading } = useQuery({
    queryKey: ['customer-segmentation', user?.id],
    queryFn: async (): Promise<CustomerSegmentation[]> => {
      if (!user || profile?.role !== 'admin') return [];
      
      try {
        return await AnalyticsService.getCustomerSegmentation();
      } catch (error) {
        console.error('Error fetching segmentation data:', error);
        return [];
      }
    },
    enabled: !!user && profile?.role === 'admin',
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...defaultQueryRetryOptions,
  });

  const getTopCustomers = (limit: number = 10) => {
    return clvData?.slice().sort((a, b) => b.clvScore - a.clvScore).slice(0, limit) || [];
  };

  const getCustomerGrowthTrend = () => {
    if (!seasonalData) return [];
    
    return seasonalData.map((item, index) => ({
      ...item,
      growthRate: index > 0 ? 
        ((item.packageCount - seasonalData[index - 1].packageCount) / seasonalData[index - 1].packageCount) * 100 
        : 0
    }));
  };

  const calculateAverageClv = () => {
    if (!clvData?.length) return 0;
    return clvData.reduce((sum, customer) => sum + customer.clvScore, 0) / clvData.length;
  };

  const getPredictedRevenue = (months: number = 12) => {
    if (!clvData?.length) return 0;
    const monthlyAvgRevenue = clvData.reduce((sum, customer) => sum + customer.totalSpent, 0) / clvData.length;
    return monthlyAvgRevenue * months;
  };

  return {
    clvData,
    seasonalData,
    segmentationData,
    isLoading: clvLoading || seasonalLoading || segmentationLoading,
    getTopCustomers,
    getCustomerGrowthTrend,
    calculateAverageClv,
    getPredictedRevenue
  };
};