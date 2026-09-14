const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function mensajeErrorCorreo(valor: string): string | null {
  const correo = valor.trim();

  if (!correo) {
    return "El correo electrónico es obligatorio.";
  }

  if (!CORREO_REGEX.test(correo)) {
    return "Ingrese un correo electrónico válido.";
  }

  return null;
}
