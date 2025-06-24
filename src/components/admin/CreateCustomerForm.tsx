
import React, { useState } from 'react';
import { useCreateCustomer } from '@/hooks/useCustomers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

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
    customer_type: 'guest' as const,
    preferred_contact_method: 'email',
    notes: '',
    // For registered customers
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

        // Create user account first
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.full_name,
              phone_number: formData.phone_number
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Create customer record linked to user
          await createCustomerMutation.mutateAsync({
            full_name: formData.full_name,
            email: formData.email,
            phone_number: formData.phone_number || null,
            address: formData.address || null,
            customer_type: 'registered',
            user_id: authData.user.id,
            preferred_contact_method: formData.preferred_contact_method,
            notes: formData.notes || null,
          });
        }
      } else {
        // Create customer record without user account
        await createCustomerMutation.mutateAsync({
          full_name: formData.full_name,
          email: formData.email || null,
          phone_number: formData.phone_number || null,
          address: formData.address || null,
          customer_type: formData.customer_type,
          user_id: null,
          preferred_contact_method: formData.preferred_contact_method,
          notes: formData.notes || null,
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
          <div>
            <Label htmlFor="customer_type" className={isMobile ? 'text-sm' : ''}>Customer Type *</Label>
            <Select value={formData.customer_type} onValueChange={(value) => handleInputChange('customer_type', value)}>
              <SelectTrigger className={isMobile ? 'h-12 text-base' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guest">Guest Customer</SelectItem>
                <SelectItem value="registered">Registered Customer</SelectItem>
                <SelectItem value="package_only">Package-Only Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="email" className={isMobile ? 'text-sm' : ''}>
              Email {formData.customer_type === 'registered' ? '*' : ''}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter customer's email"
              required={formData.customer_type === 'registered'}
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>

          {formData.customer_type === 'registered' && (
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
          )}

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

          <div>
            <Label htmlFor="preferred_contact_method" className={isMobile ? 'text-sm' : ''}>Preferred Contact Method</Label>
            <Select value={formData.preferred_contact_method} onValueChange={(value) => handleInputChange('preferred_contact_method', value)}>
              <SelectTrigger className={isMobile ? 'h-12 text-base' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes" className={isMobile ? 'text-sm' : ''}>Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about the customer"
              className={isMobile ? 'min-h-[80px] text-base' : ''}
            />
          </div>

          {formData.customer_type === 'registered' && (
            <div className={`text-sm text-gray-600 bg-blue-50 p-3 rounded ${isMobile ? 'text-xs' : ''}`}>
              <p><strong>Note:</strong> The customer will receive a confirmation email and will need to verify their email address before they can log in.</p>
            </div>
          )}

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
