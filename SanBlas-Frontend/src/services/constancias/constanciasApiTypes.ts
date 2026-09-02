export type EstadoConstancia = "pendiente" | "aprobada" | "rechazada";
export type EstadoSolicitudBackend = "Pendiente" | "Aprobado" | "Rechazado";

export interface FormSacraBackend {
  id: number;
  PrimerNombre: string;
  SegundoNombre?: string | null;
  PrimerApellido: string;
  SegundoApellido: string;
  Cedula: number;
  Correo: string;
  Telefono: number;
  Motivo: string;
  Estado?: string | null;
  comprobanteUrl?: string | null;
  FechaSolicitud?: string | null;
  Nombre?: string;
  TipoSacramento?: string;
}

export interface SolicitudesSacramentosResponseBackend {
  data: FormSacraBackend[];
  total: number;
}

export interface CrearConstanciaBackendRequest {
  PrimerNombre: string;
  SegundoNombre?: string;
  PrimerApellido: string;
  SegundoApellido: string;
  Cedula: number;
  Correo: string;
  Telefono: number;
  Motivo: string;
}
