import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDeleteComunion } from '../../services/Comunion-service';

export const useDeleteComunion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fetchDeleteComunion,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['comunion'] });
    },
  });
};