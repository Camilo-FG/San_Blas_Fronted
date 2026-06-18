import type { CatequesisEnrollmentData } from "../../modules/catequesis/types/CatequesisEnrollmentData";
import type { CatequesisEnrollmentRecord } from "../../modules/dashboard/catequesis/Types/catequesis";
import { apiClient, handleApiError } from "../apiClient";
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
      body.append("payload", JSON.stringify(payload));
      body.append(
        "feBautismoArchivo",
        formData.catequesis.feBautismoArchivo as File,
      );
      body.append(
        "comprobanteArchivo",
        formData.inscripcion.pago.archivoComprobante as File,
      );

      const { data } = await apiClient.post<CrearInscripcionBackendResponse>(
        BASE,
        body,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
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
