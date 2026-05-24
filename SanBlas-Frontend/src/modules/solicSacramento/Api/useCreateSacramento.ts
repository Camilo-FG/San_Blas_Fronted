import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateSolicSacramento } from "./solicSacramentos-service";
import { FormSacramento } from "src/types/formSacramento";


export const useCreateSolicSacramento = () => {
  const queryClient = useQueryClient(); // 👈 Para invalidar el cache

  const createMutation = useMutation({
    mutationFn: (data: FormSacramento) => CreateSolicSacramento(data), // 👈 Tipado

    // 👇 Esto faltaba — refresca la lista tras éxito
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicSacramento'] });
    },

    // 👇 Manejo de error
    onError: (error) => {
      console.error('Error al crear solicitud:', error);
    },
  });

  return createMutation;
};