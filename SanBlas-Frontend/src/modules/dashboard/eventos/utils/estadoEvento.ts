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
  "publicado-activo": "info",
  "publicado-inactivo": "info",
};

export const PORTADA_ESTADO_EVENTO: Record<EstadoEvento, string> = {
  borrador: "bg-gradient-to-br from-slate-400 to-slate-300",
  "publicado-activo": "bg-gradient-to-br from-royal-blue to-royal-blue-dark",
  "publicado-inactivo": "bg-gradient-to-br from-royal-gold to-royal-gold-light",
};

export const ICONO_PORTADA_ESTADO: Record<EstadoEvento, string> = {
  borrador: "text-white/90",
  "publicado-activo": "text-white/90",
  "publicado-inactivo": "text-royal-blue",
};
