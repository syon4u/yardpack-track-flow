
// Re-export all customer hooks from their individual files for backward compatibility
export { useCustomers } from './customer/useCustomersList';
export { useCustomerByUserId } from './customer/useCustomerByUserId';
export { useCreateCustomer } from './customer/useCreateCustomer';
export { useUpdateCustomer } from './customer/useUpdateCustomer';
export { useDeleteCustomer } from './customer/useDeleteCustomer';

// Re-export types for convenience
export type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
  CustomerWithStats
} from '@/types/customer';
