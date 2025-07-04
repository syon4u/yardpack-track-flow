
import { Database } from '@/integrations/supabase/types';

type PackageStatus = Database['public']['Enums']['package_status'];

// Define the transformed package type that PackageList expects
export interface TransformedPackage {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  delivery_address: string;
  sender_name: string | null;
  sender_address: string | null;
  weight: number | null;
  dimensions: string | null;
  package_value: number | null;
  notes: string | null;
  carrier: string | null;
  external_tracking_number: string | null;
  status: PackageStatus;
  date_received: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  duty_rate: number | null;
  duty_amount: number | null;
  total_due: number | null;
  api_sync_status: string | null;
  last_api_sync: string | null;
  delivery_estimate: string | null;
  last_notification_status: PackageStatus | null;
  last_notification_sent_at: string | null;
  created_at: string;
  updated_at: string;
  // Add Magaya fields
  magaya_shipment_id: string | null;
  magaya_reference_number: string | null;
  warehouse_location: string | null;
  consolidation_status: string | null;
  customers: {
    id: string;
    full_name: string;
    email: string | null;
    phone_number: string | null;
    address: string | null;
    customer_type: Database['public']['Enums']['customer_type'];
    user_id: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  invoices: Database['public']['Tables']['invoices']['Row'][];
  customer_name: string;
  customer_email: string | null;
  invoice_uploaded: boolean;
  duty_assessed: boolean;
}

export interface UsePackagesOptions {
  searchTerm?: string;
  statusFilter?: string;
  customerFilter?: string;
}

export interface CreatePackageData {
  tracking_number: string;
  customer_id: string;
  description: string;
  delivery_address: string;
  sender_name?: string;
  sender_address?: string;
  weight?: number;
  dimensions?: string;
  package_value?: number;
  notes?: string;
  carrier?: string;
  external_tracking_number?: string;
}
