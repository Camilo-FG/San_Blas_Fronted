import type { FormularioCica } from "./validarCica";
import type { CrearInscripcionCica, EstadoCivilCica } from "./types";

const limpiar = (valor: string) => valor.trim();
const nuloSiVacio = (valor: string) => {
  const texto = valor.trim();
  return texto ? texto : null;
};

export function mapearFormularioCica(form: FormularioCica): CrearInscripcionCica {
  const esSoltero = form.estadoCivil === "soltero";
  const esCatolico = form.esCatolico === "si";

  return {
    nombre: limpiar(form.nombre),
    apellido1: limpiar(form.apellido1),
    apellido2: nuloSiVacio(form.apellido2),
    fechaNacimiento: form.fechaNacimiento,
    cedula: limpiar(form.cedula),
    tipoCedula: form.tipoCedula,
    nacionalidad: limpiar(form.nacionalidad),
    telefono: limpiar(form.telefono),
    correo: limpiar(form.correo),
    estadoCivil: form.estadoCivil as EstadoCivilCica,
    conyugeNombre: esSoltero ? null : limpiar(form.conyugeNombre),
    conyugeApellido1: esSoltero ? null : limpiar(form.conyugeApellido1),
    conyugeApellido2: esSoltero ? null : nuloSiVacio(form.conyugeApellido2),
    necesitaBautizo: form.necesitaBautizo,
    necesitaPrimeraComunion: form.necesitaPrimeraComunion,
    necesitaConfirmacion: form.necesitaConfirmacion,
    padreNombre: limpiar(form.padreNombre),
    padreApellido1: limpiar(form.padreApellido1),
    padreApellido2: nuloSiVacio(form.padreApellido2),
    madreNombre: limpiar(form.madreNombre),
    madreApellido1: limpiar(form.madreApellido1),
    madreApellido2: nuloSiVacio(form.madreApellido2),
    direccionHogar: limpiar(form.direccionHogar),
    esCatolico,
    otraIglesia: esCatolico ? null : limpiar(form.otraIglesia),
    observacion: nuloSiVacio(form.observacion),
  };
}
