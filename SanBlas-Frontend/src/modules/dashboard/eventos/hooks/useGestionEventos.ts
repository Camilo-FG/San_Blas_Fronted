import { useCallback, useEffect, useState } from "react";
import {
  actualizarEvento,
  crearEvento,
  eliminarEvento,
  obtenerEventos,
  type Evento,
  type EventoPayload,
} from "../../../../services/eventosService";
import { ApiError } from "../../../../services/apiClient";

const formularioVacio = (): EventoPayload => ({
  titulo: "",
  descripcion: "",
  fechaInicio: "",
  fechaFin: null,
  lugar: "",
  publicado: true,
});

export const useGestionEventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarEventos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await obtenerEventos();
      setEventos(data);
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "No se pudieron cargar los eventos.";
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  const guardarEvento = async (payload: EventoPayload, id?: number) => {
    setGuardando(true);
    setError(null);

    try {
      if (id) {
        await actualizarEvento(id, payload);
      } else {
        await crearEvento(payload);
      }

      await cargarEventos();
      return true;
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "No se pudo guardar el evento.";
      setError(mensaje);
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const borrarEvento = async (id: number) => {
    setGuardando(true);
    setError(null);

    try {
      await eliminarEvento(id);
      await cargarEventos();
      return true;
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar el evento.";
      setError(mensaje);
      return false;
    } finally {
      setGuardando(false);
    }
  };

  return {
    eventos,
    cargando,
    guardando,
    error,
    formularioVacio,
    guardarEvento,
    borrarEvento,
    recargar: cargarEventos,
  };
};

export const eventoToFormulario = (evento: Evento): EventoPayload => ({
  id: evento.id,
  titulo: evento.titulo,
  descripcion: evento.descripcion,
  fechaInicio: evento.fechaInicio.split("T")[0],
  fechaFin: evento.fechaFin ? evento.fechaFin.split("T")[0] : null,
  lugar: evento.lugar,
  publicado: evento.publicado,
});
