import { supabase } from '@/integrations/supabase/client';
import { DatabaseService } from '../core/database';

export interface CustomerLifetimeValue {
  customerId: string;
  customerName: string;
  totalSpent: number;
  packageCount: number;
  avgPackageValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
  customerTenureMonths: number;
  clvScore: number;
  segment: 'high' | 'medium' | 'low';
  predictedValue: number;
}

export interface SeasonalDemand {
  month: string;
  year: number;
  packageCount: number;
  totalValue: number;
  avgValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface CustomerSegmentation {
  segment: string;
  customerCount: number;
  totalValue: number;
  avgClv: number;
  percentage: number;
}

export interface UnifiedStats {
  packages: {
    total: number;
    received: number;
    in_transit: number;
    arrived: number;
    ready_for_pickup: number;
    picked_up: number;
  };
  customers: {
    total: number;
    registered: number;
    package_only: number;
    active: number;
  };
  financial: {
    total_value: number;
    total_due: number;
    pending_invoices: number;
  };
}

/**
 * Analytics service for business intelligence and reporting
 */
export class AnalyticsService {
  /**
   * Get Customer Lifetime Value analysis
   */
  static async getCustomerLifetimeValue(): Promise<CustomerLifetimeValue[]> {
    return DatabaseService.measurePerformance('getCustomerCLV', async () => {
      const { data, error } = await supabase.rpc('calculate_customer_clv');
      
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        customerId: item.customerid,
        customerName: item.customername,
        totalSpent: Number(item.totalspent),
        packageCount: Number(item.packagecount),
        avgPackageValue: Number(item.avgpackagevalue),
        firstOrderDate: item.firstorderdate,
        lastOrderDate: item.lastorderdate,
        customerTenureMonths: Number(item.customertenuremonths),
        clvScore: Number(item.clvscore),
        segment: item.segment as 'high' | 'medium' | 'low',
        predictedValue: Number(item.predictedvalue),
      }));
    });
  }

  /**
   * Get seasonal demand analysis
   */
  static async getSeasonalDemand(): Promise<SeasonalDemand[]> {
    return DatabaseService.measurePerformance('getSeasonalDemand', async () => {
      const { data, error } = await supabase.rpc('get_seasonal_demand_analysis');
      
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        month: item.month.trim(),
        year: item.year,
        packageCount: Number(item.packagecount),
        totalValue: Number(item.totalvalue),
        avgValue: Number(item.avgvalue),
        trend: item.trend as 'increasing' | 'decreasing' | 'stable',
      }));
    });
  }

  /**
   * Get customer segmentation data
   */
  static async getCustomerSegmentation(): Promise<CustomerSegmentation[]> {
    return DatabaseService.measurePerformance('getCustomerSegmentation', async () => {
      const { data, error } = await supabase.rpc('get_customer_segmentation');
      
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        segment: item.segment,
        customerCount: Number(item.customercount),
        totalValue: Number(item.totalvalue),
        avgClv: Number(item.avgclv),
        percentage: Number(item.percentage),
      }));
    });
  }

  /**
   * Get unified statistics across all domains
   */
  static async getUnifiedStats(): Promise<UnifiedStats> {
    return DatabaseService.measurePerformance('getUnifiedStats', async () => {
      const [packageStats, customerStats, financialData] = await Promise.all([
        // Package statistics
        supabase
          .from('packages')
          .select('status, package_value, total_due, invoices!invoices_package_id_fkey(id)')
          .then(({ data, error }) => {
            if (error) throw error;
            
            const stats = {
              total: data?.length || 0,
              received: 0,
              in_transit: 0,
              arrived: 0,
              ready_for_pickup: 0,
              picked_up: 0,
            };

            data?.forEach(pkg => {
              if (pkg.status in stats) {
                (stats as any)[pkg.status]++;
              }
            });

            return stats;
          }),

        // Customer statistics
        supabase
          .from('customers')
          .select(`
            *,
            packages(id, status)
          `)
          .then(({ data, error }) => {
            if (error) throw error;

            const totalCustomers = data?.length || 0;
            const registeredCustomers = data?.filter(c => c.customer_type === 'registered').length || 0;
            const packageOnlyCustomers = data?.filter(c => c.customer_type === 'package_only').length || 0;
            const activeCustomers = data?.filter(customer => {
              const packages = customer.packages || [];
              return packages.some((p: any) => 
                ['received', 'in_transit', 'arrived', 'ready_for_pickup'].includes(p.status)
              );
            }).length || 0;

            return {
              total: totalCustomers,
              registered: registeredCustomers,
              package_only: packageOnlyCustomers,
              active: activeCustomers,
            };
          }),

        // Financial data
        supabase
          .from('packages')
          .select('package_value, total_due, invoices!invoices_package_id_fkey(id)')
          .then(({ data, error }) => {
            if (error) throw error;
            return data || [];
          })
      ]);

      const financialStats = {
        total_value: financialData.reduce((sum, p) => sum + (p.package_value || 0), 0),
        total_due: financialData.reduce((sum, p) => sum + (p.total_due || 0), 0),
        pending_invoices: financialData.filter(p => !p.invoices || p.invoices.length === 0).length,
      };

      return {
        packages: packageStats,
        customers: customerStats,
        financial: financialStats,
      };
    });
  }

  /**
   * Get top customers by CLV
   */
  static async getTopCustomers(limit: number = 10): Promise<CustomerLifetimeValue[]> {
    const clvData = await this.getCustomerLifetimeValue();
    return clvData
      .sort((a, b) => b.clvScore - a.clvScore)
      .slice(0, limit);
  }

  /**
   * Get growth trend analysis
   */
  static async getGrowthTrend(): Promise<Array<SeasonalDemand & { growthRate: number }>> {
    const seasonalData = await this.getSeasonalDemand();
    
    return seasonalData.map((item, index) => ({
      ...item,
      growthRate: index > 0 ? 
        ((item.packageCount - seasonalData[index - 1].packageCount) / seasonalData[index - 1].packageCount) * 100 
        : 0
    }));
  }

  /**
   * Calculate average CLV
   */
  static async getAverageClv(): Promise<number> {
    const clvData = await this.getCustomerLifetimeValue();
    if (!clvData.length) return 0;
    
    return clvData.reduce((sum, customer) => sum + customer.clvScore, 0) / clvData.length;
  }

  /**
   * Predict revenue for upcoming months
   */
  static async getPredictedRevenue(months: number = 12): Promise<number> {
    const clvData = await this.getCustomerLifetimeValue();
    if (!clvData.length) return 0;
    
    const monthlyAvgRevenue = clvData.reduce((sum, customer) => sum + customer.totalSpent, 0) / clvData.length;
    return monthlyAvgRevenue * months;
  }
}