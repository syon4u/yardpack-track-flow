
import { useQuery } from '@tanstack/react-query';
import { OptimizedDataService } from '@/services/optimizedDataService';
import { useToast } from '@/hooks/use-toast';

export const useOptimizedStats = () => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['optimized-stats'],
    queryFn: async () => {
      try {
        return await OptimizedDataService.fetchOptimizedStats();
      } catch (error) {
        console.error('Failed to load admin stats:', error);
        toast({
          title: "Error",
          description: "Unable to fetch admin statistics",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
};

export const useOptimizedPackages = (filters = {}, pagination = { page: 1, limit: 50 }) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['optimized-packages', filters, pagination],
    queryFn: async () => {
      try {
        return await OptimizedDataService.fetchPackagesPaginated(filters, pagination);
      } catch (error) {
        console.error('Failed to load packages:', error);
        toast({
          title: "Error",
          description: "Unable to fetch packages data",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 30000,
    retry: 2,
  });
};

export const useOptimizedCustomers = (filters = {}, pagination = { page: 1, limit: 50 }) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['optimized-customers', filters, pagination],
    queryFn: async () => {
      try {
        return await OptimizedDataService.fetchCustomersPaginated(filters, pagination);
      } catch (error) {
        console.error('Failed to load customers:', error);
        toast({
          title: "Error",
          description: "Unable to fetch customers data",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 30000,
    retry: 2,
  });
};
