
import { Database } from '@/integrations/supabase/types';

// Unified Customer interface that handles both registered and package-only customers
export interface UnifiedCustomer {
  id: string;
  type: 'registered' | 'package_only';
  full_name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  created_at: string;
  
  // Package statistics
  total_packages: number;
  active_packages: number;
  completed_packages: number;
  
  // Financial information
  total_spent: number;
  outstanding_balance: number;
  
  // Activity tracking
  last_activity: string | null;
  registration_status: 'registered' | 'guest' | 'package_only';
}

// Unified Package interface that works across all components
export interface UnifiedPackage {
  id: string;
  tracking_number: string;
  external_tracking_number: string | null;
  description: string;
  status: Database['public']['Enums']['package_status'];
  
  // Dates
  created_at: string;
  updated_at: string;
  date_received: string;
  estimated_delivery: string | null;
  delivery_estimate: string | null;
  actual_delivery: string | null;
  
  // Customer information
  customer_id: string;
  customer_name: string;
  customer_email: string | null;
  
  // Package details
  sender_name: string | null;
  sender_address: string | null;
  delivery_address: string;
  carrier: string | null;
  weight: number | null;
  dimensions: string | null;
  package_value: number | null;
  
  // Financial
  duty_amount: number | null;
  duty_rate: number | null;
  total_due: number | null;
  
  // Magaya integration fields
  magaya_shipment_id: string | null;
  magaya_reference_number: string | null;
  warehouse_location: string | null;
  consolidation_status: string | null;
  
  // Tracking and invoices
  invoices: Database['public']['Tables']['invoices']['Row'][];
  tracking_events?: Array<{
    id: string;
    event_type: string;
    event_description: string;
    event_location: string | null;
    event_timestamp: string;
  }>;
  
  // Computed properties
  invoice_uploaded: boolean;
  duty_assessed: boolean;
  
  // Additional metadata
  notes: string | null;
  api_sync_status: string | null;
  last_api_sync: string | null;
  
  // Full compatibility properties for existing components
  profiles?: {
    full_name: string;
    email: string;
    address: string | null;
    created_at: string;
    id: string;
    phone_number: string | null;
    role: Database['public']['Enums']['app_role'];
    updated_at: string;
  } | null;
}

// Unified filter interface for consistent filtering across components
export interface UnifiedFilters {
  searchTerm: string;
  statusFilter: string;
  customerTypeFilter?: string;
  activityFilter?: string;
  dateRange?: {
    start: string | null;
    end: string | null;
  };
}

// Status display configuration
export interface StatusConfig {
  value: Database['public']['Enums']['package_status'];
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

// Unified stats interface
export interface UnifiedStats {
  packages: {
    total: number;
    received: number;
    in_transit: number;
    arrived: number;
    ready_for_pickup: number;
    picked_up: number;
  };
  customers: {
    total: number;
    registered: number;
    package_only: number;
    active: number;
  };
  financial: {
    total_value: number;
    total_due: number;
    pending_invoices: number;
  };
}
