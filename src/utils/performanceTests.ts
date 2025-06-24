
import { OptimizedDataService } from '@/services/optimizedDataService';
import { UnifiedDataService } from '@/services/unifiedDataService';

interface PerformanceTestResult {
  testName: string;
  duration: number;
  memoryUsage: number;
  success: boolean;
  error?: string;
}

export class PerformanceTestRunner {
  private static measureMemory(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private static async runTest<T>(
    testName: string,
    testFn: () => Promise<T>
  ): Promise<PerformanceTestResult> {
    const startTime = performance.now();
    const startMemory = this.measureMemory();

    try {
      await testFn();
      const endTime = performance.now();
      const endMemory = this.measureMemory();

      return {
        testName,
        duration: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        success: true,
      };
    } catch (error) {
      const endTime = performance.now();
      const endMemory = this.measureMemory();

      return {
        testName,
        duration: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async runPackagePerformanceTests(): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];

    // Test 1: Optimized vs Legacy package fetching
    console.log('Running package performance tests...');

    // Optimized service test
    const optimizedResult = await this.runTest(
      'Optimized Package Fetch (50 items)',
      () => OptimizedDataService.fetchPackagesPaginated({}, { page: 1, limit: 50 })
    );
    results.push(optimizedResult);

    // Legacy service test
    const legacyResult = await this.runTest(
      'Legacy Package Fetch (All items)',
      () => UnifiedDataService.fetchAllPackages({})
    );
    results.push(legacyResult);

    // Test 2: Search performance
    const searchResult = await this.runTest(
      'Package Search Performance',
      () => OptimizedDataService.fetchPackagesPaginated(
        { searchTerm: 'test' },
        { page: 1, limit: 25 }
      )
    );
    results.push(searchResult);

    // Test 3: Filter performance
    const filterResult = await this.runTest(
      'Package Filter Performance',
      () => OptimizedDataService.fetchPackagesPaginated(
        { statusFilter: 'received' },
        { page: 1, limit: 25 }
      )
    );
    results.push(filterResult);

    return results;
  }

  static async runCustomerPerformanceTests(): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];

    console.log('Running customer performance tests...');

    // Optimized customer fetch
    const optimizedResult = await this.runTest(
      'Optimized Customer Fetch (50 items)',
      () => OptimizedDataService.fetchCustomersPaginated({}, { page: 1, limit: 50 })
    );
    results.push(optimizedResult);

    // Legacy customer fetch
    const legacyResult = await this.runTest(
      'Legacy Customer Fetch (All items)',
      () => UnifiedDataService.fetchAllCustomers()
    );
    results.push(legacyResult);

    return results;
  }

  static async runStatsPerformanceTests(): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];

    console.log('Running stats performance tests...');

    // Optimized stats
    const optimizedResult = await this.runTest(
      'Optimized Stats Fetch',
      () => OptimizedDataService.fetchOptimizedStats()
    );
    results.push(optimizedResult);

    // Legacy stats
    const legacyResult = await this.runTest(
      'Legacy Stats Fetch',
      () => UnifiedDataService.fetchUnifiedStats()
    );
    results.push(legacyResult);

    return results;
  }

  static async runAllPerformanceTests(): Promise<{
    packages: PerformanceTestResult[];
    customers: PerformanceTestResult[];
    stats: PerformanceTestResult[];
  }> {
    console.log('Starting comprehensive performance test suite...');

    const [packages, customers, stats] = await Promise.all([
      this.runPackagePerformanceTests(),
      this.runCustomerPerformanceTests(),
      this.runStatsPerformanceTests(),
    ]);

    return { packages, customers, stats };
  }

  static logResults(results: PerformanceTestResult[]): void {
    console.group('Performance Test Results');
    
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const memory = result.memoryUsage > 0 ? ` | Memory: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB` : '';
      
      console.log(`${status} ${result.testName}: ${result.duration.toFixed(2)}ms${memory}`);
      
      if (!result.success && result.error) {
        console.error(`   Error: ${result.error}`);
      }
    });
    
    console.groupEnd();
  }

  static generatePerformanceReport(results: {
    packages: PerformanceTestResult[];
    customers: PerformanceTestResult[];
    stats: PerformanceTestResult[];
  }): string {
    const allResults = [...results.packages, ...results.customers, ...results.stats];
    const successCount = allResults.filter(r => r.success).length;
    const totalTests = allResults.length;
    const averageTime = allResults.reduce((sum, r) => sum + r.duration, 0) / totalTests;

    return `
Performance Test Report
=====================
Tests Run: ${totalTests}
Successful: ${successCount}
Failed: ${totalTests - successCount}
Average Duration: ${averageTime.toFixed(2)}ms

Package Tests:
${results.packages.map(r => `  ${r.success ? '✅' : '❌'} ${r.testName}: ${r.duration.toFixed(2)}ms`).join('\n')}

Customer Tests:
${results.customers.map(r => `  ${r.success ? '✅' : '❌'} ${r.testName}: ${r.duration.toFixed(2)}ms`).join('\n')}

Stats Tests:
${results.stats.map(r => `  ${r.success ? '✅' : '❌'} ${r.testName}: ${r.duration.toFixed(2)}ms`).join('\n')}
    `.trim();
  }
}

// Auto-run performance tests in development
if (process.env.NODE_ENV === 'development') {
  // Run tests after a delay to let the app initialize
  setTimeout(() => {
    if (localStorage.getItem('runPerformanceTests') === 'true') {
      PerformanceTestRunner.runAllPerformanceTests().then(results => {
        PerformanceTestRunner.logResults([...results.packages, ...results.customers, ...results.stats]);
        console.log(PerformanceTestRunner.generatePerformanceReport(results));
      });
    }
  }, 3000);
}
