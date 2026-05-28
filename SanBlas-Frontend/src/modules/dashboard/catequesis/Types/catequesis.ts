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

export interface EncargadoCatequizandoData {
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
  codigoSolicitud?: string;
  estado: EstadoInscripcionCatequesis;
  fechaSolicitud: string;

  catequesis: CatequesisData;
  catequizando: CatequizandoData;
  encargado: EncargadoCatequizandoData;
  pago: PagoCatequesisData;

  observaciones?: string | null;
  observacionAdministrativa?: string | null;
  created_at?: string;
  updated_at?: string;
}
