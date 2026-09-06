import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { aprobarSolicitudSacramento } from "../../../services/constancias/constanciasService";
import { MENSAJES_APROBACION } from "../../../services/constancias/aprobacionErrors";
import { ApiError } from "../../../services/apiClient";

type AprobarPayload = {
  id: number | string;
};

export const useAprobarSolicitud = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: AprobarPayload) => {
      // Detectar falta de conexión ANTES de intentar la llamada al backend
      if (!navigator.onLine) {
        throw new Error(MENSAJES_APROBACION.sinConexion);
      }

      try {
        return await aprobarSolicitudSacramento(Number(id));
      } catch (error) {
        // Falla de red: sin conexión a Internet o servidor inalcanzable
        const esFallaDeRed =
          (axios.isAxiosError(error) && !error.response) ||
          (error as { code?: string } | null | undefined)?.code ===
            "ERR_NETWORK" ||
          (error instanceof ApiError && error.status === 0);

        if (esFallaDeRed) {
          throw new Error(MENSAJES_APROBACION.sinConexion);
        }

        // try-catch: captura todos los tipos de error posibles y los normaliza
        // a uno de los mensajes definidos en MENSAJES_APROBACION
        if (
          error instanceof Error &&
          Object.values(MENSAJES_APROBACION).includes(
            error.message as (typeof MENSAJES_APROBACION)[keyof typeof MENSAJES_APROBACION],
          )
        ) {
          throw error;
        }
        throw new Error(MENSAJES_APROBACION.servidor);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] });
    },
  });
};
