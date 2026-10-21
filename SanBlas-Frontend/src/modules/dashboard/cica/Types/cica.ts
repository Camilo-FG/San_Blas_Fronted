export type EstadoSolicitudCica =
  | "pendiente"
  | "aprobado"
  | "aprobada"
  | "rechazado"
  | "rechazada"
  | "modificacion_solicitada"
  | "modificacion"
  | "en_modificacion"
  | "Pendiente"
  | "Aprobado"
  | "Aprobada"
  | "Rechazado"
  | "Rechazada";

export interface AdultoCicaData {
  nombre?: string | null;
  apellidos?: string | null;
  cedula?: string | null;
  fechaNacimiento?: string | null;
  estadoCivil?: string | null;
  religion?: string | null;
}

export interface ConyugeCicaData {
  nombre?: string | null;
  apellidos?: string | null;
}

export interface SacramentosCicaData {
  bautismo?: boolean | string | null;
  confirmacion?: boolean | string | null;
  eucaristia?: boolean | string | null;
  detalle?: string | null;
}

export interface PadreCicaData {
  nombre?: string | null;
  apellidos?: string | null;
}

export interface DireccionCicaData {
  direccionExacta?: string | null;
  barrio?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
}

export interface CicaSolicitudRecord {
  id: number;
  codigoSolicitud?: string | null;
  estado: EstadoSolicitudCica;
  fechaSolicitud: string;
  fechaActualizacionEstado?: string | null;

  adulto?: AdultoCicaData | null;
  conyuge?: ConyugeCicaData | null;
  sacramentos?: SacramentosCicaData | null;
  padre?: PadreCicaData | null;
  madre?: PadreCicaData | null;
  direccion?: DireccionCicaData | null;
  parroquia?: string | null;
  condicion?: string | null;
  religion?: string | null;
  observaciones?: string | null;
  firma?: File | string | null;

  observacionAdministrativa?: string | null;
  motivo?: string | null;
  created_at?: string;
  updated_at?: string;
}
