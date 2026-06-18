import { apiClient, handleApiError } from "./apiClient";

export type EstadoDonacion = "Pendiente" | "Aprobado" | "Rechazado";

export interface DonacionBackend {
  id: number;
  fecha: string;
  anonimo: boolean;
  nombre: string;
  correo: string;
  telefono?: string | null;
  detalle: string;
  estado?: string;
}

export interface CrearDonacionPayload {
  anonimo: boolean;
  nombre: string;
  correo: string;
  telefono: string;
  detalle: string;
}

export interface Donacion {
  id: number;
  fecha: string;
  anonimo: boolean;
  nombre: string;
  correo: string;
  telefono: string;
  detalle: string;
  estado: EstadoDonacion;
}

const mapEstadoDonacion = (estado?: string): EstadoDonacion => {
  if (estado === "Aceptada" || estado === "Aprobado") return "Aprobado";
  if (estado === "Denegada" || estado === "Rechazado") return "Rechazado";
  return "Pendiente";
};

const mapDonacionBackend = (don: DonacionBackend): Donacion => ({
  id: don.id,
  fecha: don.fecha ?? "",
  anonimo: !!don.anonimo,
  nombre: don.nombre ?? "",
  correo: don.correo ?? "",
  telefono: don.telefono ?? "",
  detalle: don.detalle ?? "",
  estado: mapEstadoDonacion(don.estado),
});

export const obtenerDonaciones = async (): Promise<Donacion[]> => {
  try {
    const { data } = await apiClient.get<DonacionBackend[]>("/Donacion");
    return data.map(mapDonacionBackend);
  } catch (error) {
    handleApiError(error);
  }
};

export const crearDonacion = async (
  payload: CrearDonacionPayload,
): Promise<DonacionBackend> => {
  try {
    const { data } = await apiClient.post<DonacionBackend>("/Donacion", payload);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const actualizarEstadoDonacion = async (
  id: number,
  estado: EstadoDonacion,
): Promise<DonacionBackend> => {
  try {
    const { data } = await apiClient.patch<DonacionBackend>(
      `/Donacion/${id}/estado`,
      estado,
    );
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
