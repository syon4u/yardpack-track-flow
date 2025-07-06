// Core services
export { DatabaseService } from './core/database';

// Domain services
export { PackageService } from './packages/packageService';
export { CustomerService } from './customers/customerService';
export { AnalyticsService } from './analytics/analyticsService';

// Re-export types for backward compatibility
export type {
  QueryOptions,
  PaginationMeta,
  PaginatedResult,
  PackageStatus,
  CustomerType,
} from './core/database';

export type {
  PackageData,
  CreatePackageData,
} from './packages/packageService';

export type {
  CustomerData,
  CustomerStats,
  CreateCustomerData,
} from './customers/customerService';

export type {
  CustomerLifetimeValue,
  SeasonalDemand,
  CustomerSegmentation,
  UnifiedStats,
} from './analytics/analyticsService';