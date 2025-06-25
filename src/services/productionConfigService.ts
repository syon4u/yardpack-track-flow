
import { ConfigService } from './configService';
import { MonitoringService } from './monitoringService';

export class ProductionConfigService {
  static async validateProductionReadiness(): Promise<{
    ready: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const config = ConfigService.getConfig();

      // Check environment configuration
      if (config.environment === 'development' && window.location.hostname !== 'localhost') {
        issues.push('Application is running in development mode in production environment');
      }

      // Check security settings
      if (config.environment === 'production') {
        if (!config.security.enableCSRF) {
          issues.push('CSRF protection is disabled in production');
        }
        if (!config.features.enableRateLimiting) {
          issues.push('Rate limiting is disabled in production');
        }
        if (config.features.enableDebugMode) {
          issues.push('Debug mode is enabled in production');
        }
      }

      // Check performance settings
      if (config.performance.pageSize > 100) {
        recommendations.push('Consider reducing page size for better performance');
      }

      if (!config.performance.enablePrefetching && config.environment === 'production') {
        recommendations.push('Enable prefetching for better user experience in production');
      }

      // Check monitoring
      if (!config.features.enableErrorReporting) {
        issues.push('Error reporting is disabled');
      }

      if (!config.features.enablePerformanceMonitoring && config.environment === 'production') {
        recommendations.push('Enable performance monitoring in production');
      }

      await MonitoringService.logUserActivity('production_readiness_check', 'system', 'system', {
        issues: issues.length,
        recommendations: recommendations.length,
        environment: config.environment
      });

      return {
        ready: issues.length === 0,
        issues,
        recommendations
      };
    } catch (error) {
      await MonitoringService.logError(error as Error, { operation: 'production_readiness_check' });
      return {
        ready: false,
        issues: ['Failed to validate production readiness'],
        recommendations: []
      };
    }
  }

  static setSecurityHeaders(): void {
    // Set security headers for production
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://lkvelwwrztkmnvgeknpa.supabase.co",
      "font-src 'self'",
      "frame-src 'none'"
    ].join('; ');
    document.head.appendChild(meta);

    // Set other security headers via meta tags where possible
    const referrerPolicy = document.createElement('meta');
    referrerPolicy.name = 'referrer';
    referrerPolicy.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrerPolicy);
  }

  static optimizeBundlePerformance(): void {
    // Preload critical resources
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = '/src/main.tsx';
    preloadLink.as = 'script';
    document.head.appendChild(preloadLink);

    // Set up resource hints
    const dnsPreconnect = document.createElement('link');
    dnsPreconnect.rel = 'preconnect';
    dnsPreconnect.href = 'https://lkvelwwrztkmnvgeknpa.supabase.co';
    document.head.appendChild(dnsPreconnect);
  }

  static async generateProductionReport(): Promise<string> {
    const readiness = await this.validateProductionReadiness();
    const config = ConfigService.getConfig();

    return `
Production Readiness Report
==========================
Generated: ${new Date().toISOString()}
Environment: ${config.environment}
Overall Status: ${readiness.ready ? '✅ READY' : '❌ NOT READY'}

Issues Found: ${readiness.issues.length}
${readiness.issues.map(issue => `  ❌ ${issue}`).join('\n')}

Recommendations: ${readiness.recommendations.length}
${readiness.recommendations.map(rec => `  💡 ${rec}`).join('\n')}

Configuration Summary:
- Security Features: ${Object.entries(config.features).filter(([key, value]) => key.includes('security') || key.includes('enable')).map(([key, value]) => `${key}: ${value}`).join(', ')}
- Performance Settings: Page Size: ${config.performance.pageSize}, Cache Timeout: ${config.performance.cacheTimeout}ms
- Environment: ${config.environment}

Next Steps:
${readiness.ready ? 
  '✅ Application is ready for production deployment' : 
  '❌ Address the issues listed above before deploying to production'
}
    `.trim();
  }
}
