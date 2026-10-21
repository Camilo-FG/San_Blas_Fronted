import type { QueryClient } from "@tanstack/react-query";

/** Clave raíz de los conteos de la campana del panel. */
export const NOTIFICACIONES_PANEL_KEY = ["notificaciones-panel"] as const;

/** Refresca el badge de la campana tras aprobar/rechazar/eliminar. */
export function invalidarNotificacionesPanel(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: NOTIFICACIONES_PANEL_KEY });
}
