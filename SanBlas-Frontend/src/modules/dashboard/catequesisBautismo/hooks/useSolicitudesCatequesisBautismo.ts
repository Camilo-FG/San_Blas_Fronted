import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePaginaMatriculas } from '../../../../shared/hooks/usePaginaMatriculas';
import type { FiltrosMatriculas } from '../../../../services/matriculasPaginadas';
import { ApiError } from "../../../../services/apiClient";
import {
  actualizarEstadoCatequesisBautismo,
  eliminarInscripcionCatequesisBautismo,
} from "../../../catequesisBautismo/catequesisBautismoService";
import type {
  CertificarCatequesisBautismo,
  InscripcionCatequesisBautismo,
} from "../../../catequesisBautismo/types";
import { invalidarNotificacionesPanel } from "../../hooks/notificacionesPanelQuery";

const SOLICITUDES_KEY = ["catequesis-bautismo-solicitudes"] as const;
const HISTORIAL_KEY = ["catequesis-bautismo-historial"] as const;

const mensajeDeError = (error: unknown, respaldo: string) =>
  error instanceof ApiError ? error.message : respaldo;

type CambioEstado = {
  id: number;
  estado: "Aprobada" | "Rechazada";
  extra?: CertificarCatequesisBautismo | { observacionAdministrativa: string };
};

export function useSolicitudesCatequesisBautismo(filtros: FiltrosMatriculas) {
  const queryClient = useQueryClient();

  const listado = usePaginaMatriculas<InscripcionCatequesisBautismo>(
    filtros.vista === 'historial' ? HISTORIAL_KEY[0] : SOLICITUDES_KEY[0], '/catequesis-bautismo', filtros);

  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, estado, extra }: CambioEstado) =>
      actualizarEstadoCatequesisBautismo(id, estado, extra),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SOLICITUDES_KEY });
      void queryClient.invalidateQueries({ queryKey: HISTORIAL_KEY });
      invalidarNotificacionesPanel(queryClient);
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

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarInscripcionCatequesisBautismo(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SOLICITUDES_KEY });
      void queryClient.invalidateQueries({ queryKey: HISTORIAL_KEY });
      invalidarNotificacionesPanel(queryClient);
    },
  });

  const eliminar = useCallback(
    async (id: number): Promise<{ ok: true } | { ok: false; mensaje: string }> => {
      try {
        await eliminarMutation.mutateAsync(id);
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          mensaje: mensajeDeError(error, "No se pudo eliminar la solicitud."),
        };
      }
    },
    [eliminarMutation],
  );

  const reintentar = useCallback(() => {
    void listado.refetch();
  }, [listado]);

  const errorCarga = listado.error ?? null;

  return {
    pendientes: filtros.vista === 'solicitudes' ? listado.data?.data ?? [] : [],
    historial: filtros.vista === 'historial' ? listado.data?.data ?? [] : [],
    total: listado.data?.total,
    totales: listado.data?.totales,
    cargando: listado.isPending,
    error: errorCarga
      ? mensajeDeError(errorCarga, "No se pudieron cargar las solicitudes.")
      : "",
    reintentar,
    cambiarEstado,
    guardando: cambiarEstadoMutation.isPending,
    eliminar,
    eliminando: eliminarMutation.isPending,
  };
}
