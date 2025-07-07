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

  // Show all customers - packages can be sent to any customer type
  const availableCustomers = customers || [];

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
          <SelectContent className="bg-background border border-border shadow-lg z-50">
            {availableCustomers.length === 0 ? (
              <SelectItem value="" disabled>
                No customers available
              </SelectItem>
            ) : (
              availableCustomers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{customer.full_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {customer.email || customer.phone_number || 'No contact info'} • {customer.customer_type}
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
    </FormField>
  );
};

export default PackageCustomerField;