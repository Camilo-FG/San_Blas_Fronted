import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDeleteConfirma } from "../../services/Confirma-service";



export const useDeleteConfirma = () => {

    const queryConfirma = useQueryClient();

  const DeleteMutation = useMutation({
    mutationKey: ['deleteConfirma', 'confirma'], // una key generica para mutaciones de delete en Confirma
    mutationFn: (id:number) => fetchDeleteConfirma(id),

    onSuccess: () => {
        queryConfirma.invalidateQueries({ queryKey: ['confirma']

        });
    }
  })

    return DeleteMutation
}