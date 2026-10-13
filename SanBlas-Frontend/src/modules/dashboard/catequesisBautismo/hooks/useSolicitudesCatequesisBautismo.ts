import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../../services/apiClient";
import {
  actualizarEstadoCatequesisBautismo,
  listarInscripcionesCatequesisBautismo,
} from "../../../catequesisBautismo/catequesisBautismoService";
import type {
  CertificarCatequesisBautismo,
  InscripcionCatequesisBautismo,
} from "../../../catequesisBautismo/types";

const SOLICITUDES_KEY = ["catequesis-bautismo-solicitudes"] as const;
const HISTORIAL_KEY = ["catequesis-bautismo-historial"] as const;

const mensajeDeError = (error: unknown, respaldo: string) =>
  error instanceof ApiError ? error.message : respaldo;

type CambioEstado = {
  id: number;
  estado: "Aprobada" | "Rechazada";
  extra?: CertificarCatequesisBautismo | { observacionAdministrativa: string };
};

export function useSolicitudesCatequesisBautismo() {
  const queryClient = useQueryClient();

  const solicitudesQuery = useQuery({
    queryKey: SOLICITUDES_KEY,
    queryFn: async () =>
      (await listarInscripcionesCatequesisBautismo("solicitudes")) ?? [],
    refetchOnWindowFocus: false,
  });

  const historialQuery = useQuery({
    queryKey: HISTORIAL_KEY,
    queryFn: async () =>
      (await listarInscripcionesCatequesisBautismo("historial")) ?? [],
    refetchOnWindowFocus: false,
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, estado, extra }: CambioEstado) =>
      actualizarEstadoCatequesisBautismo(id, estado, extra),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SOLICITUDES_KEY });
      void queryClient.invalidateQueries({ queryKey: HISTORIAL_KEY });
    },
  });

  const cambiarEstado = useCallback(
    async (
      id: number,
      estado: "Aprobada" | "Rechazada",
      extra?: CambioEstado["extra"],
    ): Promise<
      | { ok: true; data: InscripcionCatequesisBautismo | undefined }
      | { ok: false; mensaje: string }
    > => {
      try {
        const data = await cambiarEstadoMutation.mutateAsync({ id, estado, extra });
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

  const errorCarga = solicitudesQuery.error ?? historialQuery.error ?? null;

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
