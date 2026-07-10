// Types/catequesis.ts

export interface CatequesisData {
  centroCatequesis: string | null;
  nivelAInscribirse: string | null;
  feBautismoArchivo: File | string | null;
}

export interface AdecuacionCatequizando {
  requiereAdecuacionCentroEducativo: boolean | null;
  descripcionAdecuacion: string | null;
}

export interface CondicionSaludCatequizando {
  portadorEnfermedadCronica: boolean | null;
  descripcionEnfermedad: string | null;
}

export interface CatequizandoData {
  nombre: string;
  apellidos: string;
  fechaNacimiento: string | null;
  direccion: {
    direccionExacta: string | null;
  };
  bautismo: {
    parroquia: string | null;
    fecha: string | null;
    tomo: string | null;
    folio: string | null;
    asiento: string | null;
  };
  adecuacion: AdecuacionCatequizando;
  condicionSalud: CondicionSaludCatequizando;
}

/* Tipo usado internamente por el formulario de inscripción. */
export interface MadreCatequizandoData {
  nombre: string;
  apellidos: string;
  direccion: {
    direccionExacta: string | null;
    ciudad: string | null;
    provincia: string | null;
  };
  telefono: string;
}

export interface PadreCatequizandoData {
  nombre: string;
  apellidos: string;
  telefono: string;
}

export interface PagoInscripcionCatequesis {
  numeroComprobanteSINPE: string;
  archivoComprobante: File | string | null;
  fechaPago: string | null;
}

export interface InscripcionData {
  personaQueInscribe: {
    nombre: string | null;
    apellido: string | null;
    correo: string | null;
  };
  parentesco: string | null;
  pago: PagoInscripcionCatequesis;
}

/* Estado interno del formulario (lineamientos se manejan aparte). */
export interface CatequesisEnrollmentData {
  catequesis: CatequesisData;
  catequizando: CatequizandoData;
  madreCatequizando: MadreCatequizandoData;
  padreCatequizando: PadreCatequizandoData;
  inscripcion: InscripcionData;
}

/* Tipos usados por el dashboard de gestión de solicitudes. */
export interface EncargadoCatequesisData {
  nombre: string;
  apellidos: string;
  cedula: string;
  telefono: string;
  correo: string;
  direccion: {
    direccionExacta: string | null;
  };
  parentesco: string;
}

export interface PagoCatequesisData {
  metodoPago: string;
  numeroComprobante: string;
  monto: number;
  comprobanteArchivo: File | string | null;
}

export type EstadoInscripcionCatequesis =
  | "pendiente"
  | "aprobado"
  | "aprobada"
  | "rechazado"
  | "rechazada"
  | "requiere_modificacion"
  | "Pendiente"
  | "Aprobado"
  | "Aprobada"
  | "Rechazado"
  | "Rechazada";

export interface CatequesisEnrollmentRecord {
  id: number;
  codigoSolicitud: string;
  estado: EstadoInscripcionCatequesis;
  fechaSolicitud: string;

  catequesis: CatequesisData;
  catequizando: CatequizandoData;
  madreCatequizando?: MadreCatequizandoData;
  padreCatequizando?: PadreCatequizandoData;
  personaInscribe?: {
    nombre: string;
    apellidos: string;
    parentesco: string;
    correo: string;
  };
  encargado: EncargadoCatequesisData;
  pago: PagoCatequesisData;

  observaciones?: string | null;
  observacionAdministrativa?: string | null;
  created_at?: string;
  updated_at?: string;
}
