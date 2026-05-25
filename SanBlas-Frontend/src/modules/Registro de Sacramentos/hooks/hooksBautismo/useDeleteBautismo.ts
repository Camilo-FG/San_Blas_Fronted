import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDeleteBautismo } from "../../services/Bautismo-service";

export const useDeleteBautismo = () => {

    const queryBautismo = useQueryClient();

  const DeleteMutation = useMutation({
    mutationKey: ['deleteBautismo', 'bautismo'], // una key generica para mutaciones de delete en Bautismo
    mutationFn: (id:number) => fetchDeleteBautismo(id),

    onSuccess: () => {
        queryBautismo.invalidateQueries({ queryKey: ['bautismo']

        });
    }
  })

    return DeleteMutation
}