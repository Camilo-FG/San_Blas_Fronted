import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarEstadoSacramento } from "../../../services/constancias/constanciasService";
import type { EstadoSolicitudBackend } from "../../../services/constancias/constanciasApiTypes";
import { invalidarNotificacionesPanel } from "../../dashboard/hooks/notificacionesPanelQuery";

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
      void queryClient.invalidateQueries({ queryKey: ["solicitudes"] });
      invalidarNotificacionesPanel(queryClient);
    },
  });
};
