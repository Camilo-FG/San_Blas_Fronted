export interface CrearInscripcionBackendRequest {
  datosInscripcion: {
    centroCatequesis: string;
    nivelAInscribirse: string;
    feBautismoArchivo: string;
  };
  datosCatequizando: {
    nombre: string;
    apellidos: string;
    fechaNacimiento: string;
    direccionExacta: string;
  };
  datosBautismo: {
    parroquia: string;
    fecha?: string | null;
    tomo?: string | null;
    folio?: string | null;
    asiento?: string | null;
  };
  datosAdecuacion: {
    requiereAdecuacionCentroEducativo: boolean;
    descripcionAdecuacion?: string | null;
  };
  datosCondicionSalud: {
    portadorEnfermedadCronica: boolean;
    descripcionEnfermedad?: string | null;
  };
  datosMadre: {
    nombre: string;
    apellidos: string;
    direccionExacta: string;
    ciudad: string;
    provincia: string;
    telefono: string;
  };
  datosPersonaInscribe: {
    nombre: string;
    apellidos: string;
    parentesco: string;
  };
  datosPago: {
    metodoPago: string;
    numeroComprobanteSinpe: string;
    comprobanteArchivo: string;
    monto: number;
  };
}

export interface InscripcionResumenBackend {
  id: number;
  nombreCatequizando: string;
  centroCatequesis: string;
  nivelAInscribirse: string;
  estado: string;
  fechaSolicitud: string;
  telefonoEncargada: string;
}

export interface InscripcionDetalleBackend {
  id: number;
  centroCatequesis: string;
  nivelAInscribirse: string;
  estado: string;
  fechaSolicitud: string;
  feBautismoArchivo: string;
  observacionAdministrativa?: string | null;
  catequizando: {
    nombre: string;
    apellidos: string;
    fechaNacimiento: string;
    direccionExacta: string;
  };
  bautismo: {
    parroquia: string;
    fecha?: string | null;
    tomo: string;
    folio: string;
    asiento: string;
  };
  adecuacion: {
    requiereAdecuacionCentroEducativo?: boolean | null;
    descripcionAdecuacion: string;
  };
  condicionSalud: {
    portadorEnfermedadCronica?: boolean | null;
    descripcionEnfermedad: string;
  };
  madre: {
    nombre: string;
    apellidos: string;
    direccionExacta: string;
    ciudad: string;
    provincia: string;
    telefono: string;
  };
  personaInscribe: {
    nombre: string;
    apellidos: string;
    parentesco: string;
  };
  pago: {
    metodoPago: string;
    numeroComprobanteSinpe: string;
    comprobanteArchivo: string;
    monto: number;
  };
}

export interface CrearInscripcionBackendResponse {
  id: number;
  mensaje: string;
  estado: string;
  fechaSolicitud: string;
}

export interface ActualizarEstadoBackendResponse {
  id: number;
  mensaje: string;
  estado: string;
  observacionAdministrativa?: string | null;
  fechaActualizacionEstado: string;
}
