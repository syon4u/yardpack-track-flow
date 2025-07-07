import { useCreatePackage } from '@/hooks/usePackages';
import { useCustomers } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';
import { PackageFormData } from './usePackageFormData';

export const usePackageFormSubmit = (onClose: () => void) => {
  const { toast } = useToast();
  const createPackageMutation = useCreatePackage();
  const { data: customers } = useCustomers();

  const handleSubmit = async (formData: PackageFormData) => {
    if (!formData.customer_id) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return false;
    }

    const selectedCustomer = customers?.find(c => c.id === formData.customer_id);
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Selected customer not found",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      await createPackageMutation.mutateAsync({
        ...formData,
        customer_id: selectedCustomer.id,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        package_value: formData.package_value ? parseFloat(formData.package_value) : undefined,
        carrier: formData.carrier || undefined,
        external_tracking_number: formData.external_tracking_number || undefined,
      });
      
      toast({
        title: "Success",
        description: "Package created successfully",
      });
      
      onClose();
      return true;
    } catch (error) {
      toast({
        title: "Error creating package",
        description: error instanceof Error ? error.message : "Failed to create package",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    handleSubmit,
    isSubmitting: createPackageMutation.isPending
  };
};