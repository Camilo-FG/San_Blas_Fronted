import { useMutation } from "@tanstack/react-query"
import { fetchUpdateBautismo } from "../../services/Bautismo-service"


  export const usePutBautismo = (BautismoId:number) => {

    const UpdateMutation = useMutation({
        mutationFn: fetchUpdateBautismo,
        mutationKey: ['bautismo', BautismoId]
    })

 return UpdateMutation
}