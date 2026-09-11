import { useCallback, useEffect, useRef, useState } from "react";
import type { CatequesisEnrollmentRecord } from "../Types/catequesis";
import {
  actualizarEstadoSolicitud,
  exportarInscripcionesCatequesis,
  obtenerSolicitudCatequesisPorId,
  obtenerSolicitudesCatequesis,
} from "../services/catequesisService";
import { ApiError } from "../../../../services/apiClient";

export const useSolicitudesCatequesis = () => {
  const [solicitudes, setSolicitudesState] = useState<
    CatequesisEnrollmentRecord[]
  >([]);
  const tieneDatosRef = useRef(false);

  const [cargando, setCargando] = useState(true);
  const [filtrando, setFiltrando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [detalleError, setDetalleError] = useState("");
  const [accionError, setAccionError] = useState("");
  const [exportando, setExportando] = useState(false);
  const [exportError, setExportError] = useState("");

  const cargarSolicitudes = useCallback(async () => {
    const esCargaInicial = !tieneDatosRef.current;

    try {
      if (esCargaInicial) {
        setCargando(true);
      } else {
        setFiltrando(true);
      }
      setError("");

      const data = await obtenerSolicitudesCatequesis();
      setSolicitudesState(data);
      tieneDatosRef.current = true;
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudieron cargar las solicitudes de catequesis.");
      }
    } finally {
      setCargando(false);
      setFiltrando(false);
    }
  }, []);

  useEffect(() => {
    void cargarSolicitudes();
  }, [cargarSolicitudes]);

  const obtenerDetalle = async (id: number) => {
    try {
      setDetalleError("");
      return await obtenerSolicitudCatequesisPorId(id);
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        setDetalleError(err.message);
      } else {
        setDetalleError("No se pudo cargar el detalle de la solicitud.");
      }
      return null;
    }
  };

  const cambiarEstado = async (
    id: number,
    estado: "aprobado" | "rechazado",
    observacion?: string,
  ): Promise<{ ok: true } | { ok: false; mensaje: string }> => {
    try {
      setGuardando(true);
      setAccionError("");

      await actualizarEstadoSolicitud(id, estado, observacion);
      await cargarSolicitudes();

      return { ok: true };
    } catch (err) {
      console.error(err);
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar el estado de la solicitud.";
      setAccionError(mensaje);
      return { ok: false, mensaje };
    } finally {
      setGuardando(false);
    }
  };

  const exportarExcel = async () => {
    try {
      setExportando(true);
      setExportError("");
      await exportarInscripcionesCatequesis("Aprobada");
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        setExportError(
          err.status === 404
            ? "La exportación no está disponible. Reinicie el backend para cargar los cambios recientes."
            : err.message,
        );
      } else {
        setExportError("No se pudo exportar el archivo de Excel.");
      }
    } finally {
      setExportando(false);
    }
  };

  return {
    solicitudes,
    cargarSolicitudes,
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
