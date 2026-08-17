import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rechazarSolicitudSacramento } from "../../../services/constancias/constanciasService";

type RechazarSolicitudPayload = {
  id: number | string;
  motivoRechazo: string;
};

export const useRechazarSolicitudSacramento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motivoRechazo }: RechazarSolicitudPayload) => {
      return rechazarSolicitudSacramento(Number(id), motivoRechazo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] });
    },
  });
};