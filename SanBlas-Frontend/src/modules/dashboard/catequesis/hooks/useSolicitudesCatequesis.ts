import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarEstadoSolicitud,
  exportarInscripcionesCatequesis,
  obtenerSolicitudCatequesisPorId,
  obtenerSolicitudesCatequesis,
} from "../services/catequesisService";
import { ApiError } from "../../../../services/apiClient";

// Filtros que el backend soporta en GET /inscripciones-catequesis
export interface SolicitudesCatequesisFiltros {
  estado?: string;
  nombre?: string;
  encargado?: string;
  q?: string;
}

// Clave raíz para invalidar la lista cuando muta algún estado
const QUERY_KEY = ["catequesis-solicitudes"] as const;

type CambiarEstadoVariables = {
  id: number;
  estado: "aprobado" | "rechazado";
  observacion?: string;
};

export const useSolicitudesCatequesis = (
  filtros?: SolicitudesCatequesisFiltros,
) => {
  const queryClient = useQueryClient();

  const [detalleError, setDetalleError] = useState("");
  const [accionError, setAccionError] = useState("");
  const [exportando, setExportando] = useState(false);
  const [exportError, setExportError] = useState("");

  // La lista se sirve con React Query: con placeholderData mantenemos los datos
  // previos mientras llega la respuesta de un nuevo filtro (evita parpadeos)
  const {
    data: solicitudes = [],
    isPending,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["catequesis-solicitudes", filtros],
    queryFn: () => obtenerSolicitudesCatequesis(filtros),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });

  const cargando = isPending;
  const filtrando = isFetching && !isPending;

  // Errores de carga se normalizan a un string para el consumidor (como antes)
  let error = "";
  if (queryError instanceof ApiError) {
    error = queryError.message;
  } else if (queryError) {
    error = "No se pudieron cargar las solicitudes de catequesis.";
  }

  // Aprobar/rechazar es una mutación React Query; al éxito se invalida la lista
  // para que vuelva a cargarla sin recargar la página
  const cambiarEstadoMutation = useMutation({
    mutationFn: ({
      id,
      estado,
      observacion,
    }: CambiarEstadoVariables) =>
      actualizarEstadoSolicitud(id, estado, observacion),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: unknown) => {
      setAccionError(
        error instanceof ApiError
          ? error.message
          : "No se pudo actualizar el estado de la solicitud.",
      );
    },
  });

  const guardando = cambiarEstadoMutation.isPending;

  // Se conserva la firma original para no romper al consumidor: devuelve ok/mensaje
  const cambiarEstado = useCallback(
    async (
      id: number,
      estado: "aprobado" | "rechazado",
      observacion?: string,
    ): Promise<{ ok: true } | { ok: false; mensaje: string }> => {
      setAccionError("");
      try {
        await cambiarEstadoMutation.mutateAsync({
          id,
          estado,
          observacion,
        });
        return { ok: true };
      } catch (error) {
        const mensaje =
          error instanceof ApiError
            ? error.message
            : "No se pudo actualizar el estado de la solicitud.";
        return { ok: false, mensaje };
      }
    },
    [cambiarEstadoMutation],
  );

  const obtenerDetalle = useCallback(async (id: number) => {
    try {
      setDetalleError("");
      return await obtenerSolicitudCatequesisPorId(id);
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError) {
        setDetalleError(error.message);
      } else {
        setDetalleError("No se pudo cargar el detalle de la solicitud.");
      }
      return null;
    }
  }, []);

  const exportarExcel = useCallback(async () => {
    try {
      setExportando(true);
      setExportError("");
      await exportarInscripcionesCatequesis("Aprobada");
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError) {
        setExportError(
          error.status === 404
            ? "La exportación no está disponible. Reinicie el backend para cargar los cambios recientes."
            : error.message,
        );
      } else {
        setExportError("No se pudo exportar el archivo de Excel.");
      }
    } finally {
      setExportando(false);
    }
  }, []);

  return {
    solicitudes,
    cargarSolicitudes: () => refetch(),
    obtenerDetalle,
    cambiarEstado,
    exportarExcel,
    cargando,
    filtrando,
    guardando,
    exportando,
    error,
    detalleError,
    accionError,
    exportError,
    limpiarDetalleError: () => setDetalleError(""),
    limpiarAccionError: () => setAccionError(""),
    limpiarExportError: () => setExportError(""),
  };
};
