import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDeleteMatrimonio } from '../../services/Matrimonio-service';

export const useDeleteMatrimonio = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fetchDeleteMatrimonio,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['matrimonio'] });
    },
  });
};