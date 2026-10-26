import type { FormularioCatequesisBautismo } from "./validarCatequesisBautismo";

// Orden visual de la inscripción pública; la certificación se valida aparte.
const SECCIONES = [
  { seccion: "Identificación", campos: [
    ["cedula", "La cédula es obligatoria."],
    ["nombre", "El nombre es obligatorio."],
    ["apellido1", "El primer apellido es obligatorio."],
    ["fechaNacimiento", "La fecha de nacimiento es obligatoria."],
    ["telefono", "El teléfono es obligatorio."],
  ] },
  { seccion: "Estado civil", campos: [["estadoCivil", "Seleccione el estado civil."]] },
  { seccion: "Condición", campos: [["condicion", "Seleccione su condición."]] },
  { seccion: "Procedencia", campos: [
    ["parroquiaOrigen", "La parroquia de origen es obligatoria."],
    ["provincia", "Seleccione una provincia."],
    ["canton", "Seleccione un cantón."],
    ["distrito", "Seleccione un distrito."],
    ["barrio", "El barrio es obligatorio."],
  ] },
] as const;

const requerido = (valor: string, mensaje: string): string | null =>
  valor.trim() ? null : mensaje;

export function obtenerFaltantesBautismo(form: FormularioCatequesisBautismo) {
  return SECCIONES.map(({ seccion, campos }) => ({
    seccion,
    campos: campos.flatMap(([campo, mensaje]) => {
      const error = requerido(form[campo], mensaje);
      return error ? [{ campo, mensaje: error }] : [];
    }),
  })).filter(({ campos }) => campos.length > 0);
}
