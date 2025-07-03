import { Database } from '@/integrations/supabase/types';

type PackageStatus = Database['public']['Enums']['package_status'];

export interface PackageRowData {
  id: string;
  tracking_number: string;
  description: string;
  status: PackageStatus;
  date_received: string;
  estimated_delivery?: string;
  invoices?: any[];
  total_due?: number;
  customer_name?: string;
  customer_email?: string;
  package_value?: number;
  duty_amount?: number;
  weight?: number;
  dimensions?: string;
  sender_name?: string;
  external_tracking_number?: string;
  carrier?: string;
  notes?: string;
  magaya_shipment_id?: string | null;
  magaya_reference_number?: string | null;
  warehouse_location?: string | null;
  consolidation_status?: string | null;
}

export interface PackageTableRowProps {
  package: PackageRowData;
  userRole: 'customer' | 'admin' | 'warehouse';
  onUploadReceipt?: (packageId: string) => void;
  onViewReceipt?: (packageId: string) => void;
  onViewDetails?: (packageId: string) => void;
  onRecordPickup?: (pkg: PackageRowData) => void;
  onEditPackage?: (packageId: string) => void;
  onSyncMagaya?: (packageId: string) => void;
  onDeletePackage?: (packageId: string) => void;
  onGenerateInvoice?: (packageId: string) => void;
  onViewHistory?: (packageId: string) => void;
}