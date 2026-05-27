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

export interface PagoInscripcionCatequesis {
  numeroComprobanteSINPE: string;
  archivoComprobante: File | string | null;
  fechaPago: string | null;
}

export interface InscripcionData {
  personaQueInscribe: {
    nombre: string | null;
    apellido: string | null;
  };
  parentesco: string | null;
  pago: PagoInscripcionCatequesis;
}

export interface LineamientosCatequesis {
  documentoLineamientos: boolean;
}

export interface CatequesisEnrollmentData {
  catequesis: CatequesisData;
  catequizando: CatequizandoData;
  madreCatequizando: MadreCatequizandoData;
  inscripcion: InscripcionData;
  lineamientosCatequesis: LineamientosCatequesis;
}

export type EstadoInscripcionCatequesis =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "requiere_modificacion";

export interface CatequesisEnrollmentRecord extends CatequesisEnrollmentData {
  id: number;
  codigoSolicitud: string;
  estado: EstadoInscripcionCatequesis;
  fechaSolicitud: string;
  observacionAdministrativa?: string | null;
  created_at?: string;
  updated_at?: string;
}
