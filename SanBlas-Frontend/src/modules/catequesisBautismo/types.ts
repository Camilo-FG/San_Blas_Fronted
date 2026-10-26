import type { TipoCedula } from "../../shared/utils/cedulaIdentificacion";

import type { EstadoCivilBautismo } from "./estadosCivilesBautismo";
import type { CondicionBautismo } from "./condicionesBautismo";
export type { EstadoCivilBautismo } from "./estadosCivilesBautismo";
export type { CondicionBautismo } from "./condicionesBautismo";
export { ETIQUETA_ESTADO_CIVIL } from "./estadosCivilesBautismo";
export { ETIQUETA_CONDICION } from "./condicionesBautismo";

export const PROVINCIAS_COSTA_RICA = [
  "San José",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limón",
] as const;

export type ProvinciaCostaRica = (typeof PROVINCIAS_COSTA_RICA)[number];


export interface InscripcionCatequesisBautismo {
  id: number;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  fechaNacimiento: string;
  cedula: string;
  telefono: string;
  estadoCivil: EstadoCivilBautismo;
  parroquiaOrigen: string;
  provincia: string;
  canton: string;
  distrito: string;
  barrio: string;
  condicion: CondicionBautismo;
  estado: string;
  observacionAdministrativa: string | null;
  fechaInicioCatequesis: string | null;
  fechaFinalizacionCatequesis: string | null;
  responsableCertifica: string | null;
  fechaSolicitud: string;
  fechaActualizacionEstado: string | null;
}

export interface CrearInscripcionCatequesisBautismo {
  tipoCedula: TipoCedula;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  fechaNacimiento: string;
  cedula: string;
  telefono: string;
  estadoCivil: EstadoCivilBautismo;
  parroquiaOrigen: string;
  provincia: ProvinciaCostaRica;
  canton: string;
  distrito: string;
  barrio: string;
  condicion: CondicionBautismo;
}

export interface CertificarCatequesisBautismo {
  fechaInicioCatequesis: string;
  fechaFinalizacionCatequesis: string;
  responsableCertifica: string;
}
