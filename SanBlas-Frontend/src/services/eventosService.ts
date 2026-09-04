import { apiClient, handleApiError } from "./apiClient";

export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin?: string | null;
  lugar: string;
  publicado: boolean;
  activo: boolean;
}

export interface EventoPayload {
  id?: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin?: string | null;
  lugar: string;
  publicado: boolean;
}

const BASE = "/Evento";

const normalizarEvento = (evento: Evento): Evento => ({
  ...evento,
  activo: evento.activo !== false,
  publicado: Boolean(evento.publicado),
});

export const obtenerEventosPublicos = async (): Promise<Evento[]> => {
  try {
    const { data } = await apiClient.get<Evento[]>(`${BASE}/publicos`);
    return data.map(normalizarEvento);
  } catch (error) {
    handleApiError(error);
  }
};

export const obtenerEventos = async (): Promise<Evento[]> => {
  try {
    const { data } = await apiClient.get<Evento[]>(BASE);
    return data.map(normalizarEvento);
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

export const crearEvento = async (payload: EventoPayload): Promise<Evento> => {
  try {
    const { data } = await apiClient.post<Evento>(BASE, payload);
    return normalizarEvento(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const actualizarEvento = async (
  id: number,
  payload: EventoPayload,
): Promise<Evento> => {
  try {
    const { data } = await apiClient.put<Evento>(`${BASE}/${id}`, {
      ...payload,
      id,
    });
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
