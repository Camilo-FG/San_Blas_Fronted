
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUpdateConfirma } from "../../services/Confirma-service";

export const usePutConfirma = () => {
  const queryClient = useQueryClient();

  const UpdateMutation = useMutation({
    mutationFn: fetchUpdateConfirma,
    mutationKey: ['confirma', 'update'],
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirma'] });
    }
  });

  return UpdateMutation;
}