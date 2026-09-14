import { apiClient, handleApiError } from "../../../services/apiClient";
import type { Rol } from "../../../types/Rol";

export type { Rol } from "../../../types/Rol";

export interface CrearRolPayload {
  nombre: string;
  descripcion: string;
  permisos: string[];
}

const mapRol = (data: Record<string, unknown>): Rol => ({
  id: Number(data.id),
  clave: String(data.clave ?? ""),
  nombre: String(data.nombre ?? ""),
  descripcion: String(data.descripcion ?? ""),
  permisos: Array.isArray(data.permisos) ? (data.permisos as string[]) : [],
  esSistema: Boolean(data.esSistema ?? data.es_sistema),
});

export const obtenerRoles = async (): Promise<Rol[]> => {
  try {
    const { data } = await apiClient.get<Record<string, unknown>[]>("/roles");
    return data.map(mapRol);
  } catch (error) {
    handleApiError(error);
  }
};

export const crearRol = async (payload: CrearRolPayload): Promise<Rol> => {
  try {
    const { data } = await apiClient.post<Record<string, unknown>>(
      "/roles",
      payload,
    );
    return mapRol(data);
  } catch (error) {
    handleApiError(error);
  }
};
