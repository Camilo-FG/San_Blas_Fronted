export type EstadoConstancia = "pendiente" | "aprobada" | "rechazada";

export interface FormSacraBackend {
  id: number;
  Nombre: string;
  PrimerApellido: string;
  SegundoApellido: string;
  Cedula: number;
  Correo: string;
  Telefono: number;
  TipoSacramento: string;
  Motivo: string;
  Estado?: string | null;
}

export interface CrearConstanciaBackendRequest {
  Nombre: string;
  PrimerApellido: string;
  SegundoApellido: string;
  Cedula: number;
  Correo: string;
  Telefono: number;
  TipoSacramento: string;
  Motivo: string;
}
