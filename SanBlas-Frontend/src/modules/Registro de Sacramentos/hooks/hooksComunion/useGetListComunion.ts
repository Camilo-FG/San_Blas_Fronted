import { useQuery } from "@tanstack/react-query";
import { fetchGetComunion } from "../../services/Comunion-service";

export const useGetListComunion = () => {
    const {error, isPending, data} = useQuery({
        queryKey: ['comunion'],
        queryFn: fetchGetComunion,
    });

    return {error, isPending, data};
}

