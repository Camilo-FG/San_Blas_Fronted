import { apiClient, handleApiError } from "./apiClient";

export interface DashboardChartSlice {
  etiqueta: string;
  total: number;
}

export interface DashboardMesActividad {
  mes: string;
  catequesis: number;
  constancias: number;
  sacramentos: number;
  donaciones: number;
}

export interface DashboardGraficos {
  catequesisPorEstado: DashboardChartSlice[];
  constanciasPorEstado: DashboardChartSlice[];
  sacramentosPorTipo: DashboardChartSlice[];
  donacionesPorEstado: DashboardChartSlice[];
  eventosPorEstado: DashboardChartSlice[];
  actividadMensual: DashboardMesActividad[];
}

export interface DashboardStats {
  solicitudesCatequesis: number;
  solicitudesConstancias: number;
  registrosSacramentos: number;
  donaciones: number;
  eventos: number;
  usuarios: number;
  graficos: DashboardGraficos;
}

export const obtenerEstadisticasDashboard = async (): Promise<DashboardStats> => {
  try {
    const { data } = await apiClient.get<DashboardStats>("/Dashboard/stats");
    return {
      ...data,
      graficos: data.graficos ?? {
        catequesisPorEstado: [],
        constanciasPorEstado: [],
        sacramentosPorTipo: [],
        donacionesPorEstado: [],
        eventosPorEstado: [],
        actividadMensual: [],
      },
    };
  } catch (error) {
    handleApiError(error);
  }
};
