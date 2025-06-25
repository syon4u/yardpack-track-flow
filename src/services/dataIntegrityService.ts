
import { supabase } from '@/integrations/supabase/client';
import { MonitoringService } from './monitoringService';

export class DataIntegrityService {
  // Validate and fix customer-package relationships
  static async validateCustomerPackageRelationships(): Promise<{
    valid: boolean;
    issues: string[];
    fixed: number;
  }> {
    try {
      const issues: string[] = [];
      let fixedCount = 0;

      // Check for packages without valid customers
      const { data: orphanedPackages, error: orphanError } = await supabase
        .from('packages')
        .select(`
          id,
          customer_id,
          customers(id, customer_type, user_id)
        `)
        .is('customers', null);

      if (orphanError) throw orphanError;

      if (orphanedPackages && orphanedPackages.length > 0) {
        issues.push(`Found ${orphanedPackages.length} packages with invalid customer references`);
        
        // Process each orphaned package with proper validation
        for (const pkg of orphanedPackages) {
          if (!pkg.customer_id) {
            console.warn(`Package ${pkg.id} has null customer_id, skipping...`);
            continue;
          }

          try {
            // First check if there's a profile for this customer_id
            const { data: existingProfile, error: profileError } = await supabase
              .from('profiles')
              .select('id, full_name, email, phone_number, address')
              .eq('id', pkg.customer_id)
              .single();

            if (!profileError && existingProfile) {
              // Create a registered customer with profile data
              const { error: createError } = await supabase
                .from('customers')
                .insert({
                  id: pkg.customer_id,
                  user_id: pkg.customer_id,
                  full_name: existingProfile.full_name,
                  email: existingProfile.email,
                  phone_number: existingProfile.phone_number,
                  address: existingProfile.address,
                  customer_type: 'registered'
                });

              if (createError) {
                console.error(`Failed to create registered customer for package ${pkg.id}:`, createError);
              } else {
                fixedCount++;
                console.log(`Created registered customer for package ${pkg.id}`);
              }
            } else {
              // Only create generic placeholder if no profile exists
              const { error: createError } = await supabase
                .from('customers')
                .insert({
                  id: pkg.customer_id,
                  customer_type: 'package_only',
                  full_name: 'Unknown Customer',
                  email: null,
                  user_id: null
                });

              if (createError) {
                console.error(`Failed to create package-only customer for package ${pkg.id}:`, createError);
              } else {
                fixedCount++;
                console.log(`Created package-only customer for package ${pkg.id}`);
              }
            }
          } catch (error) {
            console.error(`Error processing orphaned package ${pkg.id}:`, error);
            // Continue processing other packages rather than failing completely
          }
        }
      }

      // Check for duplicate customer records - using RPC function
      const { data: duplicateCount, error: dupError } = await supabase
        .rpc('check_duplicate_customers');

      if (dupError) {
        console.warn('Could not check for duplicate customers:', dupError);
        // Continue without this check
      } else if (duplicateCount && duplicateCount > 0) {
        issues.push(`Found ${duplicateCount} users with multiple customer records`);
      }

      await MonitoringService.logUserActivity('data_integrity_check', 'system', 'system', {
        issues: issues.length,
        fixed: fixedCount
      });

      return {
        valid: issues.length === 0,
        issues,
        fixed: fixedCount
      };
    } catch (error) {
      await MonitoringService.logError(error as Error, { operation: 'data_integrity_check' });
      throw error;
    }
  }

  // Ensure consistent customer_id mapping across the application
  static async normalizeCustomerReferences(): Promise<void> {
    try {
      // Get all registered users and ensure they have customer records
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone_number, address');

      if (profileError) throw profileError;

      for (const profile of profiles || []) {
        // Check if customer record exists
        const { data: existingCustomer, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (customerError && customerError.code === 'PGRST116') {
          // No customer record exists, create one
          const { error: createError } = await supabase
            .from('customers')
            .insert({
              user_id: profile.id,
              customer_type: 'registered',
              full_name: profile.full_name,
              email: profile.email,
              phone_number: profile.phone_number,
              address: profile.address
            });

          if (createError) {
            console.error('Failed to create customer record for user:', profile.id, createError);
          }
        }
      }

      await MonitoringService.logUserActivity('customer_normalization', 'system', 'system');
    } catch (error) {
      await MonitoringService.logError(error as Error, { operation: 'normalize_customer_references' });
      throw error;
    }
  }

  // Run comprehensive data validation
  static async runFullDataValidation(): Promise<{
    customerPackageRelationships: any;
    overallHealth: 'healthy' | 'warning' | 'critical';
  }> {
    try {
      const customerPackageRelationships = await this.validateCustomerPackageRelationships();
      
      // Determine overall health
      let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (customerPackageRelationships.issues.length > 0) {
        overallHealth = customerPackageRelationships.issues.length > 5 ? 'critical' : 'warning';
      }

      await MonitoringService.logUserActivity('full_data_validation', 'system', 'system', {
        health: overallHealth,
        issues: customerPackageRelationships.issues.length
      });

      return {
        customerPackageRelationships,
        overallHealth
      };
    } catch (error) {
      await MonitoringService.logError(error as Error, { operation: 'full_data_validation' });
      throw error;
    }
  }
}
