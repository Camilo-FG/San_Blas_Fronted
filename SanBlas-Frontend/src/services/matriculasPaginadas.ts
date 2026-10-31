import { apiClient, handleApiError } from "./apiClient";

export interface FiltrosMatriculas {
  vista: "solicitudes" | "historial";
  estado?: string;
  busqueda?: string;
  nombre?: string;
  cedula?: string;
  sacramento?: "bautizo" | "primeraComunion" | "confirmacion";
  condicion?: string;
  page: number;
  limit: number;
}

export interface PaginaMatriculas<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totales: { pendientes: number; aprobadas: number; rechazadas: number };
}

// El panel pide una página; los servicios antiguos siguen devolviendo sus arreglos.
export async function listarPaginaMatriculas<T>(
  ruta: string,
  params: FiltrosMatriculas,
): Promise<PaginaMatriculas<T>> {
  try {
    const { data } = await apiClient.get<PaginaMatriculas<T>>(ruta, { params });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
