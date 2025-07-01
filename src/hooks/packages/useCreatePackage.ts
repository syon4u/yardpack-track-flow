
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPackage } from '@/services/packageService';
import { CreatePackageData } from '@/types/package';

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packageData: CreatePackageData) => {
      return createPackage(packageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};
