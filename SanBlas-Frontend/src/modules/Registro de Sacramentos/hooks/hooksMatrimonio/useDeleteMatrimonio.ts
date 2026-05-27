import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDeleteMatrimonio } from '../../services/Matrimonio-service';

export const useDeleteMatrimonio = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fetchDeleteMatrimonio,
    onSuccess: () => {
      // Esto fuerza el refetch inmediato después de eliminar
      queryClient.refetchQueries({ queryKey: ['matrimonio'] });
    },
  });
};