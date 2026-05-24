import { fetchCreateConfirma } from "../../services/Confirma-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateConfirma = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: fetchCreateConfirma,
        mutationKey: ['createConfirma'],
        
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['confirma'] });
        }
    });

    return createMutation;
};