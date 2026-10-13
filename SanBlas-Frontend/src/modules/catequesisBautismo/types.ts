export type EstadoCivilBautismo =
  | "soltero"
  | "matrimonio_catolico"
  | "union_civil"
  | "union_libre"
  | "divorciado";

export type CondicionBautismo =
  | "padre_madre"
  | "padrino_madrina"
  | "formacion_catequetica";

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

export const ETIQUETA_ESTADO_CIVIL: Record<EstadoCivilBautismo, string> = {
  soltero: "Soltero(a)",
  matrimonio_catolico: "Matrimonio católico",
  union_civil: "Unión civil",
  union_libre: "Unión libre",
  divorciado: "Divorciado(a)",
};

export const ETIQUETA_CONDICION: Record<CondicionBautismo, string> = {
  padre_madre: "Padre/Madre",
  padrino_madrina: "Padrino/Madrina",
  formacion_catequetica: "Formación catequética",
};

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
