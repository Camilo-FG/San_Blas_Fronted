/**
 * Validación en vivo para los formularios de Registro de Sacramentos.
 * Un mensaje solo se muestra si el campo ya fue tocado (el usuario escribió
 * o salió de él) o si ya se intentó guardar; al corregir, desaparece solo.
 */

export type ErroresFormulario = Record<string, string>;
export type CamposTocados = Record<string, boolean>;

/**
 * Filtra los errores calculados dejando solo los visibles:
 * - La clave ya era visible antes (se mantiene mientras siga inválida).
 * - El campo fue tocado por el usuario.
 * - Ya se intentó enviar el formulario (entonces todos son visibles).
 */
export const erroresVisibles = (
  nuevos: ErroresFormulario,
  anteriores: ErroresFormulario,
  tocados: CamposTocados,
  intentado: boolean,
): ErroresFormulario => {
  if (intentado) return nuevos;
  const visibles: ErroresFormulario = {};
  for (const [clave, mensaje] of Object.entries(nuevos)) {
    if (tocados[clave] || clave in anteriores) visibles[clave] = mensaje;
  }
  return visibles;
};

/** Marca una clave como tocada sin cambiar la referencia si ya lo estaba. */
export const marcarTocado = (
  tocados: CamposTocados,
  clave: string,
): CamposTocados => (tocados[clave] ? tocados : { ...tocados, [clave]: true });

/** Comparación superficial de dos mapas de errores (evita re-renders inútiles). */
export const mismosErrores = (
  a: ErroresFormulario,
  b: ErroresFormulario,
): boolean => {
  const clavesA = Object.keys(a);
  const clavesB = Object.keys(b);
  return clavesA.length === clavesB.length && clavesA.every((k) => a[k] === b[k]);
};
