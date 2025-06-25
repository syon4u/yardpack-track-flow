import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUploadInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ packageId, file }: { packageId: string; file: File }) => {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a PDF, JPG, JPEG, or PNG file.');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Please upload a file smaller than 10MB.');
      }
      
      // Create file path without user ID requirement
      const fileExt = file.name.split('.').pop();
      const fileName = `${packageId}_${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Create invoice record without uploaded_by requirement
      const { error: dbError } = await supabase
        .from('invoices')
        .insert({
          package_id: packageId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: 'system', // Mock uploader since auth is disabled
        });
      
      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('invoices')
          .remove([filePath]);
        throw dbError;
      }

      return { fileName: file.name, packageId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({
        title: 'Invoice uploaded successfully',
        description: `${data.fileName} has been uploaded and linked to the package.`,
      });
    },
    onError: (error: Error) => {
      console.error('Invoice upload failed:', error);
      toast({
        title: 'Invoice upload failed',
        description: error.message || 'There was an error uploading the invoice. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDownloadInvoice = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (filePath: string) => {
      // Use signed URL for secure download
      const { data: signedUrl, error: urlError } = await supabase.storage
        .from('invoices')
        .createSignedUrl(filePath, 60); // 60 seconds expiry
      
      if (urlError) throw urlError;
      if (!signedUrl) throw new Error('Failed to generate download URL');
      
      // Download file using signed URL
      const response = await fetch(signedUrl.signedUrl);
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      
      // Create download URL
      const url = URL.createObjectURL(blob);
      const fileName = filePath.split('/').pop() || 'invoice';
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return fileName;
    },
    onSuccess: (fileName) => {
      toast({
        title: 'Invoice downloaded',
        description: `${fileName} has been downloaded to your device.`,
      });
    },
    onError: (error: Error) => {
      console.error('Invoice download failed:', error);
      toast({
        title: 'Download failed',
        description: error.message || 'There was an error downloading the invoice. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useGetInvoiceUrl = () => {
  return useMutation({
    mutationFn: async (filePath: string) => {
      // Generate signed URL for viewing
      const { data: signedUrl, error } = await supabase.storage
        .from('invoices')
        .createSignedUrl(filePath, 300); // 5 minutes expiry for viewing
      
      if (error) throw error;
      if (!signedUrl) throw new Error('Failed to generate view URL');
      
      return signedUrl.signedUrl;
    },
    onError: (error: Error) => {
      console.error('Failed to generate invoice URL:', error);
    },
  });
};
