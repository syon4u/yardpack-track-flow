
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPackages } from '@/services/packageService';
import { UsePackagesOptions } from '@/types/package';

export const usePackagesQuery = (options: UsePackagesOptions = {}) => {
  const { user, profile } = useAuth();
  const { searchTerm, statusFilter } = options;
  
  return useQuery({
    queryKey: ['packages', user?.id, profile?.role, searchTerm, statusFilter],
    queryFn: async () => {
      if (!user) return [];
      return fetchPackages(user.id, profile?.role, options);
    },
    enabled: !!user,
  });
};
