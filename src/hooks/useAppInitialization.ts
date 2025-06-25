
import { useEffect } from 'react';
import { HealthCheckService } from '@/services/healthCheckService';
import { ConfigService } from '@/services/configService';
import { MonitoringService } from '@/services/monitoringService';
import { ProductionConfigService } from '@/services/productionConfigService';
import { DataIntegrityService } from '@/services/dataIntegrityService';
import { EnvironmentValidationService } from '@/services/environmentValidationService.tsx';

export const useAppInitialization = () => {
  useEffect(() => {
    // Initialize production-ready services
    const initializeProductionServices = async () => {
      try {
        // Validate environment first
        const validation = EnvironmentValidationService.validateEnvironment();
        if (!validation.isValid) {
          console.error('Environment validation failed:', validation.errors);
          return;
        }
        
        // Initialize configuration
        await ConfigService.initializeConfig();
        
        // Start periodic health checks
        HealthCheckService.startPeriodicHealthChecks(5); // Every 5 minutes
        
        // Initialize performance monitoring
        MonitoringService.initializePerformanceMonitoring();
        
        // Set security headers for production
        ProductionConfigService.setSecurityHeaders();
        
        // Optimize bundle performance
        ProductionConfigService.optimizeBundlePerformance();
        
        // Run data integrity check on startup
        setTimeout(async () => {
          try {
            await DataIntegrityService.runFullDataValidation();
          } catch (error) {
            console.warn('Data integrity check failed:', error);
          }
        }, 2000);
        
        console.log('Production services initialized successfully');
      } catch (error) {
        console.error('Failed to initialize production services:', error);
      }
    };

    initializeProductionServices();

    // Cleanup on unmount
    return () => {
      MonitoringService.cleanup();
    };
  }, []);
};
