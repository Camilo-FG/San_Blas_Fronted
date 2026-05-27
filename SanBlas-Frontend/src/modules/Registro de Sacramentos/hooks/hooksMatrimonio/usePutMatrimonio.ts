
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUpdateMatrimonio } from "../../services/Matrimonio-service";

export const usePutMatrimonio = () => {
  const queryClient = useQueryClient();

  const UpdateMutation = useMutation({
    mutationFn: fetchUpdateMatrimonio,
    mutationKey: ['matrimonio', 'update'],
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matrimonio'] });
    }
  });

  return UpdateMutation;
}