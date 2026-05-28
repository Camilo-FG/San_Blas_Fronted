
import { fetchCreateBautismo } from "../../services/Bautismo-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateBautismo = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: fetchCreateBautismo,
        mutationKey: ['createBautismo'],
        
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bautismo'] });
        }
    });

    return createMutation;
};