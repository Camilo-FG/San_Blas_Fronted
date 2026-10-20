export const MOTIVO_RECHAZO_MINIMO = 5;
export const MOTIVO_RECHAZO_MAXIMO = 500;

// Devuelve el mensaje de error o null si el motivo es válido.
// Se usa tanto para el mensaje bajo el textarea como para bloquear el botón,
// así ambos siempre coinciden.
export function validarMotivoRechazo(motivo: string): string | null {
  const limpio = motivo.trim();
  if (!limpio) {
    return "La observación es obligatoria al rechazar.";
  }
  if (limpio.length < MOTIVO_RECHAZO_MINIMO) {
    return `El motivo debe tener al menos ${MOTIVO_RECHAZO_MINIMO} caracteres.`;
  }
  if (limpio.length > MOTIVO_RECHAZO_MAXIMO) {
    return `El motivo no puede superar los ${MOTIVO_RECHAZO_MAXIMO} caracteres.`;
  }
  return null;
}
