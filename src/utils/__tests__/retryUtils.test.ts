import { vi } from 'vitest';
import { withRetry, RetryError } from '../retryUtils';

// Mock the error reporter
vi.mock('@/services/errorReporting', () => ({
  errorReporter: {
    reportError: vi.fn(),
  },
}));

describe('withRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns result when function succeeds on first attempt', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    
    const result = await withRetry(mockFn);
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually succeeds', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue('success');
    
    const result = await withRetry(mockFn, { retries: 3 });
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('throws RetryError when all retries are exhausted', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Network error'));
    
    await expect(withRetry(mockFn, { retries: 2 })).rejects.toThrow(RetryError);
    expect(mockFn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('does not retry when retryCondition returns false', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Client error'));
    const retryCondition = vi.fn().mockReturnValue(false);
    
    await expect(withRetry(mockFn, { retryCondition })).rejects.toThrow(RetryError);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(retryCondition).toHaveBeenCalledWith(expect.any(Error));
  });

  it('uses exponential backoff by default', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Network error'));
    const startTime = Date.now();
    
    await expect(withRetry(mockFn, { retries: 2, retryDelay: 100 })).rejects.toThrow();
    
    const endTime = Date.now();
    const elapsed = endTime - startTime;
    
    // With exponential backoff and jitter, should take at least 100ms + 200ms = 300ms
    expect(elapsed).toBeGreaterThan(250);
  });

  it('uses linear backoff when specified', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Network error'));
    const startTime = Date.now();
    
    await expect(withRetry(mockFn, { 
      retries: 2, 
      retryDelay: 100, 
      backoff: 'linear' 
    })).rejects.toThrow();
    
    const endTime = Date.now();
    const elapsed = endTime - startTime;
    
    // With linear backoff, should take at least 100ms + 200ms = 300ms
    expect(elapsed).toBeGreaterThan(250);
  });
});