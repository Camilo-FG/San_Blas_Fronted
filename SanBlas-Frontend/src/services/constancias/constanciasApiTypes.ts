export type TipoSacramentoBackend =
  | "Bautismo"
  | "Confirmacion"
  | "Matrimonio";

export type TipoSacramentoBackendCode = 0 | 1 | 2;

export type EstadoConstancia = "Pendiente" | "Aprobado" | "Rechazado";

export interface FormSacraBackend {
  id: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  cedula: string;
  correo: string;
  telefono: string;
  tipoSacramento: TipoSacramentoBackend | TipoSacramentoBackendCode;
  motivo: string;
  estado?: string | null;
}

export interface CrearConstanciaBackendRequest {
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  cedula: string;
  correo: string;
  telefono: string;
  tipoSacramento: TipoSacramentoBackendCode;
  motivo: string;
}
