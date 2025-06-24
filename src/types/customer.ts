
// Customer type definitions
export interface Customer {
  id: string;
  customer_number: string;
  customer_type: 'registered' | 'guest' | 'package_only';
  full_name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  user_id: string | null;
  preferred_contact_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerInsert {
  customer_type: 'registered' | 'guest' | 'package_only';
  full_name: string;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  user_id?: string | null;
  preferred_contact_method?: string | null;
  notes?: string | null;
}

export interface CustomerUpdate {
  customer_type?: 'registered' | 'guest' | 'package_only';
  full_name?: string;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  user_id?: string | null;
  preferred_contact_method?: string | null;
  notes?: string | null;
}

export interface CustomerWithStats extends Customer {
  total_packages: number;
  active_packages: number;
  completed_packages: number;
  total_spent: number;
  outstanding_balance: number;
  last_activity: string | null;
}
