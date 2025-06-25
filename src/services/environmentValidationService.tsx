
import React from 'react';
import { EnvironmentService } from './environmentService';

export interface EnvironmentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: {
    supabaseUrl: string | null;
    supabaseAnonKey: string | null;
    environment: string;
    appUrl: string;
  };
}

export class EnvironmentValidationService {
  static validateEnvironment(): EnvironmentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Get environment configuration
    const envConfig = EnvironmentService.getEnvironmentConfig();
    
    // Check for required Supabase environment variables
    const supabaseUrl = envConfig.supabaseUrl;
    const supabaseAnonKey = envConfig.supabaseAnonKey;
    
    if (!supabaseUrl) {
      errors.push('VITE_SUPABASE_URL environment variable is not configured');
    } else if (!supabaseUrl.startsWith('https://')) {
      errors.push('VITE_SUPABASE_URL must be a valid HTTPS URL');
    }
    
    if (!supabaseAnonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY environment variable is not configured');
    } else if (supabaseAnonKey.length < 100) {
      warnings.push('VITE_SUPABASE_ANON_KEY appears to be too short - verify it is correct');
    }
    
    // Check environment-specific configurations
    if (envConfig.isProduction) {
      if (envConfig.appUrl.includes('localhost')) {
        warnings.push('Production environment detected but app URL contains localhost');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      config: {
        supabaseUrl,
        supabaseAnonKey: supabaseAnonKey ? '[PRESENT]' : null,
        environment: EnvironmentService.getEnvironmentName(),
        appUrl: envConfig.appUrl
      }
    };
  }
  
  static logValidationResults(): void {
    const validation = this.validateEnvironment();
    
    console.log('🔍 Environment Validation Results:');
    console.log('Environment:', validation.config.environment);
    console.log('App URL:', validation.config.appUrl);
    console.log('Supabase URL:', validation.config.supabaseUrl);
    console.log('Supabase Key:', validation.config.supabaseAnonKey);
    
    if (validation.errors.length > 0) {
      console.error('❌ Environment Errors:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
    }
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Environment Warnings:');
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
    
    if (validation.isValid) {
      console.log('✅ Environment validation passed');
    } else {
      console.error('❌ Environment validation failed');
    }
  }
  
  static getValidationComponent() {
    const validation = this.validateEnvironment();
    
    if (!validation.isValid) {
      return {
        hasErrors: true,
        component: () => (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <h3 className="text-red-800 font-semibold mb-2">Environment Configuration Errors</h3>
            <ul className="text-red-700 text-sm space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-red-500 mr-2">•</span>
                  {error}
                </li>
              ))}
            </ul>
            {validation.warnings.length > 0 && (
              <>
                <h4 className="text-orange-800 font-semibold mt-3 mb-2">Warnings</h4>
                <ul className="text-orange-700 text-sm space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-orange-500 mr-2">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 text-sm font-medium">To fix this locally:</p>
              <p className="text-blue-700 text-sm mt-1">
                Set the following environment variables in your development environment:
              </p>
              <ul className="text-blue-700 text-sm mt-2 font-mono">
                <li>VITE_SUPABASE_URL=https://lkvelwwrztkmnvgeknpa.supabase.co</li>
                <li>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</li>
              </ul>
            </div>
          </div>
        )
      };
    }
    
    return { hasErrors: false, component: null };
  }
}
