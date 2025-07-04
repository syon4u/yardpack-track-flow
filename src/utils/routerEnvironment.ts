/**
 * Environment detection utility for routing configuration
 */

export type RouterEnvironment = 'production' | 'preview';

/**
 * Detects the current environment to determine which router to use
 * Uses multiple detection methods for reliability
 */
export function detectRouterEnvironment(): RouterEnvironment {
  // Method 1: Check for Lovable preview URL pattern
  const pathname = window.location.pathname;
  if (pathname.includes('/projects/')) {
    return 'preview';
  }

  // Method 2: Check for development environment with preview indicators
  if (process.env.NODE_ENV === 'development') {
    // Check for Lovable-specific environment variables
    if (process.env.LOVABLE_PREVIEW) {
      return 'preview';
    }
    
    // Check hostname patterns
    const hostname = window.location.hostname;
    if (hostname.includes('lovable') || hostname.includes('gptengineer')) {
      return 'preview';
    }
  }

  // Default to production for clean URLs
  return 'production';
}

/**
 * Gets the appropriate base path for BrowserRouter when in production
 */
export function getProductionBasename(): string {
  // Only return basename if we detect a production subdirectory deployment
  const pathname = window.location.pathname;
  
  // Check if deployed to a subdirectory (not Lovable preview)
  if (pathname !== '/' && !pathname.includes('/projects/')) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      return `/${segments[0]}`;
    }
  }
  
  return '';
}