import { useQueries } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { listarInscripcionesCica } from "../../cica/cicaService";
import { listarInscripcionesCatequesisBautismo } from "../../catequesisBautismo/catequesisBautismoService";
import { obtenerSolicitudesCatequesis } from "../../../services/catequesis/catequesisService";
import { obtenerDonaciones } from "../../../services/donacionesService";
import { obtenerSolicitudesSacramentos } from "../../../services/constancias/constanciasService";
import Rutas from "../../../routes/Rutas";

const REFETCH_MS = 60_000;

export type NotificacionModulo = {
  id: string;
  label: string;
  count: number;
  to: string;
};

export function useNotificacionesPanel() {
  const { tienePermiso } = useAuth();
  const puedeCatequesis = tienePermiso("catequesis");
  const puedeDonaciones = tienePermiso("donaciones");
  const puedeConstancias = tienePermiso("constancias");

  const results = useQueries({
    queries: [
      {
        queryKey: ["notificaciones-panel", "catequesis"] as const,
        queryFn: async () => {
          const pagina = await obtenerSolicitudesCatequesis({
            page: 1,
            limit: 1,
          });
          return pagina.total ?? 0;
        },
        enabled: puedeCatequesis,
        refetchInterval: REFETCH_MS,
        refetchOnWindowFocus: true,
      },
      {
        queryKey: ["notificaciones-panel", "cica"] as const,
        queryFn: async () => {
          const data = (await listarInscripcionesCica("solicitudes")) ?? [];
          return data.length;
        },
        enabled: puedeCatequesis,
        refetchInterval: REFETCH_MS,
        refetchOnWindowFocus: true,
      },
      {
        queryKey: ["notificaciones-panel", "bautismo"] as const,
        queryFn: async () => {
          const data =
            (await listarInscripcionesCatequesisBautismo("solicitudes")) ?? [];
          return data.length;
        },
        enabled: puedeCatequesis,
        refetchInterval: REFETCH_MS,
        refetchOnWindowFocus: true,
      },
      {
        queryKey: ["notificaciones-panel", "donaciones"] as const,
        queryFn: async () => {
          const data = (await obtenerDonaciones()) ?? [];
          return data.filter(
            (item) => (item.estado || "Pendiente").toLowerCase() === "pendiente",
          ).length;
        },
        enabled: puedeDonaciones,
        refetchInterval: REFETCH_MS,
        refetchOnWindowFocus: true,
      },
      {
        queryKey: ["notificaciones-panel", "constancias"] as const,
        queryFn: async () => {
          const pagina = await obtenerSolicitudesSacramentos({
            estado: "Pendiente",
            page: 1,
            pageSize: 1,
          });
          return pagina.total ?? 0;
        },
        enabled: puedeConstancias,
        refetchInterval: REFETCH_MS,
        refetchOnWindowFocus: true,
      },
    ],
  });

  const [
    catequesisQuery,
    cicaQuery,
    bautismoQuery,
    donacionesQuery,
    constanciasQuery,
  ] = results;

  const items: NotificacionModulo[] = [];

  if (puedeCatequesis) {
    items.push({
      id: "catequesis",
      label: "Catequesis infantiles y juveniles",
      count: catequesisQuery.data ?? 0,
      to: Rutas.dashboardUrl.solicitudesCatequesis,
    });
    items.push({
      id: "cica",
      label: "CICA",
      count: cicaQuery.data ?? 0,
      to: Rutas.dashboardUrl.cica,
    });
    items.push({
      id: "bautismo",
      label: "Catequesis de bautismo",
      count: bautismoQuery.data ?? 0,
      to: Rutas.dashboardUrl.catequesisBautismo,
    });
  }

  if (puedeDonaciones) {
    items.push({
      id: "donaciones",
      label: "Donaciones",
      count: donacionesQuery.data ?? 0,
      to: Rutas.dashboardUrl.donaciones,
    });
  }

  if (puedeConstancias) {
    items.push({
      id: "constancias",
      label: "Solicitudes de sacramentos",
      count: constanciasQuery.data ?? 0,
      to: Rutas.dashboardUrl.constanciasSacramentos,
    });
  }

  const total = items.reduce((suma, item) => suma + item.count, 0);
  const cargando = results.some((q) => q.isPending && q.fetchStatus !== "idle");

  return { items, total, cargando };
}
