
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { PostgrestError } from '@supabase/supabase-js';

interface AuthenticatedQueryOptions<T> extends Omit<UseQueryOptions<T, PostgrestError>, 'queryKey' | 'queryFn'> {
  queryKey: unknown[];
  queryFn: () => Promise<T>;
  requireAuth?: boolean;
}

export const useAuthenticatedQuery = <T>({
  queryKey,
  queryFn,
  requireAuth = false, // Disabled by default
  ...options
}: AuthenticatedQueryOptions<T>) => {
  return useQuery({
    queryKey: [...queryKey],
    queryFn: async () => {
      // Remove all authentication checks
      return queryFn();
    },
    enabled: true, // Always enabled, no auth checks
    retry: (failureCount, error) => {
      // Don't retry on any specific errors
      return failureCount < 2;
    },
    ...options,
  });
};
