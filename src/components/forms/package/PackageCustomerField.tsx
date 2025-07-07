import React from 'react';
import { FormField } from '@/components/ui/enhanced-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingList } from '@/components/ui/loading-states';
import { useCustomers } from '@/hooks/useCustomers';
import { PackageFormData } from './hooks/usePackageFormData';

interface PackageCustomerFieldProps {
  formData: PackageFormData;
  fieldErrors: Record<string, string>;
  onFieldChange: (field: keyof PackageFormData, value: string) => void;
}

const PackageCustomerField: React.FC<PackageCustomerFieldProps> = ({
  formData,
  fieldErrors,
  onFieldChange
}) => {
  const { data: customers, isPending: customersLoading } = useCustomers();

  // Filter to only show registered customers for the dropdown
  const registeredCustomers = customers?.filter(customer => 
    customer.customer_type === 'registered' && customer.user_id
  ) || [];

  return (
    <FormField 
      label="Customer" 
      required
      error={fieldErrors.customer_id}
    >
      {customersLoading ? (
        <LoadingList count={1} variant="compact" />
      ) : (
        <Select 
          value={formData.customer_id} 
          onValueChange={(value) => onFieldChange('customer_id', value)}
        >
          <SelectTrigger className={fieldErrors.customer_id ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {registeredCustomers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.full_name} {customer.email ? `(${customer.email})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  );
};

export default PackageCustomerField;