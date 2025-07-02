import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateCustomer } from '@/hooks/customer/useUpdateCustomer';
import { CustomerWithStats } from '@/types/customer';

const editCustomerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  customer_type: z.enum(['registered', 'guest', 'package_only']),
  preferred_contact_method: z.string().optional(),
  notes: z.string().optional(),
});

type EditCustomerFormData = z.infer<typeof editCustomerSchema>;

interface EditCustomerDialogProps {
  customer: CustomerWithStats | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditCustomerDialog: React.FC<EditCustomerDialogProps> = ({
  customer,
  isOpen,
  onClose,
}) => {
  const updateCustomerMutation = useUpdateCustomer();

  const form = useForm<EditCustomerFormData>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      full_name: customer?.full_name || '',
      email: customer?.email || '',
      phone_number: customer?.phone_number || '',
      address: customer?.address || '',
      customer_type: customer?.customer_type || 'package_only',
      preferred_contact_method: customer?.preferred_contact_method || '',
      notes: customer?.notes || '',
    },
  });

  React.useEffect(() => {
    if (customer) {
      form.reset({
        full_name: customer.full_name,
        email: customer.email || '',
        phone_number: customer.phone_number || '',
        address: customer.address || '',
        customer_type: customer.customer_type,
        preferred_contact_method: customer.preferred_contact_method || '',
        notes: customer.notes || '',
      });
    }
  }, [customer, form]);

  const onSubmit = async (data: EditCustomerFormData) => {
    if (!customer) return;

    try {
      await updateCustomerMutation.mutateAsync({
        id: customer.id,
        updates: {
          ...data,
          email: data.email || null,
          phone_number: data.phone_number || null,
          address: data.address || null,
          preferred_contact_method: data.preferred_contact_method || null,
          notes: data.notes || null,
        },
      });
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="registered">Registered User</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                      <SelectItem value="package_only">Package Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_contact_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Contact Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="mail">Mail</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateCustomerMutation.isPending}
              >
                {updateCustomerMutation.isPending ? 'Updating...' : 'Update Customer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerDialog;