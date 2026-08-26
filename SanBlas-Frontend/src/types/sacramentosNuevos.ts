export type TipoSacramento = 'bautismo' | 'comunion' | 'confirmacion' | 'matrimonio';

export type ParentescoAbuelo =
  | 'abuelo_paterno'
  | 'abuela_paterna'
  | 'abuelo_materno'
  | 'abuela_materna';

// Datos básicos de una persona tal como llega del backend.
export interface PersonaDetalle {
  id: number;
  cedula: string | null;
  nombre: string;
  primerApellido: string;
  segundoApellido: string | null;
  nacionalidad: string | null;
}

// Item del listado resumido (una fila por sacramento).
export interface SacramentoListaItem {
  id: number;
  tipo: TipoSacramento;
  nombre: string;
  cedula: string | null;
  fecha: string;
  fechaRegistro?: string;
  parroquia: string;
}

export interface SacramentoListaResponse {
  items: SacramentoListaItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BuscarSacramentosParams {
  nombre?: string;
  apellido?: string;
  cedula?: string;
  tipo?: TipoSacramento;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'fecha' | 'nombre' | 'tipo';
  sortDirection?: 'asc' | 'desc';
}

export interface AbueloDetalle extends PersonaDetalle {
  parentesco: ParentescoAbuelo;
}

export interface DetalleBautismo {
  bautizado: PersonaDetalle;
  padre: PersonaDetalle | null;
  madre: PersonaDetalle | null;
  padrino: PersonaDetalle | null;
  madrina: PersonaDetalle | null;
  declarante: PersonaDetalle | null;
  abuelos: AbueloDetalle[];
  fechaNacimiento: string | null;
  horaNacimiento: string | null;
  lugarNacimiento: string | null;
  reconocimientoLegal: string | null;
  libro: string | null;
  tomo: string | null;
  folio: string | null;
  asiento: string | null;
  firmaParroco: string | null;
}

export interface DetallePersonaSacramento {
  persona: PersonaDetalle;
}

export interface DetalleMatrimonio {
  contrayente1: PersonaDetalle;
  contrayente2: PersonaDetalle;
  libro: string | null;
  tomo: string | null;
  folio: string | null;
  asiento: string | null;
  firmaParroco: string | null;
}

export interface ParroquiaDetalle {
  id: number;
  nombre: string;
  barrio: string | null;
  distrito: string | null;
  canton: string | null;
  provincia: string | null;
}

export interface PresbiteroDetalle {
  id: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string | null;
}

export interface SacramentoDetalle {
  id: number;
  tipo: TipoSacramento;
  fechaSacramento: string;
  observaciones: string | null;
  parroquia: ParroquiaDetalle;
  presbitero: PresbiteroDetalle | null;
  detalle: DetalleBautismo | DetallePersonaSacramento | DetalleMatrimonio;
}

// Todos los sacramentos de una persona, agrupados por tipo.
export interface PersonaSacramental {
  persona: PersonaDetalle;
  bautismo: SacramentoDetalle | null;
  comunion: SacramentoDetalle | null;
  confirmacion: SacramentoDetalle | null;
  matrimonio: SacramentoDetalle | null;
}

// ── DTOs de creación/actualización (personas se envían por nombre/cédula) ──

export interface PersonaInput {
  cedula?: string;
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
  nacionalidad?: string;
}

export interface AbueloInput extends PersonaInput {
  parentesco: ParentescoAbuelo;
}

export interface BautismoInput {
  bautizado: PersonaInput;
  padre?: PersonaInput;
  madre?: PersonaInput;
  padrino?: PersonaInput;
  madrina?: PersonaInput;
  declarante?: PersonaInput;
  abuelos?: AbueloInput[];
  fechaNacimiento?: string;
  horaNacimiento?: string;
  lugarNacimiento?: string;
  reconocimientoLegal?: string;
  libro?: string;
  tomo?: string;
  folio?: string;
  asiento?: string;
  firmaParroco?: string;
}

export interface PersonaDetalleInput {
  persona: PersonaInput;
}

export interface MatrimonioInput {
  contrayente1: PersonaInput;
  contrayente2: PersonaInput;
  libro?: string;
  tomo?: string;
  folio?: string;
  asiento?: string;
  firmaParroco?: string;
}

export interface CrearSacramentoInput {
  tipo: TipoSacramento;
  idParroquia: number;
  idPresbitero?: number;
  fechaSacramento: string;
  observaciones?: string;
  bautismo?: BautismoInput;
  comunion?: PersonaDetalleInput;
  confirmacion?: PersonaDetalleInput;
  matrimonio?: MatrimonioInput;
}

export type ActualizarSacramentoInput = Partial<CrearSacramentoInput>;

// Catálogos para los selectores del formulario.
export interface ParroquiaCatalogo {
  id: number;
  nombre: string;
  canton: string | null;
  provincia: string | null;
}

export interface PresbiteroCatalogo {
  id: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string | null;
}

// Utilidades de presentación
export const TIPO_SACRAMENTO_LABEL: Record<TipoSacramento, string> = {
  bautismo: 'Bautismo',
  comunion: 'Comunión',
  confirmacion: 'Confirmación',
  matrimonio: 'Matrimonio',
};