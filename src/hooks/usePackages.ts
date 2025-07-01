
// Re-export the refactored hooks for backward compatibility
export { usePackagesQuery as usePackages } from './packages/usePackagesQuery';
export { useUpdatePackageStatus } from './packages/useUpdatePackageStatus';
export { useCreatePackage } from './packages/useCreatePackage';

// Re-export types for backward compatibility
export type { TransformedPackage, UsePackagesOptions, CreatePackageData } from '@/types/package';
