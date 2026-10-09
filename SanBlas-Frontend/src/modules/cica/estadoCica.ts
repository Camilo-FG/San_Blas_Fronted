import type { BadgeVariant } from "../../shared/ui";

export function getEstadoBadgeVariant(estado?: string | null): BadgeVariant {
  if (estado === "Pendiente") return "warning";
  if (estado === "Aprobada") return "success";
  if (estado === "Rechazada") return "danger";
  return "neutral";
}

export function getEstadoBadgeClass(estado?: string | null): string {
  switch (getEstadoBadgeVariant(estado)) {
    case "success":
      return "dark:border-[#35d6a0] dark:bg-[rgba(53,214,160,0.10)] dark:text-[#35d6a0]";
    case "danger":
      return "dark:border-[#e66a6a] dark:bg-[rgba(230,106,106,0.10)] dark:text-[#e66a6a]";
    case "warning":
      return "dark:border-[#f2a34a] dark:bg-[rgba(242,163,74,0.10)] dark:text-[#f2a34a]";
    default:
      return "dark:border-white/15 dark:bg-white/5 dark:text-[#b7c3d4]";
  }
}

export function textoEstadoCica(estado?: string | null): string {
  const texto = estado?.trim();
  return texto || "Desconocido";
}
