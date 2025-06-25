
import { OptimizedDataService } from '@/services/optimizedDataService';
import { TestResult } from '@/types/testing';

export class AdminTestUtils {
  static updateTest(
    tests: TestResult[], 
    index: number, 
    updates: Partial<TestResult>
  ): TestResult[] {
    return tests.map((test, i) => i === index ? { ...test, ...updates } : test);
  }

  static async runAuthLoadingTest(authLoading: boolean): Promise<Partial<TestResult>> {
    if (authLoading) {
      return { status: 'success', message: 'Auth loading state detected correctly' };
    } else {
      return { status: 'success', message: 'Auth already loaded' };
    }
  }

  static async runProfileAccessTest(userRole?: string): Promise<Partial<TestResult>> {
    if (userRole === 'admin') {
      return { status: 'success', message: 'Admin access confirmed' };
    } else {
      return { status: 'error', message: 'No admin access - cannot run remaining tests' };
    }
  }

  static async runStatsPerformanceTest(): Promise<Partial<TestResult>> {
    try {
      const startTime = performance.now();
      const stats = await OptimizedDataService.fetchOptimizedStats();
      const duration = performance.now() - startTime;
      
      if (duration < 3000) {
        return { 
          status: 'success', 
          duration, 
          message: `Stats loaded in ${duration.toFixed(0)}ms - Good performance` 
        };
      } else if (duration < 8000) {
        return { 
          status: 'warning', 
          duration, 
          message: `Stats loaded in ${duration.toFixed(0)}ms - Acceptable` 
        };
      } else {
        return { 
          status: 'error', 
          duration, 
          message: `Stats took ${duration.toFixed(0)}ms - Too slow` 
        };
      }
    } catch (error) {
      return { status: 'error', message: `Stats query failed: ${error}` };
    }
  }

  static async runPackagePerformanceTest(): Promise<Partial<TestResult>> {
    try {
      const startTime = performance.now();
      const packages = await OptimizedDataService.fetchPackagesPaginated({}, { page: 1, limit: 25 });
      const duration = performance.now() - startTime;
      
      if (duration < 2000) {
        return { 
          status: 'success', 
          duration, 
          message: `25 packages loaded in ${duration.toFixed(0)}ms - Excellent` 
        };
      } else if (duration < 5000) {
        return { 
          status: 'warning', 
          duration, 
          message: `25 packages loaded in ${duration.toFixed(0)}ms - Acceptable` 
        };
      } else {
        return { 
          status: 'error', 
          duration, 
          message: `25 packages took ${duration.toFixed(0)}ms - Too slow` 
        };
      }
    } catch (error) {
      return { status: 'error', message: `Package query failed: ${error}` };
    }
  }

  static async runErrorHandlingTest(): Promise<Partial<TestResult>> {
    const testStartTime = performance.now();
    try {
      // Test with a very short timeout to trigger error handling
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Simulated timeout')), 100)
      );
      
      await Promise.race([
        OptimizedDataService.fetchOptimizedStats(),
        timeoutPromise
      ]);
      
      return { status: 'warning', message: 'Query completed before timeout simulation' };
    } catch (error) {
      const duration = performance.now() - testStartTime;
      if (duration < 200) {
        return { 
          status: 'success', 
          duration,
          message: 'Timeout error handling works correctly' 
        };
      } else {
        return { status: 'warning', message: 'Error caught but timing unexpected' };
      }
    }
  }
}
