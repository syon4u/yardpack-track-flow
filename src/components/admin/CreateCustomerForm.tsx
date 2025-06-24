import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface CreateCustomerFormProps {
  onClose: () => void;
}

const CreateCustomerForm: React.FC<CreateCustomerFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    password: ''
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: typeof formData) => {
      // Use the standard signup process
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: customerData.email,
        password: customerData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: customerData.full_name,
            phone_number: customerData.phone_number
          }
        }
      });

      if (authError) throw authError;

      // If signup was successful and user was created, update profile with additional info
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            address: customerData.address,
            role: 'customer'
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          // Don't throw here as the user was created successfully
        }
      }

      return authData.user;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer created successfully. They will receive a confirmation email.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['unified-customers'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Customer creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await createCustomerMutation.mutateAsync(formData);
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
          <div>
            <Label htmlFor="full_name" className={isMobile ? 'text-sm' : ''}>Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter customer's full name"
              required
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>

          <div>
            <Label htmlFor="email" className={isMobile ? 'text-sm' : ''}>Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter customer's email"
              required
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>

          <div>
            <Label htmlFor="password" className={isMobile ? 'text-sm' : ''}>Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter temporary password"
              required
              minLength={6}
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>

          <div>
            <Label htmlFor="phone_number" className={isMobile ? 'text-sm' : ''}>Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              placeholder="Enter phone number"
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>

          <div>
            <Label htmlFor="address" className={isMobile ? 'text-sm' : ''}>Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter customer's address"
              className={isMobile ? 'min-h-[100px] text-base' : ''}
            />
          </div>

          <div className={`text-sm text-gray-600 bg-blue-50 p-3 rounded ${isMobile ? 'text-xs' : ''}`}>
            <p><strong>Note:</strong> The customer will receive a confirmation email and will need to verify their email address before they can log in.</p>
          </div>

          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-end space-x-2'} pt-4`}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className={isMobile ? 'w-full h-12' : ''}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCustomerMutation.isPending}
              className={isMobile ? 'w-full h-12' : ''}
            >
              {createCustomerMutation.isPending ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomerForm;
