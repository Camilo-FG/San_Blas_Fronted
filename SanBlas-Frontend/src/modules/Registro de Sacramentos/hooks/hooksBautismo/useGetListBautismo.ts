import { useQuery } from "@tanstack/react-query";
import { fetchGetBautismo } from "../../services/Bautismo-service";

export const useGetListBautismo = () => {
    const {error, isPending, data} = useQuery({
        queryKey: ['bautismo'],
        queryFn: fetchGetBautismo,
    });

    return {error, isPending, data};
}

