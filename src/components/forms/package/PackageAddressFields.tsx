import React from 'react';
import { FormField, EnhancedInput, EnhancedTextarea } from '@/components/ui/enhanced-form';
import { PackageFormData } from './hooks/usePackageFormData';

interface PackageAddressFieldsProps {
  formData: PackageFormData;
  fieldErrors: Record<string, string>;
  onFieldChange: (field: keyof PackageFormData, value: string) => void;
  isMobile: boolean;
}

const PackageAddressFields: React.FC<PackageAddressFieldsProps> = ({
  formData,
  fieldErrors,
  onFieldChange,
  isMobile
}) => {
  return (
    <div className="space-y-4">
      <FormField 
        label="Delivery Address" 
        required
        error={fieldErrors.delivery_address}
      >
        <EnhancedTextarea
          value={formData.delivery_address}
          onChange={(e) => onFieldChange('delivery_address', e.target.value)}
          placeholder="Complete delivery address"
          error={!!fieldErrors.delivery_address}
          rows={3}
        />
      </FormField>

      <div className={isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
        <FormField label="Sender Name">
          <EnhancedInput
            value={formData.sender_name}
            onChange={(e) => onFieldChange('sender_name', e.target.value)}
            placeholder="Sender's name"
          />
        </FormField>
        
        <FormField label="Sender Address">
          <EnhancedInput
            value={formData.sender_address}
            onChange={(e) => onFieldChange('sender_address', e.target.value)}
            placeholder="Sender's address"
          />
        </FormField>
      </div>
    </div>
  );
};

export default PackageAddressFields;