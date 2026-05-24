import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDeleteMatrimonio } from "../../services/Matrimonio-service";



export const useDeleteMatrimonio = () => {

    const queryMatrimonio = useQueryClient();

  const DeleteMutation = useMutation({
    mutationKey: ['deleteMatrimonio', 'Matrimonio'], // una key generica para mutaciones de delete en Matrimonio
    mutationFn: (id:number) => fetchDeleteMatrimonio(id),

    onSuccess: () => {
        queryMatrimonio.invalidateQueries({ queryKey: ['matrimonio']

        });
    }
  })

    return DeleteMutation
}