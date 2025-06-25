import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
}

export class SecurityService {
  private static readonly RATE_LIMITS: Record<string, RateLimitConfig> = {
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 }, // 5 attempts in 15min, block for 30min
    signup: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 }, // 3 attempts in 1hr, block for 1hr
    passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 }
  };

  private static getStorageKey(action: string, identifier: string): string {
    return `security_${action}_${identifier.toLowerCase()}`;
  }

  static checkRateLimit(action: keyof typeof SecurityService.RATE_LIMITS, identifier: string): {
    allowed: boolean;
    remainingAttempts?: number;
    resetTime?: number;
  } {
    const config = this.RATE_LIMITS[action];
    const storageKey = this.getStorageKey(action, identifier);
    const now = Date.now();

    try {
      const storedData = localStorage.getItem(storageKey);
      const attempts: LoginAttempt[] = storedData ? JSON.parse(storedData) : [];

      // Clean old attempts outside the window
      const validAttempts = attempts.filter(
        attempt => now - attempt.timestamp < config.windowMs
      );

      // Check if currently blocked
      const lastFailedAttempt = validAttempts
        .filter(attempt => !attempt.success)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      if (lastFailedAttempt && 
          validAttempts.filter(attempt => !attempt.success).length >= config.maxAttempts &&
          now - lastFailedAttempt.timestamp < config.blockDurationMs) {
        return {
          allowed: false,
          resetTime: lastFailedAttempt.timestamp + config.blockDurationMs
        };
      }

      const failedAttempts = validAttempts.filter(attempt => !attempt.success).length;
      return {
        allowed: failedAttempts < config.maxAttempts,
        remainingAttempts: Math.max(0, config.maxAttempts - failedAttempts)
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: true }; // Fail open
    }
  }

  static recordAttempt(action: keyof typeof SecurityService.RATE_LIMITS, identifier: string, success: boolean): void {
    const storageKey = this.getStorageKey(action, identifier);
    const now = Date.now();

    try {
      const storedData = localStorage.getItem(storageKey);
      const attempts: LoginAttempt[] = storedData ? JSON.parse(storedData) : [];

      attempts.push({
        email: identifier,
        timestamp: now,
        success
      });

      // Keep only recent attempts
      const config = this.RATE_LIMITS[action];
      const validAttempts = attempts.filter(
        attempt => now - attempt.timestamp < Math.max(config.windowMs, config.blockDurationMs)
      );

      localStorage.setItem(storageKey, JSON.stringify(validAttempts));
    } catch (error) {
      console.error('Failed to record attempt:', error);
    }
  }

  static async validateSession(): Promise<{ valid: boolean; user: any; session: any }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session validation error:', error);
        return { valid: false, user: null, session: null };
      }

      if (!session) {
        return { valid: false, user: null, session: null };
      }

      // Check if session is close to expiring (refresh if less than 10 minutes left)
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 600) { // Less than 10 minutes
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Session refresh error:', refreshError);
          return { valid: false, user: null, session: null };
        }

        return { 
          valid: true, 
          user: refreshData.user, 
          session: refreshData.session 
        };
      }

      return { valid: true, user: session.user, session };
    } catch (error) {
      console.error('Session validation failed:', error);
      return { valid: false, user: null, session: null };
    }
  }

  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static setCSRFToken(): string {
    const token = this.generateCSRFToken();
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  static validateCSRFToken(token: string): boolean {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token;
  }

  static clearSecurityData(): void {
    // Clear rate limiting data on successful logout
    const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('security_'));
    keysToRemove.forEach(key => localStorage.removeItem(key));
    sessionStorage.removeItem('csrf_token');
  }
}
