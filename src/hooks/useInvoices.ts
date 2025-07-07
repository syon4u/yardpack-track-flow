
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { InvoiceWithPackage } from '@/types/invoice';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];

// Hook to get invoices for a user with package data
export const useInvoices = (packageId?: string, invoiceType?: 'shipping_invoice' | 'receipt') => {
  const { user } = useAuth();
  
  return useQuery<InvoiceWithPackage[]>({
    queryKey: ['invoices', user?.id, packageId, invoiceType],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      let query = supabase
        .from('invoices')
        .select(`
          *,
          invoice_line_items (*)
        `)
        .eq('uploaded_by', user.id);
      
      if (packageId) {
        query = query.eq('package_id', packageId);
      }
      
      if (invoiceType) {
        query = query.eq('invoice_type', invoiceType);
      }
      
      const { data: invoices, error } = await query.order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch package data separately
      if (invoices && invoices.length > 0) {
        const packageIds = [...new Set(invoices.map(inv => inv.package_id))];
        const { data: packages } = await supabase
          .from('packages')
          .select('id, tracking_number, description')
          .in('id', packageIds);
        
        // Merge the data
        return invoices.map(invoice => ({
          ...invoice,
          packages: packages?.find(pkg => pkg.id === invoice.package_id) ? {
            id: packages.find(pkg => pkg.id === invoice.package_id)!.id,
            tracking_number: packages.find(pkg => pkg.id === invoice.package_id)!.tracking_number,
            description: packages.find(pkg => pkg.id === invoice.package_id)!.description
          } : null
        }));
      }
      
      return invoices || [];
    },
    enabled: !!user,
  });
};

// Hook to get all invoices for admin with package and customer data
export const useAllInvoices = (status?: string, invoiceType?: 'shipping_invoice' | 'receipt') => {
  const { profile } = useAuth();
  
  return useQuery<InvoiceWithPackage[]>({
    queryKey: ['all-invoices', status, invoiceType],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          invoice_line_items (*)
        `);
      
      if (status && status !== 'all') {
        if (invoiceType === 'shipping_invoice') {
          query = query.eq('payment_status', status);
        } else {
          query = query.eq('status', status);
        }
      }
      
      if (invoiceType) {
        query = query.eq('invoice_type', invoiceType);
      }
      
      const { data: invoices, error } = await query.order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch package and customer data separately to avoid complex joins
      if (invoices && invoices.length > 0) {
        const packageIds = [...new Set(invoices.map(inv => inv.package_id))];
        
        // Get packages first
        const { data: packages } = await supabase
          .from('packages')
          .select('id, tracking_number, description, customer_id')
          .in('id', packageIds);
        
        // Get customers for these packages
        const customerIds = [...new Set(packages?.map(pkg => pkg.customer_id) || [])];
        const { data: customers } = await supabase
          .from('customers')
          .select('id, full_name, email')
          .in('id', customerIds);
        
        // Merge the data
        return invoices.map(invoice => {
          const packageData = packages?.find(pkg => pkg.id === invoice.package_id);
          const customerData = packageData ? customers?.find(cust => cust.id === packageData.customer_id) : null;
          
          return {
            ...invoice,
            packages: packageData ? {
              id: packageData.id,
              tracking_number: packageData.tracking_number,
              description: packageData.description,
              customers: customerData ? {
                full_name: customerData.full_name,
                email: customerData.email
              } : undefined
            } : null
          };
        });
      }
      
      return invoices || [];
    },
    enabled: profile?.role === 'admin',
  });
};

// Hook to update invoice status (admin only)
export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ invoiceId, status, notes }: { 
      invoiceId: string; 
      status: string; 
      notes?: string 
    }) => {
      const { error } = await supabase
        .from('invoices')
        .update({ status, notes })
        .eq('id', invoiceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['all-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({
        title: "Invoice Updated",
        description: "Invoice status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update invoice status. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUploadInvoice = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ packageId, file }: { packageId: string; file: File }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${packageId}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Create invoice record
      const { error: dbError } = await supabase
        .from('invoices')
        .insert({
          package_id: packageId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id,
          status: 'pending',
          document_type: 'receipt',
        });
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Invoice Uploaded",
        description: "Your invoice has been uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload invoice. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook for admin to create invoice for customer package
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      packageId, 
      invoiceNumber, 
      totalAmount, 
      dueDate, 
      notes 
    }: { 
      packageId: string; 
      invoiceNumber: string;
      totalAmount: number;
      dueDate?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Create invoice record
      const { error: dbError } = await supabase
        .from('invoices')
        .insert({
          package_id: packageId,
          document_type: 'invoice',
          invoice_number: invoiceNumber,
          total_amount: totalAmount,
          due_date: dueDate,
          notes: notes,
          uploaded_by: user.id,
          status: 'pending',
          file_name: `Invoice_${invoiceNumber}.pdf`,
          file_path: `invoices/${invoiceNumber}.pdf`,
          file_type: 'application/pdf',
        });
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['all-invoices'] });
      toast({
        title: "Invoice Created",
        description: "Invoice has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDownloadInvoice = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (filePath: string) => {
      const { data, error } = await supabase.storage
        .from('invoices')
        .download(filePath);
      
      if (error) throw error;
      
      // Create download URL
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'invoice';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook to delete invoice
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['all-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({
        title: "Invoice Deleted",
        description: "Invoice has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      });
    },
  });
};
