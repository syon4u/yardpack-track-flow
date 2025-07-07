/**
 * Environment Configuration
 * Centralizes all environment-specific settings
 */

export type Environment = 'development' | 'staging' | 'production';

interface EnvironmentConfig {
  environment: Environment;
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  app: {
    name: string;
    version: string;
    baseUrl: string;
  };
  features: {
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
    enablePerformanceMonitoring: boolean;
    enableDebugMode: boolean;
  };
  limits: {
    maxFileSize: number; // in bytes
    maxPackagesPerPage: number;
    queryTimeout: number; // in ms
    cacheTime: number; // in ms
  };
}

// Determine current environment
const getEnvironment = (): Environment => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  if (window.location.hostname.includes('staging') || window.location.hostname.includes('preview')) {
    return 'staging';
  }
  return 'production';
};

const currentEnv = getEnvironment();

// Environment-specific configurations
const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    environment: 'development',
    isDevelopment: true,
    isProduction: false,
    isStaging: false,
    supabase: {
      url: 'https://lkvelwwrztkmnvgeknpa.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrdmVsd3dyenRrbW52Z2VrbnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDU5MDksImV4cCI6MjA2NjI4MTkwOX0.FYncO6mPqw5mJr4ek8kQdgvdo15nXU42vqq-TUtwuts',
    },
    app: {
      name: 'YardPack Dev',
      version: '1.0.0-dev',
      baseUrl: window.location.origin,
    },
    features: {
      enableAnalytics: false,
      enableErrorReporting: true,
      enablePerformanceMonitoring: true,
      enableDebugMode: true,
    },
    limits: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxPackagesPerPage: 50,
      queryTimeout: 30000, // 30s
      cacheTime: 5 * 60 * 1000, // 5 minutes
    },
  },
  staging: {
    environment: 'staging',
    isDevelopment: false,
    isProduction: false,
    isStaging: true,
    supabase: {
      url: 'https://lkvelwwrztkmnvgeknpa.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrdmVsd3dyenRrbW52Z2VrbnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDU5MDksImV4cCI6MjA2NjI4MTkwOX0.FYncO6mPqw5mJr4ek8kQdgvdo15nXU42vqq-TUtwuts',
    },
    app: {
      name: 'YardPack Staging',
      version: '1.0.0-staging',
      baseUrl: window.location.origin,
    },
    features: {
      enableAnalytics: true,
      enableErrorReporting: true,
      enablePerformanceMonitoring: true,
      enableDebugMode: false,
    },
    limits: {
      maxFileSize: 25 * 1024 * 1024, // 25MB
      maxPackagesPerPage: 100,
      queryTimeout: 20000, // 20s
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
  production: {
    environment: 'production',
    isDevelopment: false,
    isProduction: true,
    isStaging: false,
    supabase: {
      url: 'https://lkvelwwrztkmnvgeknpa.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrdmVsd3dyenRrbW52Z2VrbnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDU5MDksImV4cCI6MjA2NjI4MTkwOX0.FYncO6mPqw5mJr4ek8kQdgvdo15nXU42vqq-TUtwuts',
    },
    app: {
      name: 'YardPack',
      version: '1.0.0',
      baseUrl: window.location.origin,
    },
    features: {
      enableAnalytics: true,
      enableErrorReporting: true,
      enablePerformanceMonitoring: true,
      enableDebugMode: false,
    },
    limits: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxPackagesPerPage: 200,
      queryTimeout: 15000, // 15s
      cacheTime: 30 * 60 * 1000, // 30 minutes
    },
  },
};

// Export current configuration
export const config = configs[currentEnv];

// Helper functions
export const isFeatureEnabled = (feature: keyof EnvironmentConfig['features']): boolean => {
  return config.features[feature];
};

export const getLimit = (limit: keyof EnvironmentConfig['limits']): number => {
  return config.limits[limit];
};

// Validation helper
export const validateConfig = (): boolean => {
  const requiredFields = [
    config.supabase.url,
    config.supabase.anonKey,
    config.app.name,
    config.app.version,
  ];
  
  return requiredFields.every(field => field && field.length > 0);
};

// Debug helper for development
if (config.isDevelopment) {
  console.log('🔧 Environment Config:', config);
}