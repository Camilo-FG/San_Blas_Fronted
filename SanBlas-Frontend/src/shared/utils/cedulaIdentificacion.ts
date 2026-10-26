export type TipoCedula = "nacional" | "extranjera";

export const PATRON_CEDULA = /^(?:[1-9]\d{8}|[1-9]\d{11})$/;

// Conserva todos los dígitos de la identificación, sin pasar por Number ni recortarla a nueve.
export function limpiarCedula(valor: string, tipo: TipoCedula): string {
  return valor.replace(/\D/g, "").replace(/^0+/, "").slice(0, tipo === "nacional" ? 9 : 12);
}

// La longitud depende del tipo elegido, no de lo que el usuario alcanzó a escribir.
export function validarCedulaIdentificacion(
  valor: string,
  tipo: TipoCedula,
): string | null {
  if (!valor.trim()) return "La cédula es obligatoria.";
  if (valor.trim().startsWith("0")) return "La cédula no puede iniciar con cero.";
  const largo = tipo === "nacional" ? 9 : 12;
  return new RegExp(`^\\d{${largo}}$`).test(valor.trim())
    ? null
    : `La cédula debe tener ${largo} dígitos.`;
}
