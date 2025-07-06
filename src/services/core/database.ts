import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type PackageStatus = Database['public']['Enums']['package_status'];
export type CustomerType = Database['public']['Enums']['customer_type'];

export interface QueryOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  statusFilter?: string;
  customerId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Core database service providing consistent query patterns and utilities
 */
export class DatabaseService {
  /**
   * Execute a paginated query with consistent error handling
   */
  static async executePaginatedQuery<T>(
    queryBuilder: any,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    try {
      // Execute query with pagination
      const { data, error, count } = await queryBuilder
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Apply common search filters to a query
   */
  static applySearchFilter(
    query: any,
    searchTerm: string | undefined,
    searchFields: string[]
  ) {
    if (!searchTerm?.trim()) return query;
    
    const searchPattern = `%${searchTerm.toLowerCase()}%`;
    const searchConditions = searchFields.map(field => 
      `${field}.ilike.${searchPattern}`
    ).join(',');
    
    return query.or(searchConditions);
  }

  /**
   * Apply status filter with validation
   */
  static applyStatusFilter(
    query: any,
    statusFilter: string | undefined,
    validStatuses: string[]
  ) {
    if (!statusFilter || statusFilter === 'all') return query;
    
    if (validStatuses.includes(statusFilter)) {
      return query.eq('status', statusFilter);
    }
    
    return query;
  }

  /**
   * Performance monitoring wrapper
   */
  static async measurePerformance<T>(
    operation: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      if (duration > 1000) {
        console.warn(`Slow query detected: ${operation} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`Query failed: ${operation} after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  /**
   * Setup real-time subscription with consistent patterns
   */
  static subscribeToChanges(
    table: string,
    callback: (payload: any) => void,
    filters?: Record<string, string>
  ) {
    let channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filters ? Object.entries(filters)
            .map(([key, value]) => `${key}=eq.${value}`)
            .join(',') : undefined
        },
        callback
      );

    return channel.subscribe();
  }
}