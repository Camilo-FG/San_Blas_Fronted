import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rechazarSolicitudSacramento } from "../../../services/constancias/constanciasService";
import { invalidarNotificacionesPanel } from "../../dashboard/hooks/notificacionesPanelQuery";

type RechazarSolicitudPayload = {
  id: number | string;
  motivoRechazo: string;
  detalleRechazo?: string;
};

export const useRechazarSolicitudSacramento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motivoRechazo, detalleRechazo }: RechazarSolicitudPayload) => {
      return rechazarSolicitudSacramento(Number(id), motivoRechazo, detalleRechazo);
    },
    onSettled: async () => {
      invalidarNotificacionesPanel(queryClient);
      // Un conflicto con otra sesión debe refrescar el pendiente que ya fue procesado.
      await queryClient.invalidateQueries({ queryKey: ["solicitudes"] });
    },
  });
};
