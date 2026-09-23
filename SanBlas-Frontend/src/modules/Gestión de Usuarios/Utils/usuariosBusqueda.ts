import type { OrdenUsuarios } from '../services/userServices';

// mínimo de caracteres antes de mandar una búsqueda al servidor
// (con menos no se consulta: evita un request por cada tecla suelta)
export const MINIMO_CARACTERES_BUSQUEDA = 2;

// id de columna de tanstack → nombre de campo que espera el backend (sortBy)
export const CAMPOS_ORDEN: Record<string, string> = {
  userName: 'nombre',
  email: 'email',
  phoneNumber: 'telefono',
  role: 'role',
  state: 'state',
  creationDate: 'createdAt',
};

// el orden con el que arranca la tabla: más reciente primero (igual que el backend)
export const ORDEN_POR_DEFECTO: OrdenUsuarios = {
  campo: 'createdAt',
  direccion: 'desc',
};

// lo que se manda al backend según lo que el usuario escribió.
// vacío o de un solo carácter = sin filtro, así se trae la lista completa
export function textoABusqueda(texto: unknown): string {
  if (typeof texto !== 'string') return '';
  const limpio = texto.trim();
  return limpio.length >= MINIMO_CARACTERES_BUSQUEDA ? limpio : '';
}

// convierte el orden del servidor en el estado de sorting que pinta la flecha.
// campo que no esté en la whitelist ⇒ sin orden visible (no inventamos columnas)
export function sortingDesdeOrden(
  orden: OrdenUsuarios,
): { id: string; desc: boolean }[] {
  const entrada = Object.entries(CAMPOS_ORDEN).find(
    ([, campo]) => campo === orden.campo,
  );
  if (!entrada) return [];
  return [{ id: entrada[0], desc: orden.direccion === 'desc' }];
}

// convierte el clic en un encabezado en el orden que va al backend.
// sin columna (tercer clic) o con un id que no se pueda mapear ⇒ volvemos al default
export function ordenDesdeSorting(
  sorting: readonly { id: string; desc?: boolean }[],
): OrdenUsuarios {
  const primero = sorting[0];
  if (!primero) return ORDEN_POR_DEFECTO;

  const campo = CAMPOS_ORDEN[primero.id];
  if (!campo) return ORDEN_POR_DEFECTO;

  return { campo, direccion: primero.desc ? 'desc' : 'asc' };
}
