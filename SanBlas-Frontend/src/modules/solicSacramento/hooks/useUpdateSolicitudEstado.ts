import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarEstadoSacramento } from "../../../services/constancias/constanciasService";
import type { EstadoConstancia } from "../../../services/constancias/constanciasApiTypes";

type UpdateEstadoPayload = {
  id: number | string;
  Estado: EstadoConstancia;
};

export const useUpdateSolicitudEstado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, Estado }: UpdateEstadoPayload) => {
      return actualizarEstadoSacramento(Number(id), Estado);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] });
    },
  });
};
