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

export const obtenerSolicitudesSacramentos = async (): Promise<
  FormSacramento[]
> => {
  try {
    const { data } = await apiClient.get<FormSacraBackend[]>(BASE);
    return data.map(mapBackendToFormSacramento);
  } catch (error) {
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

// Alias para compatibilidad con imports existentes
export const getSolicitudes = obtenerSolicitudesSacramentos;
export const CreateSolicSacramento = crearSolicitudSacramento;
