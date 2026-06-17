import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDeleteBautismo } from '../../services/Bautismo-service';

export const useDeleteBautismo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fetchDeleteBautismo,
    onSuccess: () => {
      // Esto fuerza el refetch inmediato después de eliminar
      queryClient.refetchQueries({ queryKey: ['bautismo'] });
    },
  });
};