import { fetchCreateComunion } from "../../services/Comunion-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateComunion = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: fetchCreateComunion,
        mutationKey: ['createComunion'],
        
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comunion'] });
        }
    });

    return createMutation;
};