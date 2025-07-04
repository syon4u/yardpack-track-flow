import { errorReporter } from '@/services/errorReporting';

export interface RetryOptions {
  retries?: number;
  retryDelay?: number;
  backoff?: 'exponential' | 'linear';
  retryCondition?: (error: Error) => boolean;
}

export class RetryError extends Error {
  public lastError: Error;
  public attempts: number;

  constructor(message: string, lastError: Error, attempts: number) {
    super(message);
    this.name = 'RetryError';
    this.lastError = lastError;
    this.attempts = attempts;
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    backoff = 'exponential',
    retryCondition = defaultRetryCondition,
  } = options;

  let lastError: Error;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      attempt++;

      // Report error on first attempt
      if (attempt === 1) {
        errorReporter.reportError(
          lastError,
          'medium',
          { retryAttempt: attempt, maxRetries: retries }
        );
      }

      // If we've exhausted retries or error shouldn't be retried
      if (attempt > retries || !retryCondition(lastError)) {
        throw new RetryError(
          `Operation failed after ${attempt} attempts: ${lastError.message}`,
          lastError,
          attempt
        );
      }

      // Calculate delay
      const delay = backoff === 'exponential' 
        ? retryDelay * Math.pow(2, attempt - 1)
        : retryDelay * attempt;

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      await sleep(jitteredDelay);
    }
  }

  throw new RetryError(
    `Operation failed after ${attempt} attempts: ${lastError!.message}`,
    lastError!,
    attempt
  );
}

function defaultRetryCondition(error: Error): boolean {
  // Retry on network errors, 5xx errors, and timeouts
  const retryableMessages = [
    'fetch',
    'network',
    'timeout',
    'connection',
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNREFUSED',
  ];

  const message = error.message.toLowerCase();
  return retryableMessages.some(keyword => message.includes(keyword));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// React Query retry configuration
export const defaultQueryRetryOptions = {
  retry: (failureCount: number, error: Error) => {
    // Don't retry on 4xx errors (client errors) except 408, 429
    if (error.message.includes('40') && 
        !error.message.includes('408') && 
        !error.message.includes('429')) {
      return false;
    }
    
    // Retry up to 3 times for other errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
  },
};

export const defaultMutationRetryOptions = {
  retry: 1, // Only retry mutations once
  retryDelay: 1000,
};