
import { SecurityService } from '@/services/securityService';

describe('SecurityService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Rate Limiting', () => {
    it('should allow attempts within rate limit', () => {
      const result = SecurityService.checkRateLimit('login', 'test@example.com');
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(5);
    });

    it('should block attempts after exceeding rate limit', () => {
      // Record 5 failed attempts
      for (let i = 0; i < 5; i++) {
        SecurityService.recordAttempt('login', 'test@example.com', false);
      }

      const result = SecurityService.checkRateLimit('login', 'test@example.com');
      expect(result.allowed).toBe(false);
      expect(result.resetTime).toBeDefined();
    });

    it('should reset rate limit after successful login', () => {
      // Record failed attempts
      for (let i = 0; i < 3; i++) {
        SecurityService.recordAttempt('login', 'test@example.com', false);
      }

      // Record successful attempt
      SecurityService.recordAttempt('login', 'test@example.com', true);

      const result = SecurityService.checkRateLimit('login', 'test@example.com');
      expect(result.allowed).toBe(true);
    });
  });

  describe('CSRF Protection', () => {
    it('should generate and validate CSRF tokens', () => {
      const token = SecurityService.setCSRFToken();
      expect(token).toBeDefined();
      expect(token.length).toBe(64);

      const isValid = SecurityService.validateCSRFToken(token);
      expect(isValid).toBe(true);
    });

    it('should reject invalid CSRF tokens', () => {
      SecurityService.setCSRFToken();
      const isValid = SecurityService.validateCSRFToken('invalid-token');
      expect(isValid).toBe(false);
    });
  });
});
