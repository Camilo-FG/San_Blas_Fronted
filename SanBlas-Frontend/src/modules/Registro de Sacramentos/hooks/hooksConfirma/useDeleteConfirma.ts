import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDeleteConfirma } from '../../services/Confirma-service';

export const useDeleteConfirma = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fetchDeleteConfirma,
    onSuccess: () => {
      // Esto fuerza el refetch inmediato después de eliminar
      queryClient.refetchQueries({ queryKey: ['confirma'] });
    },
  });
};