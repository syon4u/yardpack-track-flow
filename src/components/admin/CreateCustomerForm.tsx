
import React, { useState } from 'react';
import { useCreateCustomer } from '@/hooks/useCustomers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import CustomerTypeSelect from './create-customer/CustomerTypeSelect';
import CustomerBasicInfo from './create-customer/CustomerBasicInfo';
import CustomerAddressAndPreferences from './create-customer/CustomerAddressAndPreferences';
import CustomerFormActions from './create-customer/CustomerFormActions';
import RegistrationNotice from './create-customer/RegistrationNotice';

interface CreateCustomerFormProps {
  onClose: () => void;
}

const CreateCustomerForm: React.FC<CreateCustomerFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const createCustomerMutation = useCreateCustomer();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    customer_type: 'guest',
    preferred_contact_method: 'email',
    notes: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (formData.customer_type === 'registered') {
        if (!formData.email || !formData.password) {
          toast({
            title: "Error",
            description: "Email and password are required for registered customers",
            variant: "destructive",
          });
          return;
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', formData.email)
          .maybeSingle();

        if (existingUser) {
          toast({
            title: "Error",
            description: "A user with this email already exists",
            variant: "destructive",
          });
          return;
        }

        // Create user account first
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            full_name: formData.full_name,
            phone_number: formData.phone_number
          }
        });

        if (authError) {
          console.error('Auth error:', authError);
          throw new Error(authError.message);
        }

        if (authData.user) {
          // Create customer record linked to user
          await createCustomerMutation.mutateAsync({
            full_name: formData.full_name,
            email: formData.email,
            phone_number: formData.phone_number || null,
            address: formData.address || null,
            customer_type: 'registered' as const,
            user_id: authData.user.id,
            preferred_contact_method: formData.preferred_contact_method,
            notes: formData.notes || null,
          });

          toast({
            title: "Success",
            description: `Registered user ${formData.full_name} created successfully`,
          });
        }
      } else {
        // Create customer record without user account
        await createCustomerMutation.mutateAsync({
          full_name: formData.full_name,
          email: formData.email || null,
          phone_number: formData.phone_number || null,
          address: formData.address || null,
          customer_type: formData.customer_type as 'guest' | 'package_only',
          user_id: null,
          preferred_contact_method: formData.preferred_contact_method,
          notes: formData.notes || null,
        });

        toast({
          title: "Success",
          description: `${formData.customer_type} customer ${formData.full_name} created successfully`,
        });
      }

      onClose();
    } catch (error: any) {
      console.error('Customer creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh] overflow-y-auto' : 'max-w-md'}`}>
        <DialogHeader>
          <DialogTitle className={isMobile ? 'text-lg' : ''}>Create New Customer</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className={`space-y-4 ${isMobile ? 'px-1' : ''}`}>
          <CustomerTypeSelect
            value={formData.customer_type}
            onChange={(value) => handleInputChange('customer_type', value)}
            isMobile={isMobile}
          />

          <CustomerBasicInfo
            formData={formData}
            customerType={formData.customer_type}
            isMobile={isMobile}
            onChange={handleInputChange}
          />

          <CustomerAddressAndPreferences
            formData={formData}
            isMobile={isMobile}
            onChange={handleInputChange}
          />

          <RegistrationNotice
            customerType={formData.customer_type}
            isMobile={isMobile}
          />

          <CustomerFormActions
            onCancel={onClose}
            isCreating={createCustomerMutation.isPending}
            isMobile={isMobile}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomerForm;
