import { extraerFechaCalendario, extraerHora } from "../shared/utils/fechas";
import { apiClient, handleApiError } from "./apiClient";

export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin?: string | null;
  lugar: string;
  hora?: string | null;
  imagenUrl?: string | null;
  publicado: boolean;
  activo: boolean;
  createdAt?: string | null;
}

export interface EventoPayload {
  id?: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin?: string | null;
  lugar: string;
  hora?: string | null;
  imagenUrl?: string | null;
  publicado: boolean;
}

const BASE = "/Evento";

const fechaPayload = (valor?: string | null) => {
  const calendario = extraerFechaCalendario(valor);
  return calendario || valor || null;
};

const textoOpcional = (valor?: string | null) => {
  const texto = valor?.trim();
  return texto ? texto : null;
};

const normalizarEvento = (evento: Evento): Evento => ({
  ...evento,
  fechaInicio: fechaPayload(evento.fechaInicio) ?? evento.fechaInicio,
  fechaFin: fechaPayload(evento.fechaFin ?? null),
  hora: extraerHora(evento.hora),
  imagenUrl: textoOpcional(evento.imagenUrl),
  activo: evento.activo !== false,
  publicado: Boolean(evento.publicado),
});

const ordenarPorCreacion = (eventos: Evento[]): Evento[] =>
  [...eventos].sort((a, b) => {
    const fechaA = a.createdAt ? Date.parse(a.createdAt) : 0;
    const fechaB = b.createdAt ? Date.parse(b.createdAt) : 0;

    if (fechaA !== fechaB) return fechaB - fechaA;
    return b.id - a.id;
  });

// El back no acepta `publicado` en create/update (ValidationPipe forbidNonWhitelisted).
const payloadCalendario = (payload: EventoPayload) => ({
  titulo: payload.titulo,
  descripcion: payload.descripcion,
  fechaInicio: fechaPayload(payload.fechaInicio) ?? payload.fechaInicio,
  fechaFin: payload.fechaFin ? fechaPayload(payload.fechaFin) : payload.fechaFin,
  lugar: payload.lugar,
  hora: extraerHora(payload.hora),
  imagenUrl: textoOpcional(payload.imagenUrl),
});

export const obtenerEventosPublicos = async (): Promise<Evento[]> => {
  try {
    const { data } = await apiClient.get<Evento[]>(`${BASE}/publicos`);
    return ordenarPorCreacion(data.map(normalizarEvento));
  } catch (error) {
    handleApiError(error);
  }
};

export const obtenerEventos = async (): Promise<Evento[]> => {
  try {
    const { data } = await apiClient.get<Evento[]>(BASE);
    return ordenarPorCreacion(data.map(normalizarEvento));
  } catch (error) {
    handleApiError(error);
  }
};

export const obtenerEventoPorId = async (id: number): Promise<Evento> => {
  try {
    const { data } = await apiClient.get<Evento>(`${BASE}/${id}`);
    return normalizarEvento(data);
  } catch (error) {
    handleApiError(error);
  }
};

export type OpcionesImagenEvento = {
  archivo?: File | null;
  eliminarImagen?: boolean;
};

const enviarEventoConImagen = async (
  url: string,
  payload: EventoPayload,
  archivo: File,
  metodo: "post" | "put",
) => {
  const formData = new FormData();
  formData.append("Payload", JSON.stringify(payloadCalendario(payload)));
  formData.append("archivo", archivo);
  const { data } = await apiClient[metodo]<Evento>(url, formData);
  return normalizarEvento(data);
};

export const crearEvento = async (
  payload: EventoPayload,
  opciones?: OpcionesImagenEvento,
): Promise<Evento> => {
  try {
    if (opciones?.archivo) {
      return await enviarEventoConImagen(BASE + "/con-imagen", payload, opciones.archivo, "post");
    }
    const { data } = await apiClient.post<Evento>(BASE, payloadCalendario(payload));
    return normalizarEvento(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const actualizarEvento = async (
  id: number,
  payload: EventoPayload,
  opciones?: OpcionesImagenEvento,
): Promise<Evento> => {
  try {
    const cuerpo = {
      ...payloadCalendario(payload),
      eliminarImagen: Boolean(opciones?.eliminarImagen),
    };

    if (opciones?.archivo) {
      return await enviarEventoConImagen(
        `${BASE}/${id}/con-imagen`,
        cuerpo,
        opciones.archivo,
        "put",
      );
    }

    const { data } = await apiClient.put<Evento>(`${BASE}/${id}`, cuerpo);
    return normalizarEvento(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const publicarEvento = async (id: number): Promise<Evento> => {
  try {
    const { data } = await apiClient.patch<Evento>(`${BASE}/${id}/publicar`);
    return normalizarEvento(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const activarEvento = async (id: number): Promise<Evento> => {
  try {
    const { data } = await apiClient.patch<Evento>(`${BASE}/${id}/activar`);
    return normalizarEvento(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const desactivarEvento = async (id: number): Promise<Evento> => {
  try {
    const { data } = await apiClient.patch<Evento>(`${BASE}/${id}/desactivar`);
    return normalizarEvento(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const eliminarEvento = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${BASE}/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};
