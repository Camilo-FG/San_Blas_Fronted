const MENSAJE_FORMATO =
  "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.";

export function mensajeErrorContrasena(valor: string): string | null {
  if (!valor) return "La contraseña es obligatoria.";
  if (valor.length > 64) return "La contraseña no puede superar 64 caracteres.";
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(valor)) {
    return MENSAJE_FORMATO;
  }
  return null;
}

export function mensajeErrorConfirmacion(
  confirmacion: string,
  contrasena: string,
): string | null {
  if (!confirmacion) return "Confirme la nueva contraseña.";
  if (confirmacion !== contrasena) return "Las contraseñas no coinciden.";
  return null;
}
