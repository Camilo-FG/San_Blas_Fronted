import type { FormSacramento } from "../../types/formSacramento";
import { apiClient, handleApiError } from "../apiClient";
import type {
  EstadoConstancia,
  FormSacraBackend,
} from "./constanciasApiTypes";
import {
  mapBackendToFormSacramento,
  mapFormToBackendRequest,
} from "./constanciasMapper";

const BASE = "/solic-sacramento";

const logConstancia = (
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
      location: "constanciasService.ts",
      message: action,
      data,
      timestamp: Date.now(),
      hypothesisId,
    }),
  }).catch(() => {});
  // #endregion
};

export const obtenerSolicitudesSacramentos = async (): Promise<
  FormSacramento[]
> => {
  try {
    const { data, status } = await apiClient.get<FormSacraBackend[]>(BASE);
    logConstancia("obtenerSolicitudes ok", "H3,H5", {
      status,
      count: data?.length ?? 0,
      sampleEstado: data?.[0]?.Estado ?? null,
    });
    return data.map(mapBackendToFormSacramento);
  } catch (error) {
    logConstancia("obtenerSolicitudes error", "H3", {
      status: (error as { response?: { status?: number } })?.response?.status ?? 0,
    });
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
    logConstancia("crearSolicitud request", "H1,H4", {
      tipoSacramento: payload.TipoSacramento,
      cedulaLen: String(payload.Cedula).length,
      telefonoLen: String(payload.Telefono).length,
    });
    const { data, status } = await apiClient.post<FormSacraBackend>(BASE, payload);
    logConstancia("crearSolicitud ok", "H1,H4", {
      status,
      id: data?.id,
      Estado: data?.Estado,
    });
    return mapBackendToFormSacramento(data);
  } catch (error) {
    logConstancia("crearSolicitud error", "H1", {
      status: (error as { response?: { status?: number } })?.response?.status ?? 0,
    });
    handleApiError(error);
  }
};

export const actualizarEstadoSacramento = async (
  id: number,
  estado: EstadoConstancia,
): Promise<FormSacramento> => {
  try {
    logConstancia("actualizarEstado request", "H2", { id, estado });
    const { data, status } = await apiClient.patch<FormSacraBackend>(
      `${BASE}/${id}`,
      { Estado: estado },
    );
    logConstancia("actualizarEstado ok", "H2,H5", {
      status,
      id: data?.id,
      Estado: data?.Estado,
    });
    return mapBackendToFormSacramento(data);
  } catch (error) {
    logConstancia("actualizarEstado error", "H2,H3", {
      status: (error as { response?: { status?: number } })?.response?.status ?? 0,
    });
    handleApiError(error);
  }
};

// Alias para compatibilidad con imports existentes
export const getSolicitudes = obtenerSolicitudesSacramentos;
export const CreateSolicSacramento = crearSolicitudSacramento;
