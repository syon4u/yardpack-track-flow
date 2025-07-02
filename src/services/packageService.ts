
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { TransformedPackage, UsePackagesOptions } from '@/types/package';

type PackageStatus = Database['public']['Enums']['package_status'];

export const fetchPackages = async (
  userId: string,
  userRole: string | undefined,
  options: UsePackagesOptions = {}
): Promise<TransformedPackage[]> => {
  const { searchTerm, statusFilter } = options;
  
  console.log('Fetching packages for user:', userId, 'with role:', userRole);
  
  // Use customers table instead of profiles for package relationships
  let query = supabase
    .from('packages')
    .select(`
      *,
      customers(*),
      invoices!invoices_package_id_fkey(*)
    `)
    .order('created_at', { ascending: false });

  // If customer, only show packages for customers linked to their user account
  if (userRole === 'customer') {
    // First get the customer record for this user
    const { data: customerRecord } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (customerRecord) {
      query = query.eq('customer_id', customerRecord.id);
    } else {
      // No customer record found, return empty array
      return [];
    }
  }

  // Apply search filter
  if (searchTerm && searchTerm.trim()) {
    query = query.or(`tracking_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,external_tracking_number.ilike.%${searchTerm}%`);
  }

  // Apply status filter with the correct enum values
  if (statusFilter && statusFilter !== 'all') {
    const validStatuses: PackageStatus[] = [
      'received', 'in_transit', 'arrived', 'ready_for_pickup', 'picked_up'
    ];
    
    if (validStatuses.includes(statusFilter as PackageStatus)) {
      query = query.eq('status', statusFilter as PackageStatus);
    }
  }

  const { data, error } = await query;
  
  if (error) throw error;
  
  console.log('Fetched packages:', data);
  
  // Transform data to include computed properties that PackageList expects
  const transformedData: TransformedPackage[] = (data || []).map(pkg => {
    const customer = pkg.customers;
    
    // Ensure customer data is always available with fallbacks
    const customer_name = customer?.full_name || 'Unknown Customer';
    const customer_email = customer?.email || null;
    
    console.log(`Package ${pkg.tracking_number}: customer_name=${customer_name}, customer_email=${customer_email}`);
    
    return {
      ...pkg,
      customer_name,
      customer_email,
      invoices: pkg.invoices || [],
      invoice_uploaded: pkg.invoices && pkg.invoices.length > 0,
      duty_assessed: pkg.duty_amount !== null,
    };
  });
  
  return transformedData;
};

export const updatePackageStatus = async (packageId: string, status: PackageStatus) => {
  console.log('Updating package status:', packageId, status);
  
  const { error } = await supabase
    .from('packages')
    .update({ status })
    .eq('id', packageId);
  
  if (error) throw error;
};

export const createPackage = async (packageData: {
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
}) => {
  console.log('Creating new package:', packageData);
  
  const { data, error } = await supabase
    .from('packages')
    .insert([packageData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
