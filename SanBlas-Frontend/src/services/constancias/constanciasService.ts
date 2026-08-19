import type { FormSacramento } from "../../types/formSacramento";
import { ApiError, apiClient, handleApiError } from "../apiClient";
import type {
  EstadoConstancia,
  FormSacraBackend,
} from "./constanciasApiTypes";
import {
  mapBackendToFormSacramento,
  mapFormToBackendRequest,
} from "./constanciasMapper";
import {
  assertSolicitudesArrayResponse,
  logSolicitudesQueryError,
  MENSAJES_CONSULTA_SOLICITUDES,
  toFriendlySolicitudesMessage,
} from "./solicitudesQueryHandler";

export interface HistorialRechazo {
  id: number;
  solicitud_id: number;
  usuario_id: number;
  motivo: string;
  detalle: string | null;
  creado_en: string;
  nombre_solicitante: string | null;
  nombre_usuario_rechazo: string | null;
}

const BASE = "/solic-sacramento";

export interface SolicitudesSacramentosFilters {
  nombre?: string;
  cedula?: string;
  estado?: string;
}

export const obtenerSolicitudesSacramentos = async (
  filters: SolicitudesSacramentosFilters = {},
): Promise<FormSacramento[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.nombre) {
      params.append("nombre", filters.nombre);
    }
    if (filters.cedula) {
      params.append("cedula", filters.cedula.toString());
    }
    if (filters.estado) {
      params.append("estado", filters.estado);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const { data } = await apiClient.get<FormSacraBackend[]>(
      `${BASE}${queryString}`,
    );

    if (!assertSolicitudesArrayResponse(data)) {
      logSolicitudesQueryError("obtenerSolicitudesSacramentos", data);
      throw new ApiError(
        MENSAJES_CONSULTA_SOLICITUDES.respuestaInvalida,
        500,
      );
    }

    return data.map(mapBackendToFormSacramento);
  } catch (error) {
    logSolicitudesQueryError("obtenerSolicitudesSacramentos", error);
    if (error instanceof ApiError) {
      throw new ApiError(
        toFriendlySolicitudesMessage(error),
        error.status,
        error.errores,
      );
    }
    handleApiError(error);
  }
};

export const obtenerSolicitudSacramentoPorId = async (
  id: number,
): Promise<FormSacramento> => {
  try {
    const { data } = await apiClient.get<FormSacraBackend>(`${BASE}/${id}`);
    return mapBackendToFormSacramento(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const crearSolicitudSacramento = async (
  solicitud: Omit<FormSacramento, "id" | "Estado">,
): Promise<FormSacramento> => {
  try {
    const payload = mapFormToBackendRequest(solicitud);
    const { data } = await apiClient.post<FormSacraBackend>(BASE, payload);
    return mapBackendToFormSacramento(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const actualizarEstadoSacramento = async (
  id: number,
  estado: EstadoConstancia,
): Promise<FormSacramento> => {
  try {
    const { data } = await apiClient.patch<FormSacraBackend>(
      `${BASE}/${id}`,
      { Estado: estado },
    );
    return mapBackendToFormSacramento(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const rechazarSolicitudSacramento = async (
  id: number,
  motivoRechazo: string,
  detalleRechazo?: string,
): Promise<FormSacramento> => {
  try {
    const { data } = await apiClient.patch<FormSacraBackend>(
      `${BASE}/${id}/rechazar`,
      { motivoRechazo, detalleRechazo },
    );
    return mapBackendToFormSacramento(data);
  } catch (error) {
    handleApiError(error);
  }
};

// Alias para compatibilidad con imports existentes
export const getSolicitudes = obtenerSolicitudesSacramentos;
export const CreateSolicSacramento = crearSolicitudSacramento;

export const obtenerHistorialRechazos = async (): Promise<HistorialRechazo[]> => {
  try {
    const { data } = await apiClient.get<HistorialRechazo[]>(
      `${BASE}/historial-rechazos`,
    );
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
