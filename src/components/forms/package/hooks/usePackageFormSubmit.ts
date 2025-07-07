import { useCreatePackage } from '@/hooks/usePackages';
import { useCustomers } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';
import { PackageFormData } from './usePackageFormData';
import { useQueryClient } from '@tanstack/react-query';

export const usePackageFormSubmit = (onClose: () => void, validateForm: () => Promise<boolean>, resetForm: () => void) => {
  const { toast } = useToast();
  const createPackageMutation = useCreatePackage();
  const { data: customers } = useCustomers();
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: PackageFormData) => {
    // First validate the form
    const isValid = await validateForm();
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return false;
    }

    // Verify customer exists
    const selectedCustomer = customers?.find(c => c.id === formData.customer_id);
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Selected customer not found. Please refresh and try again.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Prepare package data with proper type conversions
      const packageData = {
        tracking_number: formData.tracking_number.trim(),
        customer_id: selectedCustomer.id,
        description: formData.description.trim(),
        delivery_address: formData.delivery_address.trim(),
        sender_name: formData.sender_name.trim() || undefined,
        sender_address: formData.sender_address.trim() || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dimensions: formData.dimensions.trim() || undefined,
        package_value: formData.package_value ? parseFloat(formData.package_value) : undefined,
        notes: formData.notes.trim() || undefined,
        carrier: formData.carrier.trim() || undefined,
        external_tracking_number: formData.external_tracking_number.trim() || undefined,
      };

      // Optimistic update - add package to cache immediately
      const tempPackage = {
        ...packageData,
        id: 'temp-' + Date.now(),
        status: 'received' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        date_received: new Date().toISOString(),
        estimated_delivery: null,
        actual_delivery: null,
        duty_amount: null,
        duty_rate: 0.15,
        total_due: null,
        api_sync_status: 'pending',
        last_api_sync: null,
        magaya_shipment_id: null,
        magaya_reference_number: null,
        warehouse_location: null,
        consolidation_status: 'pending',
        delivery_estimate: null,
        last_notification_sent_at: null,
        last_notification_status: null,
        customer_name: selectedCustomer.full_name,
        customer_email: selectedCustomer.email,
        invoices: [],
        invoice_uploaded: false,
        duty_assessed: false,
      };

      // Optimistically update the packages cache
      queryClient.setQueryData(['optimized-packages'], (oldData: any) => {
        if (!oldData) return { data: [tempPackage], total: 1, hasMore: false };
        return {
          ...oldData,
          data: [tempPackage, ...oldData.data],
          total: oldData.total + 1,
        };
      });

      const result = await createPackageMutation.mutateAsync(packageData);
      
      toast({
        title: "Success",
        description: `Package ${result.tracking_number} created successfully`,
      });
      
      resetForm();
      onClose();
      return true;
    } catch (error) {
      // Remove optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['optimized-packages'] });
      
      console.error('Package creation error:', error);
      
      let errorMessage = "Failed to create package";
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          errorMessage = "Tracking number already exists";
        } else if (error.message.includes('foreign key')) {
          errorMessage = "Invalid customer selected";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error creating package",
        description: errorMessage,
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