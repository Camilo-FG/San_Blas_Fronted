
import { useQuery } from "@tanstack/react-query";
import { fetchGetMatrimonio } from "../../services/Matrimonio-service";

export const useGetListMatrimonio = () => {
    const { error, isPending, data, refetch } = useQuery({
        queryKey: ['matrimonio'],
        queryFn: fetchGetMatrimonio,
    });

    return { error, isPending, data, refetch };
};