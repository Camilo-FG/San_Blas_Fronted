/**
 * Recorta espacios de los extremos y unifica espacios internos consecutivos.
 */
export function normalizarTexto(valor: unknown): string {
  if (typeof valor !== "string") {
    return "";
  }

  return valor.trim().replace(/\s+/g, " ");
}
