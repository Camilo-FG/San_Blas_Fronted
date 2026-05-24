import { useMutation } from "@tanstack/react-query"
import { fetchUpdateComunion } from "../../services/Comunion-service"


  export const usePutComunion = (ComunionId:number) => {

    const UpdateMutation = useMutation({
        mutationFn: fetchUpdateComunion,
        mutationKey: ['comunion', ComunionId]
    })

 return UpdateMutation
}