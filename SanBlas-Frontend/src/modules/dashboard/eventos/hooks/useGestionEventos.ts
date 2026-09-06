import { useCallback, useEffect, useState } from "react";
import {
  activarEvento,
  actualizarEvento,
  crearEvento,
  desactivarEvento,
  eliminarEvento,
  obtenerEventoPorId,
  obtenerEventos,
  publicarEvento,
  type Evento,
  type EventoPayload,
  type OpcionesImagenEvento,
} from "../../../../services/eventosService";
import { ApiError } from "../../../../services/apiClient";
import { extraerFechaCalendario, extraerHora } from "../../../../shared/utils/fechas";

export type ResultadoAccionEvento =
  | { ok: true; evento: Evento }
  | { ok: false; mensaje: string; evento?: Evento; errores?: Record<string, string[]> };

const mensajeError = (err: unknown, respaldo: string) =>
  err instanceof ApiError ? err.message : respaldo;

// los errores de validación del back vienen como Record<campo, mensajes[]>, se reenvían para pintarlos por campo
const erroresBackend = (err: unknown): Record<string, string[]> | undefined =>
  err instanceof ApiError ? err.errores : undefined;

const formularioVacio = (): EventoPayload => ({
  titulo: "",
  descripcion: "",
  fechaInicio: "",
  fechaFin: null,
  lugar: "",
  hora: null,
  imagenUrl: null,
  publicado: false,
});

export const useGestionEventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertEvento = (evento: Evento) => {
    setEventos((prev) => {
      const existe = prev.some((item) => item.id === evento.id);
      if (existe) {
        return prev.map((item) => (item.id === evento.id ? evento : item));
      }
      return [evento, ...prev];
    });
  };

  const cargarEventos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await obtenerEventos();
      setEventos(data);
    } catch (err) {
      setError(mensajeError(err, "No se pudieron cargar los eventos."));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  const guardarEvento = async (
    payload: EventoPayload,
    id?: number,
    imagen?: OpcionesImagenEvento,
  ) => {
    setGuardando(true);
    setError(null);

    try {
      const evento = id
        ? await actualizarEvento(id, payload, imagen)
        : await crearEvento(payload, imagen);
      upsertEvento(evento);
      return { ok: true as const, evento };
    } catch (err) {
      const mensaje = mensajeError(err, "No se pudo guardar el evento.");
      setError(mensaje);
      return { ok: false as const, mensaje, errores: erroresBackend(err) };
    } finally {
      setGuardando(false);
    }
  };

  const borrarEvento = async (id: number) => {
    setGuardando(true);
    setError(null);

    try {
      await eliminarEvento(id);
      setEventos((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      const mensaje = mensajeError(err, "No se pudo eliminar el evento.");
      setError(mensaje);
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const publicarEventoDesdeFormulario = async (
    payload: EventoPayload,
    id?: number,
    imagen?: OpcionesImagenEvento,
  ): Promise<ResultadoAccionEvento> => {
    setGuardando(true);
    setError(null);
    let eventoGuardado: Evento | undefined;

    try {
      let evento = id
        ? await actualizarEvento(id, payload, imagen)
        : await crearEvento(payload, imagen);

      eventoGuardado = evento;
      upsertEvento(evento);

      if (!evento.publicado) {
        evento = await publicarEvento(evento.id);
        upsertEvento(evento);
      } else if (!evento.activo) {
        evento = await activarEvento(evento.id);
        upsertEvento(evento);
      }

      return { ok: true, evento };
    } catch (err) {
      return {
        ok: false,
        mensaje: mensajeError(
          err,
          "No se pudo completar la publicación del evento.",
        ),
        evento: eventoGuardado,
        errores: erroresBackend(err),
      };
    } finally {
      setGuardando(false);
    }
  };

  const publicarEventoEnLista = async (
    id: number,
  ): Promise<ResultadoAccionEvento> => {
    const evento = eventos.find((item) => item.id === id);

    if (evento?.publicado && evento.activo) {
      return { ok: false, mensaje: "Este evento ya fue publicado." };
    }

    setGuardando(true);

    try {
      const actualizado =
        evento?.publicado && !evento.activo
          ? await activarEvento(id)
          : await publicarEvento(id);
      upsertEvento(actualizado);
      return { ok: true, evento: actualizado };
    } catch (err) {
      return {
        ok: false,
        mensaje: mensajeError(
          err,
          "No se pudo completar la publicación del evento.",
        ),
      };
    } finally {
      setGuardando(false);
    }
  };

  const cambiarDisponibilidadEvento = async (
    id: number,
    activo: boolean,
  ): Promise<ResultadoAccionEvento> => {
    const evento = eventos.find((item) => item.id === id);

    if (!evento?.publicado) {
      return {
        ok: false,
        mensaje: "Solo se puede cambiar la disponibilidad de eventos publicados.",
      };
    }

    if (evento.activo === activo) {
      return {
        ok: false,
        mensaje: activo
          ? "Este evento ya está activo."
          : "Este evento ya está inactivo.",
      };
    }

    setGuardando(true);

    try {
      const actualizado = activo
        ? await activarEvento(id)
        : await desactivarEvento(id);
      upsertEvento(actualizado);
      return { ok: true, evento: actualizado };
    } catch (err) {
      return {
        ok: false,
        mensaje: mensajeError(
          err,
          "No fue posible actualizar el estado del evento.",
        ),
      };
    } finally {
      setGuardando(false);
    }
  };

  const cargarEventoPorId = async (id: number): Promise<Evento | null> => {
    setCargandoEdicion(true);
    try {
      const evento = await obtenerEventoPorId(id);
      return evento;
    } catch (err) {
      const mensaje = mensajeError(err, "No se pudo cargar el evento.");
      setError(mensaje);
      return null;
    } finally {
      setCargandoEdicion(false);
    }
  };

  return {
    eventos,
    cargando,
    guardando,
    cargandoEdicion,
    error,
    formularioVacio,
    guardarEvento,
    borrarEvento,
    publicarEventoDesdeFormulario,
    publicarEventoEnLista,
    cambiarDisponibilidadEvento,
    cargarEventoPorId,
    recargar: cargarEventos,
  };
};

export const eventoToFormulario = (evento: Evento): EventoPayload => ({
  titulo: evento.titulo,
  descripcion: evento.descripcion,
  fechaInicio: extraerFechaCalendario(evento.fechaInicio),
  fechaFin: evento.fechaFin ? extraerFechaCalendario(evento.fechaFin) : null,
  lugar: evento.lugar,
  hora: extraerHora(evento.hora),
  imagenUrl: evento.imagenUrl ?? null,
  publicado: evento.publicado,
});
