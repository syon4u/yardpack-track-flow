
// DEPRECATED: Use useOptimizedPackages instead
// This hook is kept for backward compatibility but will be removed in future versions
export { useOptimizedPackages as usePackages } from './useOptimizedPackages';
export { useUpdatePackageStatus } from './packages/useUpdatePackageStatus';
export { useCreatePackage } from './packages/useCreatePackage';

// Re-export types for backward compatibility
export type { TransformedPackage, UsePackagesOptions, CreatePackageData } from '@/types/package';
