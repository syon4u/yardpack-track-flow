import React, { useState, useEffect } from 'react';
import { useCreatePackage } from '@/hooks/usePackages';
import { useCarrierDetection } from '@/hooks/useTrackingAPI';
import { useCustomers } from '@/hooks/useCustomers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  EnhancedForm, 
  FormField, 
  EnhancedInput, 
  EnhancedTextarea, 
  FormActions 
} from '@/components/ui/enhanced-form';
import { PackageSchema, ValidationHelper, PackageFormData } from '@/utils/validation';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingList } from '@/components/ui/loading-states';

interface CreatePackageFormProps {
  onClose: () => void;
}

const CreatePackageForm: React.FC<CreatePackageFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const createPackageMutation = useCreatePackage();
  const { detectCarrier } = useCarrierDetection();
  
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    tracking_number: '',
    customer_id: '',
    description: '',
    delivery_address: '',
    sender_name: '',
    sender_address: '',
    weight: '',
    dimensions: '',
    package_value: '',
    notes: '',
    carrier: '',
    external_tracking_number: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Use the customers from the new customers table
  const { data: customers, isPending: customersLoading } = useCustomers();

  // Filter to only show registered customers for the dropdown
  const registeredCustomers = customers?.filter(customer => 
    customer.customer_type === 'registered' && customer.user_id
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    // Find the selected customer
    const selectedCustomer = customers?.find(c => c.id === formData.customer_id);
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Selected customer not found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createPackageMutation.mutateAsync({
        ...formData,
        customer_id: selectedCustomer.id, // Use the customer table ID directly
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
    } catch (error) {
      toast({
        title: "Error creating package",
        description: error instanceof Error ? error.message : "Failed to create package",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-detect carrier when external tracking number changes
    if (field === 'external_tracking_number' && value) {
      const detectedCarrier = detectCarrier(value);
      if (detectedCarrier !== 'UNKNOWN') {
        setFormData(prev => ({ ...prev, carrier: detectedCarrier }));
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Package</DialogTitle>
        </DialogHeader>
        
        <EnhancedForm>
          <div className={isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
            <FormField 
              label="Internal Tracking Number" 
              required
              error={fieldErrors.tracking_number}
            >
              <EnhancedInput
                value={formData.tracking_number}
                onChange={(e) => handleInputChange('tracking_number', e.target.value)}
                placeholder="YP2024XXX"
                error={!!fieldErrors.tracking_number}
              />
            </FormField>
            
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
                  onValueChange={(value) => handleInputChange('customer_id', value)}
                >
                  <SelectTrigger className={fieldErrors.customer_id ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {registeredCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name} {customer.email ? `(${customer.email})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
          </div>

          <div className={isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
            <FormField label="Carrier Tracking Number">
              <EnhancedInput
                value={formData.external_tracking_number}
                onChange={(e) => handleInputChange('external_tracking_number', e.target.value)}
                placeholder="External carrier tracking number"
              />
            </FormField>
            
            <FormField label="Carrier">
              <Select value={formData.carrier} onValueChange={(value) => handleInputChange('carrier', value)}>
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

          <FormField label="Description" required>
            <EnhancedInput
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Package contents description"
            />
          </FormField>

          <FormField label="Delivery Address" required>
            <EnhancedTextarea
              value={formData.delivery_address}
              onChange={(e) => handleInputChange('delivery_address', e.target.value)}
              placeholder="Full delivery address in Jamaica"
            />
          </FormField>

          <div className={isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
            <FormField label="Sender Name">
              <EnhancedInput
                value={formData.sender_name}
                onChange={(e) => handleInputChange('sender_name', e.target.value)}
                placeholder="Store or sender name"
              />
            </FormField>
            
            <FormField label="Sender Address">
              <EnhancedInput
                value={formData.sender_address}
                onChange={(e) => handleInputChange('sender_address', e.target.value)}
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
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="0.0"
              />
            </FormField>
            
            <FormField label="Dimensions">
              <EnhancedInput
                value={formData.dimensions}
                onChange={(e) => handleInputChange('dimensions', e.target.value)}
                placeholder="L x W x H inches"
              />
            </FormField>
            
            <FormField label="Package Value ($)">
              <EnhancedInput
                type="number"
                step="0.01"
                value={formData.package_value}
                onChange={(e) => handleInputChange('package_value', e.target.value)}
                placeholder="0.00"
              />
            </FormField>
          </div>

          <FormField label="Notes">
            <EnhancedTextarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or instructions"
            />
          </FormField>

          <FormActions
            primaryAction={{
              label: 'Create Package',
              onClick: () => handleSubmit({ preventDefault: () => {} } as React.FormEvent),
              loading: createPackageMutation.isPending,
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
