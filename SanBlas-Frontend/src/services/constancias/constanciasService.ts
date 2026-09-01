import type { FormSacramento } from "../../types/formSacramento";
import { ApiError, apiClient, handleApiError } from "../apiClient";
import {
  clasificarErrorAprobacion,
  MENSAJES_APROBACION,
} from "./aprobacionErrors";
import type {
  EstadoSolicitudBackend,
  FormSacraBackend,
  SolicitudesSacramentosResponseBackend,
} from "./constanciasApiTypes";
import {
  mapBackendToFormSacramento,
  mapFormToBackendRequest,
} from "./constanciasMapper";
import {
  assertSolicitudesResponse,
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
  page?: number;
}

export const obtenerSolicitudesSacramentos = async (
  filters: SolicitudesSacramentosFilters = {},
): Promise<{
  data: FormSacramento[];
  total: number;
}> => {
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
    params.append("page", String(filters.page ?? 1));
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const { data } = await apiClient.get<SolicitudesSacramentosResponseBackend>(
      `${BASE}${queryString}`,
    );

    if (!assertSolicitudesResponse(data)) {
      logSolicitudesQueryError("obtenerSolicitudesSacramentos", data);
      throw new ApiError(MENSAJES_CONSULTA_SOLICITUDES.respuestaInvalida, 500);
    }

    return {
      data: data.data.map(mapBackendToFormSacramento),
      total: data.total,
    };
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

    if (solicitud.archivoImagen) {
      const formData = new FormData();
      formData.append("Payload", JSON.stringify(payload));
      formData.append("archivo", solicitud.archivoImagen);
      const { data } = await apiClient.post<FormSacraBackend>(
        `${BASE}/con-imagen`,
        formData,
      );
      return mapBackendToFormSacramento(data);
    }

    const { data } = await apiClient.post<FormSacraBackend>(BASE, payload);
    return mapBackendToFormSacramento(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const actualizarEstadoSacramento = async (
  id: number,
  nuevoEstado: EstadoSolicitudBackend,
): Promise<FormSacramento> => {
  try {
    const { data } = await apiClient.patch<FormSacraBackend>(
      `${BASE}/cambiar-estado/${id}`,
      { nuevoEstado },
    );
    return mapBackendToFormSacramento(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const aprobarSolicitudSacramento = async (
  id: number,
): Promise<FormSacramento> => {
  try {
    const { data } = await apiClient.patch<FormSacraBackend>(
      `${BASE}/cambiar-estado/${id}`,
      { nuevoEstado: "Aprobado" },
      // Cancela automáticamente si el servidor no responde en 5 segundos
      { timeout: 5000 },
    );
    return mapBackendToFormSacramento(data);
  } catch (error) {
    if (clasificarErrorAprobacion(error) === "timeout") {
      throw new ApiError(MENSAJES_APROBACION.timeout, 0);
    }
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

export const obtenerHistorialRechazos = async (): Promise<
  HistorialRechazo[]
> => {
  try {
    const { data } = await apiClient.get<HistorialRechazo[]>(
      `${BASE}/historial-rechazos`,
    );
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
