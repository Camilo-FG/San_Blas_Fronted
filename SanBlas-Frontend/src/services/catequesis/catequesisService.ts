import axios from "axios";
import type { CatequesisEnrollmentData } from "../../modules/catequesis/types/CatequesisEnrollmentData";
import type { CatequesisEnrollmentRecord } from "../../modules/dashboard/catequesis/Types/catequesis";
import { ApiError, apiClient, handleApiError } from "../apiClient";
import type {
  ActualizarEstadoBackendResponse,
  CrearInscripcionBackendResponse,
  InscripcionDetalleBackend,
  InscripcionResumenBackend,
} from "./catequesisApiTypes";
import {
  mapDetalleToEnrollmentRecord,
  mapEstadoFrontendToBackend,
  mapFormToBackendRequest,
  mapFormToEnrollmentRecord,
  mapResumenToEnrollmentRecord,
} from "./catequesisMapper";
import {
  ensureOfflineDemoData,
  getDetailCache,
  getListCache,
  getNextOfflineId,
  getPendingSubmissions,
  isOfflineId,
  removePendingSubmission,
  saveDetailCache,
  saveListCache,
  savePendingSubmission,
  type PendingCatequesisSubmission,
} from "./catequesisOfflineStore";

const BASE = "/inscripciones-catequesis";

export interface CatequesisListResult {
  solicitudes: CatequesisEnrollmentRecord[];
  sinConexion: boolean;
}

export interface CrearSolicitudCatequesisResult extends CrearInscripcionBackendResponse {
  guardadaOffline?: boolean;
}

const tieneArchivosReales = (formData: CatequesisEnrollmentData): boolean =>
  formData.catequesis.feBautismoArchivo instanceof File &&
  formData.inscripcion.pago.archivoComprobante instanceof File;

const isNetworkError = (error: unknown): boolean => {
  if (!navigator.onLine) return true;
  if (error instanceof ApiError && error.status === 0) return true;
  return axios.isAxiosError(error) && !error.response;
};

const mergeSolicitudes = (
  ...lists: CatequesisEnrollmentRecord[][]
): CatequesisEnrollmentRecord[] => {
  const map = new Map<number, CatequesisEnrollmentRecord>();

  for (const list of lists) {
    for (const item of list) {
      map.set(item.id, item);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const fechaA = new Date(a.fechaSolicitud).getTime();
    const fechaB = new Date(b.fechaSolicitud).getTime();
    return fechaB - fechaA;
  });
};

const getPendingRecords = async (): Promise<CatequesisEnrollmentRecord[]> => {
  const pending = await getPendingSubmissions();
  return pending.map((item) => item.record);
};

const postInscripcion = async (
  formData: CatequesisEnrollmentData,
): Promise<CrearInscripcionBackendResponse> => {
  if (tieneArchivosReales(formData)) {
    const payload = mapFormToBackendRequest(formData);
    payload.datosInscripcion.feBautismoArchivo = "pendiente";
    payload.datosPago.comprobanteArchivo = "pendiente";

    const body = new FormData();
    body.append("Payload", JSON.stringify(payload));
    body.append(
      "FeBautismoArchivo",
      formData.catequesis.feBautismoArchivo as File,
    );
    body.append(
      "ComprobanteArchivo",
      formData.inscripcion.pago.archivoComprobante as File,
    );

    const { data } = await apiClient.post<CrearInscripcionBackendResponse>(
      `${BASE}/con-archivos`,
      body,
    );

    return data;
  }

  const payload = mapFormToBackendRequest(formData);
  const { data } = await apiClient.post<CrearInscripcionBackendResponse>(
    BASE,
    payload,
  );

  return data;
};

const postPendingSubmission = async (
  pending: PendingCatequesisSubmission,
): Promise<CrearInscripcionBackendResponse> => {
  const payload = { ...pending.backendPayload };
  payload.datosInscripcion.feBautismoArchivo = "pendiente";
  payload.datosPago.comprobanteArchivo = "pendiente";

  if (pending.feBautismoBlob && pending.comprobanteBlob) {
    const body = new FormData();
    body.append("Payload", JSON.stringify(payload));
    body.append(
      "FeBautismoArchivo",
      new File(
        [pending.feBautismoBlob],
        pending.feBautismoName ?? "fe-bautismo.pdf",
        { type: pending.feBautismoType ?? "application/pdf" },
      ),
    );
    body.append(
      "ComprobanteArchivo",
      new File(
        [pending.comprobanteBlob],
        pending.comprobanteName ?? "comprobante.pdf",
        { type: pending.comprobanteType ?? "application/pdf" },
      ),
    );

    const { data } = await apiClient.post<CrearInscripcionBackendResponse>(
      `${BASE}/con-archivos`,
      body,
    );

    return data;
  }

  const { data } = await apiClient.post<CrearInscripcionBackendResponse>(
    BASE,
    payload,
  );

  return data;
};

export const syncPendingCatequesisSubmissions = async (): Promise<number> => {
  if (!navigator.onLine) return 0;

  const pending = await getPendingSubmissions();
  let synced = 0;

  for (const item of pending) {
    try {
      await postPendingSubmission(item);
      await removePendingSubmission(item.localId);
      synced += 1;
    } catch (error) {
      if (isNetworkError(error)) break;
      console.error("No se pudo sincronizar inscripción offline:", error);
    }
  }

  return synced;
};

const saveOfflineSubmission = async (
  formData: CatequesisEnrollmentData,
): Promise<CrearSolicitudCatequesisResult> => {
  const localId = getNextOfflineId();
  const backendPayload = mapFormToBackendRequest(formData);
  const record = mapFormToEnrollmentRecord(formData, localId);

  const pending: PendingCatequesisSubmission = {
    localId,
    createdAt: new Date().toISOString(),
    backendPayload,
    record,
  };

  if (formData.catequesis.feBautismoArchivo instanceof File) {
    pending.feBautismoBlob = formData.catequesis.feBautismoArchivo;
    pending.feBautismoName = formData.catequesis.feBautismoArchivo.name;
    pending.feBautismoType = formData.catequesis.feBautismoArchivo.type;
  }

  if (formData.inscripcion.pago.archivoComprobante instanceof File) {
    pending.comprobanteBlob = formData.inscripcion.pago.archivoComprobante;
    pending.comprobanteName = formData.inscripcion.pago.archivoComprobante.name;
    pending.comprobanteType = formData.inscripcion.pago.archivoComprobante.type;
  }

  await savePendingSubmission(pending);

  const cached = await getListCache();
  await saveListCache(mergeSolicitudes(cached, [record]));
  await saveDetailCache(record);

  return {
    id: localId,
    mensaje:
      "Inscripción guardada sin conexión. Se sincronizará automáticamente al recuperar internet.",
    estado: "Pendiente",
    fechaSolicitud: record.fechaSolicitud,
    guardadaOffline: true,
  };
};

export const obtenerSolicitudesCatequesis = async (
  estado?: string,
): Promise<CatequesisListResult> => {
  await ensureOfflineDemoData();

  const pendingRecords = await getPendingRecords();

  try {
    if (navigator.onLine) {
      await syncPendingCatequesisSubmissions();
    }

    const params = estado ? { estado } : undefined;
    const { data } = await apiClient.get<InscripcionResumenBackend[]>(BASE, {
      params,
    });

    const solicitudes = data.map(mapResumenToEnrollmentRecord);
    await saveListCache(solicitudes, estado);

    return {
      solicitudes: mergeSolicitudes(solicitudes, pendingRecords),
      sinConexion: false,
    };
  } catch (error) {
    if (!isNetworkError(error)) {
      handleApiError(error);
    }

    const cached = await getListCache(estado);
    const solicitudes = mergeSolicitudes(cached, pendingRecords);

    if (solicitudes.length === 0) {
      handleApiError(error);
    }

    return {
      solicitudes,
      sinConexion: true,
    };
  }
};

export const obtenerSolicitudCatequesisPorId = async (
  id: number,
): Promise<CatequesisEnrollmentRecord> => {
  if (isOfflineId(id)) {
    const cached = await getDetailCache(id);
    if (cached) return cached;

    const pending = await getPendingSubmissions();
    const local = pending.find((item) => item.localId === id);
    if (local) return local.record;

    throw new ApiError("No se encontró la inscripción guardada sin conexión.", 404);
  }

  try {
    const { data } = await apiClient.get<InscripcionDetalleBackend>(
      `${BASE}/${id}`,
    );

    const record = mapDetalleToEnrollmentRecord(data);
    await saveDetailCache(record);
    return record;
  } catch (error) {
    if (!isNetworkError(error)) {
      handleApiError(error);
    }

    const cached = await getDetailCache(id);
    if (cached) return cached;

    const listCached = await getListCache();
    const fromList = listCached.find((item) => item.id === id);
    if (fromList) return fromList;

    handleApiError(error);
  }
};

export const crearSolicitudCatequesis = async (
  formData: CatequesisEnrollmentData,
): Promise<CrearSolicitudCatequesisResult> => {
  await ensureOfflineDemoData();

  if (!navigator.onLine) {
    return saveOfflineSubmission(formData);
  }

  try {
    const response = await postInscripcion(formData);
    return response;
  } catch (error) {
    if (!isNetworkError(error)) {
      handleApiError(error);
    }

    return saveOfflineSubmission(formData);
  }
};

export const actualizarEstadoSolicitud = async (
  id: number,
  estado: "aprobado" | "rechazado" | "pendiente",
  observacion?: string,
): Promise<ActualizarEstadoBackendResponse> => {
  if (isOfflineId(id)) {
    throw new ApiError(
      "Esta inscripción está pendiente de sincronización. Conéctese a internet para gestionarla.",
      400,
    );
  }

  try {
    const { data } = await apiClient.put<ActualizarEstadoBackendResponse>(
      `${BASE}/${id}/estado`,
      {
        estado: mapEstadoFrontendToBackend(estado),
        observacion: observacion ?? null,
      },
    );

    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const agregarObservacionAdministrativa = async (
  id: number,
  estado: "aprobado" | "rechazado",
  observacion: string,
): Promise<ActualizarEstadoBackendResponse> => {
  return actualizarEstadoSolicitud(id, estado, observacion);
};

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    void syncPendingCatequesisSubmissions();
  });
}
