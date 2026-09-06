import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarEstadoSacramento } from "../../../services/constancias/constanciasService";
import type { EstadoSolicitudBackend } from "../../../services/constancias/constanciasApiTypes";

type UpdateEstadoPayload = {
  id: number | string;
  nuevoEstado: EstadoSolicitudBackend;
};

export const useUpdateSolicitudEstado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, nuevoEstado }: UpdateEstadoPayload) => {
      return actualizarEstadoSacramento(Number(id), nuevoEstado);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] });
    },
  });
};
