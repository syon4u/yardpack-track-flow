import { Database } from '@/integrations/supabase/types';

export type Invoice = Database['public']['Tables']['invoices']['Row'];

// Extended invoice type with package data
export type InvoiceWithPackage = Invoice & {
  packages?: {
    id: string;
    tracking_number: string;
    description: string;
    customers?: {
      full_name: string;
      email: string | null;
    };
  } | null;
};