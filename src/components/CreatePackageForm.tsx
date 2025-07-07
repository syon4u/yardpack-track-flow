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

interface CreatePackageFormProps {
  onClose: () => void;
}

const CreatePackageForm: React.FC<CreatePackageFormProps> = ({ onClose }) => {
  const isMobile = useIsMobile();
  const { data: customers, isPending: customersLoading } = useCustomers();
  const { formData, fieldErrors, updateFormData } = usePackageFormData();
  const { handleSubmit, isSubmitting } = usePackageFormSubmit(onClose);

  const onSubmit = async () => {
    await handleSubmit(formData);
  };

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

          <PackageCarrierFields
            formData={formData}
            onFieldChange={updateFormData}
            isMobile={isMobile}
          />

          <PackageDetailsFields
            formData={formData}
            onFieldChange={updateFormData}
            isMobile={isMobile}
          />

          <FormActions
            primaryAction={{
              label: 'Create Package',
              onClick: onSubmit,
              loading: isSubmitting,
              disabled: customersLoading
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
