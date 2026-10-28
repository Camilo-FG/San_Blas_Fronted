import type { CondicionBautismo, EstadoCivilBautismo } from "./types";
import { PROVINCIAS_COSTA_RICA } from "./types";
import { obtenerFaltantesBautismo } from "./faltantesBautismo";
import { ESTADOS_CIVILES_BAUTISMO } from "./estadosCivilesBautismo";
import { CONDICIONES_BAUTISMO } from "./condicionesBautismo";
import { validarCedulaIdentificacion, type TipoCedula } from "../../shared/utils/cedulaIdentificacion";

export const MAX_NOMBRE_BAUTISMO = 25;
export const MAX_APELLIDO_BAUTISMO = 25;
export const MAX_NACIONALIDAD_BAUTISMO = 25;

export const TELEFONO_BAUTISMO = /^[1-9]\d{3}-\d{4}$/;
const LETRAS_CON_ESPACIO = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const LETRAS_SIN_ESPACIO = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/;

export const filtrarNombreBautismo = (valor: string) =>
  valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, MAX_NOMBRE_BAUTISMO);

export const filtrarApellidoBautismo = (valor: string) =>
  valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "").slice(0, MAX_APELLIDO_BAUTISMO);

// La nacionalidad admite letras y espacios: "Costarricense", "Nicaragüense", etc.
export const filtrarNacionalidadBautismo = (valor: string) =>
  valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, MAX_NACIONALIDAD_BAUTISMO);

export const filtrarTelefonoBautismo = (valor: string) => {
  const soloNumeros = valor.replace(/\D/g, "").replace(/^0+/, "").slice(0, 8);
  return soloNumeros.length > 4
    ? `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4)}`
    : soloNumeros;
};

export type FormularioCatequesisBautismo = {
  nombre: string;
  apellido1: string;
  apellido2: string;
  fechaNacimiento: string;
  cedula: string;
  tipoCedula: TipoCedula;
  nacionalidad: string;
  telefono: string;
  estadoCivil: EstadoCivilBautismo | "";
  parroquiaOrigen: string;
  provincia: string;
  canton: string;
  distrito: string;
  barrio: string;
  condicion: CondicionBautismo | "";
};

const mensajeNombre = (
  valor: string,
  etiqueta: string,
  obligatorio: boolean,
  espacios: boolean,
) => {
  const texto = valor.trim();
  const maximo = espacios ? MAX_NOMBRE_BAUTISMO : MAX_APELLIDO_BAUTISMO;
  if (!texto) return obligatorio ? `${etiqueta} es obligatorio.` : null;
  const patron = espacios ? LETRAS_CON_ESPACIO : LETRAS_SIN_ESPACIO;
  if (!patron.test(texto)) return `${etiqueta} solo puede contener letras.`;
  if (texto.length > maximo) {
    return `${etiqueta} no puede superar los ${maximo} caracteres.`;
  }
  return null;
};

export const mensajeFechaNacimientoBautismo = (valor: string): string | null => {
  if (!valor) return "La fecha de nacimiento es obligatoria.";
  const nacimiento = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) {
    return "La fecha de nacimiento no es válida.";
  }
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (nacimiento > hoy) return "La fecha de nacimiento no puede ser futura.";
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
  if (edad < 18) return "Debe tener al menos 18 años para inscribirse.";
  return null;
};

export const validarFormularioCatequesisBautismo = (
  form: FormularioCatequesisBautismo,
): Record<string, string> => {
  const errores: Record<string, string> = {};
  const poner = (campo: string, mensaje: string | null) => {
    if (mensaje) errores[campo] = mensaje;
  };

  poner("nombre", mensajeNombre(form.nombre, "El nombre", true, true));
  poner("apellido1", mensajeNombre(form.apellido1, "El primer apellido", true, false));
  poner("apellido2", mensajeNombre(form.apellido2, "El segundo apellido", false, false));
  poner("fechaNacimiento", mensajeFechaNacimientoBautismo(form.fechaNacimiento));

  poner("cedula", validarCedulaIdentificacion(form.cedula, form.tipoCedula));

  // La nacionalidad es opcional; si se indica, solo letras y espacios.
  poner(
    "nacionalidad",
    mensajeNombre(form.nacionalidad, "La nacionalidad", false, true)?.replace(
      "es obligatorio.",
      "es obligatoria.",
    ) ?? null,
  );

  if (!form.telefono.trim()) errores.telefono = "El teléfono es obligatorio.";
  else if (!TELEFONO_BAUTISMO.test(form.telefono.trim()))
    errores.telefono = "El formato debe ser 8888-8888.";

  if (!form.estadoCivil.trim()) errores.estadoCivil = "Seleccione el estado civil.";
  else if (!ESTADOS_CIVILES_BAUTISMO.includes(form.estadoCivil as EstadoCivilBautismo))
    errores.estadoCivil = "Seleccione un estado civil válido.";
  poner(
    "parroquiaOrigen",
    mensajeNombre(form.parroquiaOrigen, "La parroquia de origen", true, true)?.replace(
      "es obligatorio.",
      "es obligatoria.",
    ) ?? null,
  );

  if (!form.provincia.trim()) {
    errores.provincia = "Seleccione una provincia.";
  } else if (
    !PROVINCIAS_COSTA_RICA.includes(
      form.provincia as (typeof PROVINCIAS_COSTA_RICA)[number],
    )
  ) {
    errores.provincia = "Seleccione una provincia válida.";
  }

  if (!form.canton.trim()) errores.canton = "Seleccione un cantón.";
  if (!form.distrito.trim()) errores.distrito = "Seleccione un distrito.";
  poner("barrio", mensajeNombre(form.barrio, "El barrio", true, true));
  if (!form.condicion.trim()) errores.condicion = "Seleccione su condición.";
  else if (!CONDICIONES_BAUTISMO.includes(form.condicion as CondicionBautismo))
    errores.condicion = "Seleccione una condición válida.";

  // Priorizar el mensaje de obligatorio sobre el de formato si solo hay espacios.
  for (const { campos } of obtenerFaltantesBautismo(form)) {
    for (const { campo, mensaje } of campos) errores[campo] = mensaje;
  }
  return errores;
};

export const validarCertificacion = (datos: {
  fechaInicioCatequesis: string;
  fechaFinalizacionCatequesis: string;
  responsableCertifica: string;
}): Record<string, string> => {
  const errores: Record<string, string> = {};
  if (!datos.fechaInicioCatequesis) {
    errores.fechaInicioCatequesis = "Indique el inicio de las catequesis.";
  }
  if (!datos.fechaFinalizacionCatequesis) {
    errores.fechaFinalizacionCatequesis = "Indique la finalización de las catequesis.";
  }
  if (
    datos.fechaInicioCatequesis &&
    datos.fechaFinalizacionCatequesis &&
    datos.fechaFinalizacionCatequesis < datos.fechaInicioCatequesis
  ) {
    errores.fechaFinalizacionCatequesis =
      "La finalización debe ser igual o posterior al inicio.";
  }
  const responsable = datos.responsableCertifica.trim();
  if (!responsable) {
    errores.responsableCertifica = "Indique el responsable que certifica.";
  } else if (!LETRAS_CON_ESPACIO.test(responsable)) {
    errores.responsableCertifica = "El responsable solo puede contener letras.";
  } else if (responsable.length > MAX_NOMBRE_BAUTISMO) {
    errores.responsableCertifica =
      "El responsable no puede superar los 25 caracteres.";
  }
  return errores;
};
