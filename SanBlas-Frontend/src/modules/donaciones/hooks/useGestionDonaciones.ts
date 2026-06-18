import { useState, useEffect } from "react";
import {
  actualizarEstadoDonacion,
  obtenerDonaciones,
  type Donacion,
  type EstadoDonacion,
} from "../../../services/donacionesService";
import { ApiError } from "../../../services/apiClient";

export type { Donacion, EstadoDonacion };

export const useGestionDonaciones = () => {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

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
    nuevoEstado: EstadoDonacion,
  ) => {
    setProcesandoId(id);
    try {
      await actualizarEstadoDonacion(id, nuevoEstado);

      setDonaciones((prev) =>
        prev.map((donacion) =>
          donacion.id === id ? { ...donacion, estado: nuevoEstado } : donacion,
        ),
      );
      return true;
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "Hubo un error al guardar el nuevo estado.";
      alert(mensaje);
      console.error(err);
      return false;
    } finally {
      setProcesandoId(null);
    }
  };

  useEffect(() => {
    cargarDonaciones();
  }, []);

  return {
    donaciones,
    cargando,
    error,
    procesandoId,
    cambiarEstadoDonacion,
    recargar: cargarDonaciones,
  };
};
