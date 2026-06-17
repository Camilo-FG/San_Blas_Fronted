
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUpdateBautismo } from "../../services/Bautismo-service";

export const usePutBautismo = () => {
  const queryClient = useQueryClient();

  const UpdateMutation = useMutation({
    mutationFn: fetchUpdateBautismo,
    mutationKey: ['bautismo', 'update'],
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bautismo'] });
    }
  });

  return UpdateMutation;
}