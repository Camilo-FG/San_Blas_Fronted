import { useMutation } from "@tanstack/react-query"
import { fetchUpdateConfirma } from "../../services/Confirma-service"


  export const usePutConfirma = (ConfirmaId:number) => {

    const UpdateMutation = useMutation({
        mutationFn: fetchUpdateConfirma,
        mutationKey: ['confirma', ConfirmaId]
    })

 return UpdateMutation
}