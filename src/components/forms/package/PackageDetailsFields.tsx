import React from 'react';
import { FormField, EnhancedInput, EnhancedTextarea } from '@/components/ui/enhanced-form';
import { PackageFormData } from './hooks/usePackageFormData';

interface PackageDetailsFieldsProps {
  formData: PackageFormData;
  onFieldChange: (field: keyof PackageFormData, value: string) => void;
  isMobile: boolean;
}

const PackageDetailsFields: React.FC<PackageDetailsFieldsProps> = ({
  formData,
  onFieldChange,
  isMobile
}) => {
  return (
    <>
      <FormField label="Delivery Address" required>
        <EnhancedTextarea
          value={formData.delivery_address}
          onChange={(e) => onFieldChange('delivery_address', e.target.value)}
          placeholder="Full delivery address in Jamaica"
        />
      </FormField>

      <div className={isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
        <FormField label="Sender Name">
          <EnhancedInput
            value={formData.sender_name}
            onChange={(e) => onFieldChange('sender_name', e.target.value)}
            placeholder="Store or sender name"
          />
        </FormField>
        
        <FormField label="Sender Address">
          <EnhancedInput
            value={formData.sender_address}
            onChange={(e) => onFieldChange('sender_address', e.target.value)}
            placeholder="Miami address"
          />
        </FormField>
      </div>

      <div className={isMobile ? 'space-y-4' : 'grid grid-cols-3 gap-4'}>
        <FormField label="Weight (lbs)">
          <EnhancedInput
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => onFieldChange('weight', e.target.value)}
            placeholder="0.0"
          />
        </FormField>
        
        <FormField label="Dimensions">
          <EnhancedInput
            value={formData.dimensions}
            onChange={(e) => onFieldChange('dimensions', e.target.value)}
            placeholder="L x W x H inches"
          />
        </FormField>
        
        <FormField label="Package Value ($)">
          <EnhancedInput
            type="number"
            step="0.01"
            value={formData.package_value}
            onChange={(e) => onFieldChange('package_value', e.target.value)}
            placeholder="0.00"
          />
        </FormField>
      </div>

      <FormField label="Notes">
        <EnhancedTextarea
          value={formData.notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
          placeholder="Additional notes or instructions"
        />
      </FormField>
    </>
  );
};

export default PackageDetailsFields;