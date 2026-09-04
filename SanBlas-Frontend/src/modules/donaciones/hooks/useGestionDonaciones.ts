import { useState, useEffect } from "react";
import {
  actualizarEstadoDonacion,
  obtenerDonaciones,
  type Donacion,
  type EstadoDonacion,
  type EstadoDonacionAccion,
} from "../../../services/donacionesService";
import { ApiError } from "../../../services/apiClient";

export type { Donacion, EstadoDonacion, EstadoDonacionAccion };

export type ResultadoCambioEstado =
  | { ok: true }
  | { ok: false; mensaje: string };

const esEstadoFinal = (estado?: EstadoDonacion) =>
  estado === "Aprobado" || estado === "Rechazado";

export const useGestionDonaciones = () => {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDonaciones = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await obtenerDonaciones();
      setDonaciones(data);
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "No se pudieron cargar las donaciones.";
      setError(mensaje);
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstadoDonacion = async (
    id: number,
    nuevoEstado: EstadoDonacionAccion,
  ): Promise<ResultadoCambioEstado> => {
    const donacion = donaciones.find((item) => item.id === id);

    if (donacion && esEstadoFinal(donacion.estado)) {
      return {
        ok: false,
        mensaje: `Este donativo ya fue ${donacion.estado.toLowerCase()} y no puede procesarse nuevamente.`,
      };
    }

    setGuardando(true);

    try {
      await actualizarEstadoDonacion(id, nuevoEstado);

      setDonaciones((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, estado: nuevoEstado } : item,
        ),
      );
      return { ok: true };
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar el estado del donativo. Intente de nuevo.";
      console.error(err);
      return { ok: false, mensaje };
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    cargarDonaciones();
  }, []);

  return {
    donaciones,
    cargando,
    guardando,
    error,
    cambiarEstadoDonacion,
    recargar: cargarDonaciones,
  };
};
