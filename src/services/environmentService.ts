
export interface EnvironmentConfig {
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  appUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export class EnvironmentService {
  private static config: EnvironmentConfig | null = null;

  static getEnvironmentConfig(): EnvironmentConfig {
    if (this.config) {
      return this.config;
    }

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // Detect environment based on hostname
    const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost');
    const isStaging = hostname.includes('staging') || hostname.includes('preview') || hostname.includes('lovable.app');
    const isProduction = !isDevelopment && !isStaging;

    // Construct app URL
    let appUrl = `${protocol}//${hostname}`;
    if (port && !isProduction) {
      appUrl += `:${port}`;
    }

    // Use hardcoded values for now (these should eventually come from environment variables)
    const supabaseUrl = 'https://lkvelwwrztkmnvgeknpa.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrdmVsd3dyenRrbW52Z2VrbnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDU5MDksImV4cCI6MjA2NjI4MTkwOX0.FYncO6mPqw5mJr4ek8kQdgvdo15nXU42vqq-TUtwuts';

    this.config = {
      isDevelopment,
      isStaging,
      isProduction,
      appUrl,
      supabaseUrl,
      supabaseAnonKey
    };

    return this.config;
  }

  static getEnvironmentName(): 'development' | 'staging' | 'production' {
    const config = this.getEnvironmentConfig();
    if (config.isDevelopment) return 'development';
    if (config.isStaging) return 'staging';
    return 'production';
  }

  static getRedirectUrl(path: string = ''): string {
    const config = this.getEnvironmentConfig();
    return `${config.appUrl}${path}`;
  }

  static logEnvironmentInfo(): void {
    const config = this.getEnvironmentConfig();
    const env = this.getEnvironmentName();
    
    console.log('🌍 Environment Configuration:', {
      environment: env,
      appUrl: config.appUrl,
      hostname: window.location.hostname,
      isDevelopment: config.isDevelopment,
      isStaging: config.isStaging,
      isProduction: config.isProduction,
      supabaseConfigured: !!config.supabaseUrl && !!config.supabaseAnonKey
    });

    if (config.isProduction) {
      console.log('🚀 Running in PRODUCTION mode');
    } else if (config.isStaging) {
      console.log('🔄 Running in STAGING mode');
    } else {
      console.log('🛠️ Running in DEVELOPMENT mode');
    }

    // Validate Supabase configuration
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      console.error('❌ Supabase configuration is incomplete');
    } else {
      console.log('✅ Supabase configuration is present');
    }
  }

  static validateSupabaseConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const config = this.getEnvironmentConfig();
        
        // Basic URL validation
        if (!config.supabaseUrl || !config.supabaseUrl.startsWith('https://')) {
          console.error('❌ Invalid Supabase URL');
          resolve(false);
          return;
        }

        if (!config.supabaseAnonKey || config.supabaseAnonKey.length < 50) {
          console.error('❌ Invalid Supabase Anon Key');
          resolve(false);
          return;
        }

        // Test network connectivity to Supabase
        fetch(`${config.supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': config.supabaseAnonKey
          }
        }).then(response => {
          if (response.ok || response.status === 404) {
            console.log('✅ Supabase connectivity test passed');
            resolve(true);
          } else {
            console.error('❌ Supabase connectivity test failed:', response.status);
            resolve(false);
          }
        }).catch(error => {
          console.error('❌ Supabase connectivity test error:', error);
          resolve(false);
        });

      } catch (error) {
        console.error('❌ Supabase validation error:', error);
        resolve(false);
      }
    });
  }
}
