
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { PostgrestError } from '@supabase/supabase-js';

interface AuthenticatedQueryOptions<T> extends Omit<UseQueryOptions<T, PostgrestError>, 'queryKey' | 'queryFn'> {
  queryKey: unknown[];
  queryFn: () => Promise<T>;
  requireAuth?: boolean;
}

export const useAuthenticatedQuery = <T>({
  queryKey,
  queryFn,
  requireAuth = true,
  ...options
}: AuthenticatedQueryOptions<T>) => {
  const { user, session, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: [...queryKey, user?.id],
    queryFn: async () => {
      if (requireAuth && !user) {
        throw new Error('Authentication required');
      }
      
      if (requireAuth && !session?.access_token) {
        throw new Error('Valid session required');
      }
      
      return queryFn();
    },
    enabled: requireAuth ? !!user && !!session && !authLoading : !authLoading,
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error.message?.includes('auth') || error.message?.includes('JWT')) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
};
