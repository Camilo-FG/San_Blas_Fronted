import { apiClient, handleApiError } from "./apiClient";

export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin?: string | null;
  lugar: string;
  publicado: boolean;
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

export const obtenerEventosPublicos = async (): Promise<Evento[]> => {
  try {
    const { data } = await apiClient.get<Evento[]>(`${BASE}/publicos`);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const obtenerEventos = async (): Promise<Evento[]> => {
  try {
    const { data } = await apiClient.get<Evento[]>(BASE);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const obtenerEventoPorId = async (id: number): Promise<Evento> => {
  try {
    const { data } = await apiClient.get<Evento>(`${BASE}/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const crearEvento = async (payload: EventoPayload): Promise<Evento> => {
  try {
    const { data } = await apiClient.post<Evento>(BASE, payload);
    return data;
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
    return data;
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
