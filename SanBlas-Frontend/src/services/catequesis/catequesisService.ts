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
  mapResumenToEnrollmentRecord,
} from "./catequesisMapper";

const BASE = "/inscripciones-catequesis";

const tieneArchivosReales = (formData: CatequesisEnrollmentData): boolean =>
  formData.catequesis.feBautismoArchivo instanceof File &&
  formData.inscripcion.pago.archivoComprobante instanceof File;

export const obtenerSolicitudesCatequesis = async (
  estado?: string,
): Promise<CatequesisEnrollmentRecord[]> => {
  try {
    const params = estado ? { estado } : undefined;
    const { data } = await apiClient.get<InscripcionResumenBackend[]>(BASE, {
      params,
    });

    return data.map(mapResumenToEnrollmentRecord);
  } catch (error) {
    handleApiError(error);
  }
};

export const obtenerSolicitudCatequesisPorId = async (
  id: number,
): Promise<CatequesisEnrollmentRecord> => {
  try {
    const { data } = await apiClient.get<InscripcionDetalleBackend>(
      `${BASE}/${id}`,
    );

    return mapDetalleToEnrollmentRecord(data);
  } catch (error) {
    handleApiError(error);
  }
};

export const crearSolicitudCatequesis = async (
  formData: CatequesisEnrollmentData,
): Promise<CrearInscripcionBackendResponse> => {
  try {
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
  } catch (error) {
    handleApiError(error);
  }
};

export const actualizarEstadoSolicitud = async (
  id: number,
  estado: "aprobado" | "rechazado" | "pendiente",
  observacion?: string,
): Promise<ActualizarEstadoBackendResponse> => {
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

const extraerNombreArchivo = (contentDisposition?: string): string | null => {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1] ?? null;
};

const handleBlobApiError = async (error: unknown): Promise<never> => {
  if (
    axios.isAxiosError(error) &&
    error.response?.data instanceof Blob &&
    error.response.data.type.includes("json")
  ) {
    const payload = JSON.parse(await error.response.data.text()) as {
      mensaje?: string;
      message?: string;
    };

    throw new ApiError(
      payload.mensaje ?? payload.message ?? "No se pudo exportar el archivo.",
      error.response.status,
    );
  }

  return handleApiError(error);
};

export const exportarInscripcionesCatequesis = async (
  estado = "Aprobada",
): Promise<void> => {
  try {
    const response = await apiClient.get<Blob>(`${BASE}/exportar`, {
      params: { estado },
      responseType: "blob",
    });

    const nombreArchivo =
      extraerNombreArchivo(response.headers["content-disposition"]) ??
      `inscripciones_aprobadas_${new Date().toISOString().slice(0, 10)}.xlsx`;

    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    await handleBlobApiError(error);
  }
};
