import { apiClient, handleApiError } from "./apiClient";

export interface DashboardStats {
  solicitudesCatequesis: number;
  solicitudesConstancias: number;
  registrosSacramentos: number;
  donaciones: number;
  eventos: number;
  usuarios: number;
}

interface DashboardStatsBackend {
  solicitudesCatequesis: number;
  solicitudesConstancias: number;
  registrosSacramentos: number;
  donaciones: number;
  eventos: number;
  usuarios: number;
}

export const obtenerEstadisticasDashboard = async (): Promise<DashboardStats> => {
  try {
    const { data } = await apiClient.get<DashboardStatsBackend>("/Dashboard/stats");
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
