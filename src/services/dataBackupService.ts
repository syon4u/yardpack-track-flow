
import { supabase } from '@/integrations/supabase/client';
import { MonitoringService } from './monitoringService';

export interface BackupOptions {
  includeCustomers?: boolean;
  includePackages?: boolean;
  includeInvoices?: boolean;
  includeProfiles?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  format?: 'json' | 'csv';
}

export interface BackupResult {
  success: boolean;
  filename?: string;
  recordCount?: number;
  error?: string;
  downloadUrl?: string;
}

export class DataBackupService {
  static async exportUserData(userId: string, options: BackupOptions = {}): Promise<BackupResult> {
    try {
      await MonitoringService.logUserActivity('data_export_initiated', 'user_data', userId);

      const {
        includeCustomers = true,
        includePackages = true,
        includeInvoices = true,
        includeProfiles = true,
        format = 'json'
      } = options;

      const exportData: Record<string, any> = {
        exportInfo: {
          userId,
          timestamp: new Date().toISOString(),
          format,
          options
        }
      };

      let totalRecords = 0;

      // Export user profile
      if (includeProfiles) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profile) {
          exportData.profile = profile;
          totalRecords += 1;
        }
      }

      // Export customer data (if user has associated customer records)
      if (includeCustomers) {
        const { data: customers } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', userId);
        
        if (customers && customers.length > 0) {
          exportData.customers = customers;
          totalRecords += customers.length;
        }
      }

      // Export packages
      if (includePackages) {
        let packagesQuery = supabase
          .from('packages')
          .select(`
            *,
            customers!fk_packages_customer_id(*)
          `);

        // Filter by user's customer records
        const { data: userCustomers } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', userId);

        if (userCustomers && userCustomers.length > 0) {
          const customerIds = userCustomers.map(c => c.id);
          packagesQuery = packagesQuery.in('customer_id', customerIds);

          // Apply date range filter if specified
          if (options.dateRange) {
            packagesQuery = packagesQuery
              .gte('created_at', options.dateRange.start.toISOString())
              .lte('created_at', options.dateRange.end.toISOString());
          }

          const { data: packages } = await packagesQuery;
          
          if (packages && packages.length > 0) {
            exportData.packages = packages;
            totalRecords += packages.length;
          }
        }
      }

      // Export invoices (if user has packages)
      if (includeInvoices && exportData.packages) {
        const packageIds = exportData.packages.map((p: any) => p.id);
        
        if (packageIds.length > 0) {
          const { data: invoices } = await supabase
            .from('invoices')
            .select('*')
            .in('package_id', packageIds);
          
          if (invoices && invoices.length > 0) {
            exportData.invoices = invoices;
            totalRecords += invoices.length;
          }
        }
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `user_data_export_${userId.substring(0, 8)}_${timestamp}.${format}`;

      // Convert to requested format
      let fileContent: string;
      let mimeType: string;

      if (format === 'csv') {
        fileContent = this.convertToCSV(exportData);
        mimeType = 'text/csv';
      } else {
        fileContent = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
      }

      // Create download
      const blob = new Blob([fileContent], { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);

      await MonitoringService.logUserActivity('data_export_completed', 'user_data', userId, {
        recordCount: totalRecords,
        format,
        filename
      });

      return {
        success: true,
        filename,
        recordCount: totalRecords,
        downloadUrl
      };

    } catch (error) {
      await MonitoringService.logError(error as Error, {
        operation: 'data_export',
        userId,
        options
      }, 'high');

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async createSystemBackup(): Promise<BackupResult> {
    try {
      await MonitoringService.logUserActivity('system_backup_initiated', 'system', 'all');

      // This would typically be handled by database-level backups
      // For now, we'll create a comprehensive export of key tables
      const exportData: Record<string, any> = {
        backupInfo: {
          timestamp: new Date().toISOString(),
          type: 'system_backup',
          version: '1.0'
        }
      };

      // Export customers (admin only operation)
      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Limit for performance

      if (customers) {
        exportData.customers = customers;
      }

      // Export packages
      const { data: packages } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (packages) {
        exportData.packages = packages;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `system_backup_${timestamp}.json`;
      
      const fileContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([fileContent], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);

      const totalRecords = (customers?.length || 0) + (packages?.length || 0);

      await MonitoringService.logUserActivity('system_backup_completed', 'system', 'all', {
        recordCount: totalRecords,
        filename
      });

      return {
        success: true,
        filename,
        recordCount: totalRecords,
        downloadUrl
      };

    } catch (error) {
      await MonitoringService.logError(error as Error, {
        operation: 'system_backup'
      }, 'critical');

      return {
        success: false,
        error: error instanceof Error ? error.message : 'System backup failed'
      };
    }
  }

  private static convertToCSV(data: Record<string, any>): string {
    // Simple CSV conversion for flat data structures
    const lines: string[] = [];
    
    Object.entries(data).forEach(([tableName, records]) => {
      if (Array.isArray(records) && records.length > 0) {
        lines.push(`\n--- ${tableName.toUpperCase()} ---`);
        
        const headers = Object.keys(records[0]);
        lines.push(headers.join(','));
        
        records.forEach(record => {
          const values = headers.map(header => {
            const value = record[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            if (typeof value === 'string' && value.includes(',')) return `"${value.replace(/"/g, '""')}"`;
            return String(value);
          });
          lines.push(values.join(','));
        });
      }
    });
    
    return lines.join('\n');
  }

  static async scheduleAutomaticBackup(): Promise<void> {
    // In a production environment, this would set up automated backups
    // For now, we'll just log the intention
    await MonitoringService.logUserActivity('automatic_backup_scheduled', 'system', 'scheduler');
    console.log('Automatic backup scheduling would be configured here');
  }

  static async validateDataIntegrity(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check for orphaned records
      const { data: packagesWithoutCustomers } = await supabase
        .from('packages')
        .select('id, customer_id')
        .is('customers.id', null);

      if (packagesWithoutCustomers && packagesWithoutCustomers.length > 0) {
        issues.push(`Found ${packagesWithoutCustomers.length} packages without valid customers`);
      }

      // Check for invalid foreign key references
      const { data: invoicesWithoutPackages } = await supabase
        .from('invoices')
        .select('id, package_id')
        .is('packages.id', null);

      if (invoicesWithoutPackages && invoicesWithoutPackages.length > 0) {
        issues.push(`Found ${invoicesWithoutPackages.length} invoices without valid packages`);
      }

      await MonitoringService.logUserActivity('data_integrity_check', 'system', 'validation', {
        issuesFound: issues.length,
        issues
      });

      return {
        valid: issues.length === 0,
        issues
      };

    } catch (error) {
      await MonitoringService.logError(error as Error, {
        operation: 'data_integrity_check'
      }, 'high');

      return {
        valid: false,
        issues: ['Failed to perform integrity check']
      };
    }
  }
}
