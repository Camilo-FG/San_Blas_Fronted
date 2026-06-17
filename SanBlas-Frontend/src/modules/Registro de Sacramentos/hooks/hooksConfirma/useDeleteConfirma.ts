import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDeleteConfirma } from '../../services/Confirma-service';

export const useDeleteConfirma = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fetchDeleteConfirma,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['confirma'] });
    },
  });
};