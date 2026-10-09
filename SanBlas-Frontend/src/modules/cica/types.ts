export type EstadoCivilCica = "soltero" | "matrimonio_civil" | "union_libre";

export interface InscripcionCica {
  id: number;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  fechaNacimiento: string;
  cedula: string;
  nacionalidad: string;
  telefono: string;
  correo: string;
  estadoCivil: EstadoCivilCica;
  conyugeNombre: string | null;
  conyugeApellido1: string | null;
  conyugeApellido2: string | null;
  necesitaBautizo: boolean;
  necesitaPrimeraComunion: boolean;
  necesitaConfirmacion: boolean;
  padreNombre: string;
  padreApellido1: string;
  padreApellido2: string | null;
  madreNombre: string;
  madreApellido1: string;
  madreApellido2: string | null;
  direccionHogar: string;
  esCatolico: boolean;
  otraIglesia: string | null;
  observacion: string | null;
  estado: string;
  observacionAdministrativa: string | null;
  fechaSolicitud: string;
  fechaActualizacionEstado: string | null;
}

export interface CrearInscripcionCica {
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  fechaNacimiento: string;
  cedula: string;
  nacionalidad: string;
  telefono: string;
  correo: string;
  estadoCivil: EstadoCivilCica;
  conyugeNombre: string | null;
  conyugeApellido1: string | null;
  conyugeApellido2: string | null;
  necesitaBautizo: boolean;
  necesitaPrimeraComunion: boolean;
  necesitaConfirmacion: boolean;
  padreNombre: string;
  padreApellido1: string;
  padreApellido2: string | null;
  madreNombre: string;
  madreApellido1: string;
  madreApellido2: string | null;
  direccionHogar: string;
  esCatolico: boolean;
  otraIglesia: string | null;
  observacion: string | null;
}
