import React from 'react';
import { FormField, EnhancedInput } from '@/components/ui/enhanced-form';
import { PackageFormData } from './hooks/usePackageFormData';

interface PackageBasicFieldsProps {
  formData: PackageFormData;
  fieldErrors: Record<string, string>;
  onFieldChange: (field: keyof PackageFormData, value: string) => void;
  isMobile: boolean;
}

const PackageBasicFields: React.FC<PackageBasicFieldsProps> = ({
  formData,
  fieldErrors,
  onFieldChange,
  isMobile
}) => {
  return (
    <div className={isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
      <FormField 
        label="Internal Tracking Number" 
        required
        error={fieldErrors.tracking_number}
      >
        <EnhancedInput
          value={formData.tracking_number}
          onChange={(e) => onFieldChange('tracking_number', e.target.value)}
          placeholder="YP2024XXX"
          error={!!fieldErrors.tracking_number}
        />
      </FormField>
      
      <FormField label="Description" required>
        <EnhancedInput
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="Package contents description"
        />
      </FormField>
    </div>
  );
};

export default PackageBasicFields;