/**
 * Convierte un texto para que cada palabra inicie con mayúscula.
 * Ej: "juan carlos" -> "Juan Carlos", "  MARIA  DE   los " -> "Maria De Los".
 * Respeta el resto del texto tal cual se escribió.
 */
export const capitalizarNombres = (valor: unknown): string => {
  if (valor === undefined || valor === null) {
    return '';
  }
  const texto = String(valor).trim();
  if (!texto) {
    return '';
  }

  return texto
    .split(/\s+/)
    .map((palabra) => {
      if (!palabra) return palabra;
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(' ');
};

/** Aplica la normalización a los campos de tipo nombre/letras indicados. */
export const normalizarCamposNombres = (
  datos: Record<string, unknown>,
  campos: string[],
): Record<string, unknown> => {
  const resultado: Record<string, unknown> = { ...datos };
  campos.forEach((campo) => {
    if (resultado[campo] !== undefined && resultado[campo] !== null) {
      resultado[campo] = capitalizarNombres(resultado[campo]);
    }
  });
  return resultado;
};