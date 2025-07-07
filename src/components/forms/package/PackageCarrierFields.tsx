import React from 'react';
import { FormField, EnhancedInput } from '@/components/ui/enhanced-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCarrierDetection } from '@/hooks/useTrackingAPI';
import { PackageFormData } from './hooks/usePackageFormData';

interface PackageCarrierFieldsProps {
  formData: PackageFormData;
  onFieldChange: (field: keyof PackageFormData, value: string) => void;
  isMobile: boolean;
}

const PackageCarrierFields: React.FC<PackageCarrierFieldsProps> = ({
  formData,
  onFieldChange,
  isMobile
}) => {
  const { detectCarrier } = useCarrierDetection();

  const handleTrackingNumberChange = (value: string) => {
    onFieldChange('external_tracking_number', value);
    
    // Auto-detect carrier when external tracking number changes
    if (value) {
      const detectedCarrier = detectCarrier(value);
      if (detectedCarrier !== 'UNKNOWN') {
        onFieldChange('carrier', detectedCarrier);
      }
    }
  };

  return (
    <div className={isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
      <FormField label="Carrier Tracking Number">
        <EnhancedInput
          value={formData.external_tracking_number}
          onChange={(e) => handleTrackingNumberChange(e.target.value)}
          placeholder="External carrier tracking number"
        />
      </FormField>
      
      <FormField label="Carrier">
        <Select value={formData.carrier} onValueChange={(value) => onFieldChange('carrier', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select carrier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USPS">USPS</SelectItem>
            <SelectItem value="FEDEX">FedEx</SelectItem>
            <SelectItem value="UPS">UPS</SelectItem>
            <SelectItem value="DHL">DHL</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
};

export default PackageCarrierFields;