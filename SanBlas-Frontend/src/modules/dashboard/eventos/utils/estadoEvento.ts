import type { Evento } from "../../../../services/eventosService";
import type { BadgeVariant } from "../../../../shared/ui";

export type EstadoEvento =
  | "borrador"
  | "publicado-activo"
  | "publicado-inactivo";

export const obtenerEstadoEvento = (
  evento?: Pick<Evento, "publicado" | "activo"> | null,
): EstadoEvento => {
  if (!evento?.publicado) return "borrador";
  return evento.activo ? "publicado-activo" : "publicado-inactivo";
};

export const ETIQUETA_ESTADO_EVENTO: Record<EstadoEvento, string> = {
  borrador: "Borrador",
  "publicado-activo": "Publicado / Activo",
  "publicado-inactivo": "Publicado / Inactivo",
};

export const VARIANTE_ESTADO_EVENTO: Record<EstadoEvento, BadgeVariant> = {
  borrador: "neutral",
  "publicado-activo": "success",
  "publicado-inactivo": "warning",
};

export const PORTADA_ESTADO_EVENTO: Record<EstadoEvento, string> = {
  borrador: "bg-gradient-to-br from-slate-500 to-slate-400",
  "publicado-activo": "bg-gradient-to-br from-teal to-teal-hover",
  "publicado-inactivo": "bg-gradient-to-br from-amber-600 to-orange-400",
};
