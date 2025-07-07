import { Database } from '@/integrations/supabase/types';

export type Invoice = Database['public']['Tables']['invoices']['Row'];

export type InvoiceLineItem = Database['public']['Tables']['invoice_line_items']['Row'];

// Extended invoice type with package data and line items
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
  invoice_line_items?: InvoiceLineItem[];
};

// Invoice creation types
export type ShippingInvoiceData = {
  packageId: string;
  shippingCost: number;
  customsDuty: number;
  handlingFee: number;
  taxAmount?: number;
};

export type InvoiceType = 'shipping_invoice' | 'receipt';