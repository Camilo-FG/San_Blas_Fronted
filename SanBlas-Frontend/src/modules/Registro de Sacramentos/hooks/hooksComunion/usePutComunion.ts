
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUpdateComunion } from "../../services/Comunion-service";

export const usePutComunion = () => {
  const queryClient = useQueryClient();

  const UpdateMutation = useMutation({
    mutationFn: fetchUpdateComunion,
    mutationKey: ['comunion', 'update'],
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comunion'] });
    }
  });

  return UpdateMutation;
}