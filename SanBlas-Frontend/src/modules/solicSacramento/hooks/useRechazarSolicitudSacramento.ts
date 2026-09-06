import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rechazarSolicitudSacramento } from "../../../services/constancias/constanciasService";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] });
    },
  });
};