import { TIPO_SACRAMENTO_LABEL, type TipoSacramento } from '../../../types/sacramentosNuevos';

const ORDEN: TipoSacramento[] = ['bautismo', 'comunion', 'confirmacion', 'matrimonio'];

// Revisa la cadena disponible: Editar usa actas persistidas y Agregar también valida las del lote antes de guardarlo.
export const requisitosFaltantes = (
  tipo: TipoSacramento,
  expediente?: Partial<Record<TipoSacramento, unknown>> | null,
): TipoSacramento[] => ORDEN.slice(0, ORDEN.indexOf(tipo)).filter((previo) => !expediente?.[previo]);

// Explica exactamente qué debe registrarse antes de continuar.
export const mensajePrerrequisitos = (tipo: TipoSacramento, faltantes: TipoSacramento[]): string =>
  faltantes.length
    ? `Debe registrar primero ${faltantes.map((previo) => TIPO_SACRAMENTO_LABEL[previo]).join(', ')} en este expediente antes de guardar ${TIPO_SACRAMENTO_LABEL[tipo]}.`
    : 'Espere a que se verifiquen los sacramentos previos antes de continuar.';
