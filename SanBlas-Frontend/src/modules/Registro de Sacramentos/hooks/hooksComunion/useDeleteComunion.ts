import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDeleteComunion } from "../../services/Comunion-service";



export const useDeleteComunion = () => {

    const queryComunion = useQueryClient();

  const DeleteMutation = useMutation({
    mutationKey: ['deleteComunion', 'comunion'], // una key generica para mutaciones de delete en Comunion
    mutationFn: (id:number) => fetchDeleteComunion(id),

    onSuccess: () => {
        queryComunion.invalidateQueries({ queryKey: ['comunion']

        });
    }
  })

    return DeleteMutation
}