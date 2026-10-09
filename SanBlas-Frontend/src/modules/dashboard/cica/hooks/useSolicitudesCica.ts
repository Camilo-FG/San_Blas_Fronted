import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../../services/apiClient";
import {
  actualizarEstadoCica,
  listarInscripcionesCica,
} from "../../../cica/cicaService";
import type { InscripcionCica } from "../../../cica/types";

const SOLICITUDES_KEY = ["cica-solicitudes"] as const;
const HISTORIAL_KEY = ["cica-historial"] as const;

const mensajeDeError = (error: unknown, respaldo: string) =>
  error instanceof ApiError ? error.message : respaldo;

export function useSolicitudesCica() {
  const queryClient = useQueryClient();

  const solicitudesQuery = useQuery({
    queryKey: SOLICITUDES_KEY,
    queryFn: async () => (await listarInscripcionesCica("solicitudes")) ?? [],
    refetchOnWindowFocus: false,
  });

  const historialQuery = useQuery({
    queryKey: HISTORIAL_KEY,
    queryFn: async () => (await listarInscripcionesCica("historial")) ?? [],
    refetchOnWindowFocus: false,
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: ({
      id,
      estado,
      observacionAdministrativa,
    }: {
      id: number;
      estado: "Aprobada" | "Rechazada";
      observacionAdministrativa?: string;
    }) => actualizarEstadoCica(id, estado, observacionAdministrativa),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SOLICITUDES_KEY });
      void queryClient.invalidateQueries({ queryKey: HISTORIAL_KEY });
    },
  });

  const cambiarEstado = useCallback(
    async (
      id: number,
      estado: "Aprobada" | "Rechazada",
      observacionAdministrativa?: string,
    ): Promise<{ ok: true; data: InscripcionCica | undefined } | { ok: false; mensaje: string }> => {
      try {
        const data = await cambiarEstadoMutation.mutateAsync({
          id,
          estado,
          observacionAdministrativa,
        });
        return { ok: true, data };
      } catch (error) {
        return {
          ok: false,
          mensaje: mensajeDeError(error, "No se pudo actualizar la solicitud."),
        };
      }
    },
    [cambiarEstadoMutation],
  );

  const reintentar = useCallback(() => {
    void solicitudesQuery.refetch();
    void historialQuery.refetch();
  }, [historialQuery, solicitudesQuery]);

  const errorCarga =
    solicitudesQuery.error ?? historialQuery.error ?? null;

  return {
    pendientes: solicitudesQuery.data ?? [],
    historial: historialQuery.data ?? [],
    cargando: solicitudesQuery.isPending || historialQuery.isPending,
    error: errorCarga
      ? mensajeDeError(errorCarga, "No se pudieron cargar las solicitudes.")
      : "",
    reintentar,
    cambiarEstado,
    guardando: cambiarEstadoMutation.isPending,
  };
}
