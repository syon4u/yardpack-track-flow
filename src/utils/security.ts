/**
 * Security Utilities and Headers
 * Implements client-side security measures and CSP
 */

import { config } from '@/config/environment';

// Content Security Policy configuration
const getCSP = (): string => {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://lkvelwwrztkmnvgeknpa.supabase.co https://*.supabase.co wss://*.supabase.co",
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  return policies.join('; ');
};

// Security headers configuration
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': getCSP(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    ...(config.isProduction && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    })
  };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

// Rate limiting utilities (client-side)
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this key
    const keyRequests = this.requests.get(key) || [];
    
    // Filter out old requests
    const recentRequests = keyRequests.filter(time => time > windowStart);
    
    // Check if under limit
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }
  
  clear(key?: string): void {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
}

export const rateLimiter = new RateLimiter();

// File upload security
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = config.limits.maxFileSize;
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json'
  ];
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not allowed'
    };
  }
  
  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeToExt: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf'],
    'text/plain': ['txt'],
    'text/csv': ['csv'],
    'application/json': ['json']
  };
  
  const validExtensions = mimeToExt[file.type] || [];
  if (extension && !validExtensions.includes(extension)) {
    return {
      isValid: false,
      error: 'File extension does not match file type'
    };
  }
  
  return { isValid: true };
};

// Session security
export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Initialize security measures
export const initializeSecurity = (): void => {
  // Apply CSP via meta tag if not set by server
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = getCSP();
    document.head.appendChild(meta);
  }
  
  // Disable right-click in production (optional)
  if (config.isProduction) {
    document.addEventListener('contextmenu', (e) => {
      if (!config.features.enableDebugMode) {
        e.preventDefault();
      }
    });
  }
  
  // Clear sensitive data on unload
  window.addEventListener('beforeunload', () => {
    // Clear any sensitive localStorage items if needed
    rateLimiter.clear();
  });
};

// Error boundary enhancement with security context
export const getSecurityContext = () => ({
  userAgent: navigator.userAgent,
  url: window.location.href,
  referrer: document.referrer,
  timestamp: new Date().toISOString(),
  environment: config.environment,
});