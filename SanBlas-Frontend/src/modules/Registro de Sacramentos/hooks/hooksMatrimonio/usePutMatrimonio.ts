import { useMutation } from "@tanstack/react-query"
import { fetchUpdateMatrimonio } from "../../services/Matrimonio-service"


  export const usePutMatrimonio = (MatrimonioId:number) => {

    const UpdateMutation = useMutation({
        mutationFn: fetchUpdateMatrimonio,
        mutationKey: ['matrimonio', MatrimonioId]
    })

 return UpdateMutation
}