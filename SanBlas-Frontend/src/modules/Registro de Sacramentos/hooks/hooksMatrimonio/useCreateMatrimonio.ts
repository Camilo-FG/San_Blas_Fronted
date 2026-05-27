// hooks/useCreateBautismo.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCreateMatrimonio } from "../../services/Matrimonio-service";

export const useCreateMatrimonio = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: fetchCreateMatrimonio,
        mutationKey: ['createMatrimonio'],
        
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matrimonio'] });
        }
    });

    return createMutation;
};