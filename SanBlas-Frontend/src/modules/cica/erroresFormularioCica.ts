// Orden visual del formulario: también determina el orden del resumen.
const SECCIONES_CICA = [
  { seccion: "Identificación", campos: ["tipoCedula", "cedula", "nombre", "apellido1", "apellido2", "fechaNacimiento", "nacionalidad", "telefono", "correo"] },
  { seccion: "Estado civil", campos: ["estadoCivil", "conyugeNombre", "conyugeApellido1", "conyugeApellido2"] },
  { seccion: "Sacramentos", campos: ["sacramentos"] },
  { seccion: "Padres y hogar", campos: ["padreNombre", "padreApellido1", "padreApellido2", "madreNombre", "madreApellido1", "madreApellido2", "provincia", "canton", "distrito", "direccionHogar"] },
  { seccion: "Religión", campos: ["esCatolico", "otraIglesia"] },
  { seccion: "Observación", campos: ["observacion"] },
] as const;

export function agruparErroresCica(errores: Record<string, string>) {
  return SECCIONES_CICA.map(({ seccion, campos }) => ({
    seccion,
    campos: campos
      .filter((campo) => Boolean(errores[campo]))
      .map((campo) => ({ campo, mensaje: errores[campo] })),
  })).filter(({ campos }) => campos.length > 0);
}
