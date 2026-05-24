export type RegistroBautismo = {
  id: number;
  Nombre: string;
  cedula: number;
  PrimerApellido: string;
  SegundoApellido: string;
  NombreParroquia: string;
  FechaBautismo: string;
  AnnioBautismo: number;
  Prebispero: string;
  fechaNacimiento: string;
  horaNacimiento: string;
  NombreAbuelosPaternos: string;
  NombreAbuelosMaternos: string;
}

export type RegistroComunion = {
  id: number;
  Nombre: string;
  DiaComunion: string;
  MesComunion: string;
  AnnioComunion: number;
  LugarComunion: string;
}

export type RegistroConfirmacion = {
  id: number;
  Nombre: string;
  DiaConfirmacion: string;
  MesConfirmacion: string;
  AnnioConfirmacion: number;
  LugarConfirmacion: string;
}
export type RegistroMatrimonio = {
  id: number;
  NombreContrayente: string;
  NombreContrayente2: string;
  DiaMatrimonio: string;
  MesMatrimonio: string;
  AnnioMatrimonio: number;
 LugarMatrimonio: string;
 Tomo: number;
 Folio: number;
} 