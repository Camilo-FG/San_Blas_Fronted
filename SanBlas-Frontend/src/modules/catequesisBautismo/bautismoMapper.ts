import type { ProvinciaCostaRica } from "./types";
import type {
  CondicionBautismo,
  CrearInscripcionCatequesisBautismo,
  EstadoCivilBautismo,
} from "./types";
import type { FormularioCatequesisBautismo } from "./validarCatequesisBautismo";
import { PROVINCIAS_COSTA_RICA } from "./types";

const limpiar = (valor: string) => valor.trim();
const nuloSiVacio = (valor: string) => {
  const texto = valor.trim();
  return texto ? texto : null;
};

export function mapearFormularioBautismo(
  form: FormularioCatequesisBautismo,
): CrearInscripcionCatequesisBautismo {
  const provincia = PROVINCIAS_COSTA_RICA.includes(
    form.provincia as ProvinciaCostaRica,
  )
    ? (form.provincia as ProvinciaCostaRica)
    : PROVINCIAS_COSTA_RICA[0];

  return {
    nombre: limpiar(form.nombre),
    apellido1: limpiar(form.apellido1),
    apellido2: nuloSiVacio(form.apellido2),
    fechaNacimiento: form.fechaNacimiento,
    cedula: limpiar(form.cedula),
    tipoCedula: form.tipoCedula,
    nacionalidad: nuloSiVacio(form.nacionalidad),
    telefono: limpiar(form.telefono),
    estadoCivil: form.estadoCivil as EstadoCivilBautismo,
    parroquiaOrigen: limpiar(form.parroquiaOrigen),
    provincia,
    canton: limpiar(form.canton),
    distrito: limpiar(form.distrito),
    barrio: limpiar(form.barrio),
    condicion: form.condicion as CondicionBautismo,
  };
}
