import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { EnhancedForm, FormActions } from '@/components/ui/enhanced-form';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCustomers } from '@/hooks/useCustomers';
import { usePackageFormData } from './forms/package/hooks/usePackageFormData';
import { usePackageFormSubmit } from './forms/package/hooks/usePackageFormSubmit';
import PackageBasicFields from './forms/package/PackageBasicFields';
import PackageCustomerField from './forms/package/PackageCustomerField';
import PackageCarrierFields from './forms/package/PackageCarrierFields';
import PackageDetailsFields from './forms/package/PackageDetailsFields';
import PackageAddressFields from './forms/package/PackageAddressFields';

interface CreatePackageFormProps {
  onClose: () => void;
}

const CreatePackageForm: React.FC<CreatePackageFormProps> = ({ onClose }) => {
  const isMobile = useIsMobile();
  const { data: customers, isPending: customersLoading } = useCustomers();
  const { formData, fieldErrors, isValidating, updateFormData, validateForm, resetForm } = usePackageFormData();
  const { handleSubmit, isSubmitting } = usePackageFormSubmit(onClose, validateForm, resetForm);

  const onSubmit = async () => {
    await handleSubmit(formData);
  };

  const hasValidationErrors = Object.values(fieldErrors).some(error => error.length > 0);
  const isFormValidating = Object.values(isValidating).some(validating => validating);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Package</DialogTitle>
        </DialogHeader>
        
        <EnhancedForm>
          <PackageBasicFields
            formData={formData}
            fieldErrors={fieldErrors}
            onFieldChange={updateFormData}
            isMobile={isMobile}
          />

          <PackageCustomerField
            formData={formData}
            fieldErrors={fieldErrors}
            onFieldChange={updateFormData}
          />

          <PackageAddressFields
            formData={formData}
            fieldErrors={fieldErrors}
            onFieldChange={updateFormData}
            isMobile={isMobile}
          />

          <PackageCarrierFields
            formData={formData}
            onFieldChange={updateFormData}
            isMobile={isMobile}
          />

          <PackageDetailsFields
            formData={formData}
            fieldErrors={fieldErrors}
            onFieldChange={updateFormData}
            isMobile={isMobile}
          />

          <FormActions
            primaryAction={{
              label: isSubmitting ? 'Creating...' : 'Create Package',
              onClick: onSubmit,
              loading: isSubmitting || isFormValidating,
              disabled: customersLoading || hasValidationErrors || isFormValidating
            }}
            secondaryAction={{
              label: 'Cancel',
              onClick: onClose,
              variant: 'outline'
            }}
          />
        </EnhancedForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePackageForm;
