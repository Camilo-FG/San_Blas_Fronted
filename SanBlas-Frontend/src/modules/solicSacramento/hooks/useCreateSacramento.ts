import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormSacramento } from "../../../types/formSacramento";
import { crearSolicitudSacramento } from "../../../services/constancias/constanciasService";

export const useCreateSolicSacramento = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: FormSacramento & { archivoImagen?: File | null }) =>
      crearSolicitudSacramento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] });
    },
    onError: (error) => {
      console.error("Error al crear solicitud:", error);
    },
  });

  return createMutation;
};
