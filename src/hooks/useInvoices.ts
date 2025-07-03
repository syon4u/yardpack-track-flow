
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Hook for customers to upload receipts
export const useUploadReceipt = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ packageId, file }: { packageId: string; file: File }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${packageId}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload file to receipts storage
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Create receipt record
      const { error: dbError } = await supabase
        .from('invoices')
        .insert({
          package_id: packageId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id,
          document_type: 'receipt',
        });
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });
};

// Hook for admins to create invoices
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      packageId, 
      totalAmount, 
      dueDate, 
      lineItems, 
      notes 
    }: { 
      packageId: string; 
      totalAmount: number; 
      dueDate: string;
      lineItems: any[];
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Create invoice record
      const { error: dbError } = await supabase
        .from('invoices')
        .insert({
          package_id: packageId,
          document_type: 'invoice',
          total_amount: totalAmount,
          due_date: dueDate,
          line_items: lineItems,
          notes: notes,
          uploaded_by: user.id,
          status: 'sent',
          file_name: 'Generated Invoice',
          file_path: '', // Will be generated when PDF is created
          file_type: 'application/pdf',
        });
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useDownloadReceipt = () => {
  return useMutation({
    mutationFn: async (filePath: string) => {
      const { data, error } = await supabase.storage
        .from('receipts')
        .download(filePath);
      
      if (error) throw error;
      
      // Create download URL
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'receipt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
};

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: async (filePath: string) => {
      const { data, error } = await supabase.storage
        .from('customer-invoices')
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
  });
};

// Hook to fetch receipts for a package
export const usePackageReceipts = (packageId: string) => {
  return useQuery({
    queryKey: ['receipts', packageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('package_id', packageId)
        .eq('document_type', 'receipt');
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook to fetch invoices for a package
export const usePackageInvoices = (packageId: string) => {
  return useQuery({
    queryKey: ['invoices', packageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('package_id', packageId)
        .eq('document_type', 'invoice');
      
      if (error) throw error;
      return data;
    },
  });
};
