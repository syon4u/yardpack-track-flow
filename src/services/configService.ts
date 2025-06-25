import { MonitoringService } from './monitoringService';
import { EnvironmentService } from './environmentService';

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  features: {
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
    enablePerformanceMonitoring: boolean;
    enableDebugMode: boolean;
    enableRateLimiting: boolean;
  };
  performance: {
    enableVirtualization: boolean;
    pageSize: number;
    cacheTimeout: number;
    enablePrefetching: boolean;
  };
  security: {
    enableCSRF: boolean;
    sessionTimeout: number;
    requireStrongPasswords: boolean;
    enableTwoFactor: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    enableAnimations: boolean;
    compactMode: boolean;
  };
}

export class ConfigService {
  private static config: AppConfig | null = null;

  static async initializeConfig(): Promise<AppConfig> {
    try {
      // Use the new environment service
      const envConfig = EnvironmentService.getEnvironmentConfig();
      const environment = EnvironmentService.getEnvironmentName();
      
      // Log environment info
      EnvironmentService.logEnvironmentInfo();

      // Base configuration
      const config: AppConfig = {
        environment,
        apiUrl: this.getApiUrl(environment),
        supabaseUrl: envConfig.supabaseUrl,
        supabaseAnonKey: envConfig.supabaseAnonKey,
        features: {
          enableAnalytics: environment === 'production',
          enableErrorReporting: true,
          enablePerformanceMonitoring: environment !== 'development',
          enableDebugMode: environment === 'development',
          enableRateLimiting: environment !== 'development',
        },
        performance: {
          enableVirtualization: true,
          pageSize: environment === 'production' ? 50 : 20,
          cacheTimeout: environment === 'production' ? 300000 : 60000, // 5min prod, 1min dev
          enablePrefetching: environment === 'production',
        },
        security: {
          enableCSRF: environment !== 'development',
          sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
          requireStrongPasswords: environment === 'production',
          enableTwoFactor: false, // Can be enabled later
        },
        ui: {
          theme: 'auto',
          enableAnimations: true,
          compactMode: false,
        }
      };

      // Load user preferences from localStorage
      const userPreferences = this.loadUserPreferences();
      if (userPreferences) {
        config.ui = { ...config.ui, ...userPreferences.ui };
        config.performance = { ...config.performance, ...userPreferences.performance };
      }

      this.config = config;

      await MonitoringService.logUserActivity('config_initialized', 'system', 'config', {
        environment,
        appUrl: envConfig.appUrl,
        features: Object.keys(config.features).filter(key => config.features[key as keyof typeof config.features])
      });

      return config;

    } catch (error) {
      await MonitoringService.logError(error as Error, { 
        operation: 'config_initialization' 
      }, 'critical');

      // Return safe defaults on error
      return this.getDefaultConfig();
    }
  }

  static getConfig(): AppConfig {
    if (!this.config) {
      console.warn('Config not initialized, using defaults');
      return this.getDefaultConfig();
    }
    return this.config;
  }

  static async updateUserPreferences(preferences: Partial<Pick<AppConfig, 'ui' | 'performance'>>): Promise<void> {
    try {
      if (!this.config) return;

      // Update current config
      if (preferences.ui) {
        this.config.ui = { ...this.config.ui, ...preferences.ui };
      }
      if (preferences.performance) {
        this.config.performance = { ...this.config.performance, ...preferences.performance };
      }

      // Save to localStorage
      localStorage.setItem('user_preferences', JSON.stringify(preferences));

      await MonitoringService.logUserActivity('preferences_updated', 'user', 'preferences', preferences);

    } catch (error) {
      await MonitoringService.logError(error as Error, { 
        operation: 'update_preferences',
        preferences 
      });
    }
  }

  static isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    const config = this.getConfig();
    return config.features[feature];
  }

  static getPerformanceSetting<K extends keyof AppConfig['performance']>(setting: K): AppConfig['performance'][K] {
    const config = this.getConfig();
    return config.performance[setting];
  }

  static getSecuritySetting<K extends keyof AppConfig['security']>(setting: K): AppConfig['security'][K] {
    const config = this.getConfig();
    return config.security[setting];
  }

  static getUISetting<K extends keyof AppConfig['ui']>(setting: K): AppConfig['ui'][K] {
    const config = this.getConfig();
    return config.ui[setting];
  }

  private static detectEnvironment(hostname: string): 'development' | 'staging' | 'production' {
    // Use the new environment service
    return EnvironmentService.getEnvironmentName();
  }

  private static getApiUrl(environment: string): string {
    switch (environment) {
      case 'development':
        return 'http://localhost:54321';
      case 'staging':
        return 'https://lkvelwwrztkmnvgeknpa.supabase.co';
      case 'production':
        return 'https://lkvelwwrztkmnvgeknpa.supabase.co';
      default:
        return 'https://lkvelwwrztkmnvgeknpa.supabase.co';
    }
  }

  private static loadUserPreferences(): Partial<Pick<AppConfig, 'ui' | 'performance'>> | null {
    try {
      const stored = localStorage.getItem('user_preferences');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private static getDefaultConfig(): AppConfig {
    return {
      environment: 'development',
      apiUrl: 'https://lkvelwwrztkmnvgeknpa.supabase.co',
      supabaseUrl: 'https://lkvelwwrztkmnvgeknpa.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrdmVsd3dyenRrbW52Z2VrbnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDU5MDksImV4cCI6MjA2NjI4MTkwOX0.FYncO6mPqw5mJr4ek8kQdgvdo15nXU42vqq-TUtwuts',
      features: {
        enableAnalytics: false,
        enableErrorReporting: true,
        enablePerformanceMonitoring: false,
        enableDebugMode: true,
        enableRateLimiting: false,
      },
      performance: {
        enableVirtualization: true,
        pageSize: 20,
        cacheTimeout: 60000,
        enablePrefetching: false,
      },
      security: {
        enableCSRF: false,
        sessionTimeout: 24 * 60 * 60 * 1000,
        requireStrongPasswords: false,
        enableTwoFactor: false,
      },
      ui: {
        theme: 'auto',
        enableAnimations: true,
        compactMode: false,
      }
    };
  }

  static async exportConfiguration(): Promise<string> {
    const config = this.getConfig();
    const exportData = {
      timestamp: new Date().toISOString(),
      environment: config.environment,
      version: '1.0',
      configuration: {
        ...config,
        // Remove sensitive data
        supabaseAnonKey: '[REDACTED]'
      }
    };

    return JSON.stringify(exportData, null, 2);
  }
}

// Initialize configuration on module load
ConfigService.initializeConfig().catch(console.error);
