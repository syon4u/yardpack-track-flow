import React from 'react';
import { FormField, EnhancedInput, EnhancedTextarea } from '@/components/ui/enhanced-form';
import { PackageFormData } from './hooks/usePackageFormData';

interface PackageDetailsFieldsProps {
  formData: PackageFormData;
  fieldErrors: Record<string, string>;
  onFieldChange: (field: keyof PackageFormData, value: string) => void;
  isMobile: boolean;
}

const PackageDetailsFields: React.FC<PackageDetailsFieldsProps> = ({
  formData,
  fieldErrors,
  onFieldChange,
  isMobile
}) => {
  return (
    <div className="space-y-4">
      <div className={isMobile ? 'space-y-4' : 'grid grid-cols-3 gap-4'}>
        <FormField 
          label="Weight (lbs)"
          error={fieldErrors.weight}
        >
          <EnhancedInput
            type="number"
            value={formData.weight}
            onChange={(e) => onFieldChange('weight', e.target.value)}
            placeholder="0.0"
            step="0.1"
            min="0"
            error={!!fieldErrors.weight}
          />
        </FormField>
        
        <FormField label="Dimensions">
          <EnhancedInput
            value={formData.dimensions}
            onChange={(e) => onFieldChange('dimensions', e.target.value)}
            placeholder="L x W x H (inches)"
          />
        </FormField>
        
        <FormField 
          label="Package Value ($)"
          error={fieldErrors.package_value}
        >
          <EnhancedInput
            type="number"
            value={formData.package_value}
            onChange={(e) => onFieldChange('package_value', e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            error={!!fieldErrors.package_value}
          />
        </FormField>
      </div>
        
      <FormField label="Notes">
        <EnhancedTextarea
          value={formData.notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
          placeholder="Additional notes about the package"
          rows={3}
        />
      </FormField>
    </div>
  );
};

export default PackageDetailsFields;