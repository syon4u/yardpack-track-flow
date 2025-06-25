
import { PerformanceTestRunner } from '@/utils/performanceTests';
import { DataIntegrityService } from '@/services/dataIntegrityService';
import { ProductionConfigService } from '@/services/productionConfigService';
import { MonitoringService } from '@/services/monitoringService';

export class AutomatedTestRunner {
  static async runCriticalUserFlows(): Promise<{
    authentication: boolean;
    packageManagement: boolean;
    customerManagement: boolean;
    overall: boolean;
  }> {
    const results = {
      authentication: false,
      packageManagement: false,
      customerManagement: false,
      overall: false
    };

    try {
      // Test authentication flow
      results.authentication = await this.testAuthenticationFlow();
      
      // Test package management
      results.packageManagement = await this.testPackageManagement();
      
      // Test customer management
      results.customerManagement = await this.testCustomerManagement();
      
      results.overall = results.authentication && results.packageManagement && results.customerManagement;

      await MonitoringService.logUserActivity('critical_flow_testing', 'testing', 'system', results);

      return results;
    } catch (error) {
      await MonitoringService.logError(error as Error, { operation: 'critical_flow_testing' });
      return results;
    }
  }

  private static async testAuthenticationFlow(): Promise<boolean> {
    try {
      // Test rate limiting
      const rateLimitResult = SecurityService.checkRateLimit('login', 'test@example.com');
      if (!rateLimitResult.allowed === false) return false;

      // Test CSRF token generation
      const csrfToken = SecurityService.generateCSRFToken();
      if (!csrfToken || csrfToken.length !== 64) return false;

      return true;
    } catch (error) {
      console.error('Authentication flow test failed:', error);
      return false;
    }
  }

  private static async testPackageManagement(): Promise<boolean> {
    try {
      // Test data integrity
      const integrityResult = await DataIntegrityService.validateCustomerPackageRelationships();
      return integrityResult.valid || integrityResult.fixed > 0;
    } catch (error) {
      console.error('Package management test failed:', error);
      return false;
    }
  }

  private static async testCustomerManagement(): Promise<boolean> {
    try {
      // Test customer normalization
      await DataIntegrityService.normalizeCustomerReferences();
      return true;
    } catch (error) {
      console.error('Customer management test failed:', error);
      return false;
    }
  }

  static async runPerformanceTests(): Promise<any> {
    try {
      const results = await PerformanceTestRunner.runAllPerformanceTests();
      PerformanceTestRunner.logResults([...results.packages, ...results.customers, ...results.stats]);
      return results;
    } catch (error) {
      await MonitoringService.logError(error as Error, { operation: 'performance_testing' });
      throw error;
    }
  }

  static async runProductionReadinessCheck(): Promise<any> {
    try {
      const readiness = await ProductionConfigService.validateProductionReadiness();
      const dataHealth = await DataIntegrityService.runFullDataValidation();
      
      const report = await ProductionConfigService.generateProductionReport();
      console.log(report);

      return {
        configuration: readiness,
        dataIntegrity: dataHealth,
        report
      };
    } catch (error) {
      await MonitoringService.logError(error as Error, { operation: 'production_readiness_check' });
      throw error;
    }
  }

  static async runFullTestSuite(): Promise<{
    criticalFlows: any;
    performance: any;
    productionReadiness: any;
    overall: 'pass' | 'fail' | 'warning';
  }> {
    try {
      console.log('🚀 Starting Full Test Suite...');

      const criticalFlows = await this.runCriticalUserFlows();
      const performance = await this.runPerformanceTests();
      const productionReadiness = await this.runProductionReadinessCheck();

      let overall: 'pass' | 'fail' | 'warning' = 'pass';

      if (!criticalFlows.overall || !productionReadiness.configuration.ready) {
        overall = 'fail';
      } else if (productionReadiness.configuration.recommendations.length > 0) {
        overall = 'warning';
      }

      console.log(`✅ Full Test Suite Complete - Status: ${overall.toUpperCase()}`);

      return {
        criticalFlows,
        performance,
        productionReadiness,
        overall
      };
    } catch (error) {
      await MonitoringService.logError(error as Error, { operation: 'full_test_suite' });
      return {
        criticalFlows: { overall: false },
        performance: null,
        productionReadiness: null,
        overall: 'fail'
      };
    }
  }
}

// Auto-run test suite in development with localStorage flag
if (process.env.NODE_ENV === 'development' && localStorage.getItem('runFullTestSuite') === 'true') {
  setTimeout(() => {
    AutomatedTestRunner.runFullTestSuite().then(results => {
      console.log('📊 Full Test Suite Results:', results);
    });
  }, 5000);
}
