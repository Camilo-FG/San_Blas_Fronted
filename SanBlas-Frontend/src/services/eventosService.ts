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

const logEventoApi = (
  action: string,
  hypothesisId: string,
  data: Record<string, unknown>,
) => {
  // #region agent log
  fetch("http://127.0.0.1:7472/ingest/a796af3c-8c46-4565-a5d6-9eb19acc69c6", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "fd9062",
    },
    body: JSON.stringify({
      sessionId: "fd9062",
      location: "eventosService.ts",
      message: action,
      data,
      timestamp: Date.now(),
      hypothesisId,
    }),
  }).catch(() => {});
  // #endregion
};

export const obtenerEventosPublicos = async (): Promise<Evento[]> => {
  try {
    const { data, status } = await apiClient.get<Evento[]>(`${BASE}/publicos`);
    const sample = data?.[0];
    logEventoApi("obtenerEventosPublicos ok", "H3,H4", {
      status,
      count: data?.length ?? 0,
      sampleKeys: sample ? Object.keys(sample) : [],
      hasTitulo: sample ? "titulo" in sample : false,
      hasTituloPascal: sample ? "Titulo" in sample : false,
    });
    return data;
  } catch (error) {
    logEventoApi("obtenerEventosPublicos error", "H1,H5", {
      status: (error as { response?: { status?: number } })?.response?.status ?? 0,
    });
    handleApiError(error);
  }
};

export const obtenerEventos = async (): Promise<Evento[]> => {
  try {
    const { data, status } = await apiClient.get<Evento[]>(BASE);
    const sample = data?.[0];
    logEventoApi("obtenerEventos ok", "H1,H4", {
      status,
      count: data?.length ?? 0,
      sampleKeys: sample ? Object.keys(sample) : [],
    });
    return data;
  } catch (error) {
    logEventoApi("obtenerEventos error", "H1,H5", {
      status: (error as { response?: { status?: number } })?.response?.status ?? 0,
    });
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
    logEventoApi("crearEvento request", "H2", {
      fechaInicio: payload.fechaInicio,
      publicado: payload.publicado,
    });
    const { data, status } = await apiClient.post<Evento>(BASE, payload);
    logEventoApi("crearEvento ok", "H2,H3", { status, id: data?.id });
    return data;
  } catch (error) {
    logEventoApi("crearEvento error", "H2,H5", {
      status: (error as { response?: { status?: number } })?.response?.status ?? 0,
    });
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
