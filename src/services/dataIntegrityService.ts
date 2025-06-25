
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
        
        // Create package-only customers for orphaned packages
        for (const pkg of orphanedPackages) {
          const { error: createError } = await supabase
            .from('customers')
            .insert({
              id: pkg.customer_id,
              customer_type: 'package_only',
              full_name: 'Unknown Customer',
              email: null,
              user_id: null
            });

          if (!createError) {
            fixedCount++;
          }
        }
      }

      // Check for duplicate customer records for same user
      const { data: duplicateCustomers, error: dupError } = await supabase
        .from('customers')
        .select('user_id')
        .not('user_id', 'is', null)
        .group('user_id')
        .having('count(*) > 1');

      if (dupError) throw dupError;

      if (duplicateCustomers && duplicateCustomers.length > 0) {
        issues.push(`Found ${duplicateCustomers.length} users with multiple customer records`);
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
