import { useQuery } from "@tanstack/react-query";
import { fetchGetConfirma } from "../../services/Confirma-service";

export const useGetListConfirma = () => {
    const {error, isPending, data} = useQuery({
        queryKey: ['confirma'],
        queryFn: fetchGetConfirma,
    });

    return {error, isPending, data};
}

