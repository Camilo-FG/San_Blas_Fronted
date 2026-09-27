import { describe, expect, it } from 'vitest';
import {
  CAMPOS_ORDEN,
  MINIMO_CARACTERES_BUSQUEDA,
  ORDEN_POR_DEFECTO,
  ordenDesdeSorting,
  sortingDesdeOrden,
  textoABusqueda,
} from './usuariosBusqueda';

describe('textoABusqueda', () => {
  it('deja pasar el texto con al menos el mínimo de caracteres', () => {
    expect(textoABusqueda('ana')).toBe('ana');
    expect(textoABusqueda('ana perez')).toBe('ana perez');
    expect(textoABusqueda('ab')).toBe('ab');
    expect(MINIMO_CARACTERES_BUSQUEDA).toBe(2);
  });

  it('recorta espacios antes de medir', () => {
    expect(textoABusqueda('  ana  ')).toBe('ana');
    // con espacios el texto "sondeo" pero sin contenido real no busca
    expect(textoABusqueda('  a  ')).toBe('');
    expect(textoABusqueda('   ')).toBe('');
  });

  it('con menos del mínimo no se consulta (lista completa)', () => {
    expect(textoABusqueda('')).toBe('');
    expect(textoABusqueda('a')).toBe('');
    expect(textoABusqueda(' a ')).toBe('');
  });

  it('no revienta con basura que no sea texto', () => {
    expect(textoABusqueda(undefined)).toBe('');
    expect(textoABusqueda(null)).toBe('');
    expect(textoABusqueda(12345)).toBe('');
    expect(textoABusqueda({ toString: () => 'ana' })).toBe('');
  });

  it('conserva tildes y mayúsculas tal cual (el backend ya compara en lower)', () => {
    expect(textoABusqueda('José')).toBe('José');
    expect(textoABusqueda('  NICOLÁS ')).toBe('NICOLÁS');
  });
});

describe('CAMPOS_ORDEN', () => {
  it('cubre exactamente las columnas con datos de la tabla', () => {
    expect(Object.keys(CAMPOS_ORDEN).sort()).toEqual(
      ['creationDate', 'email', 'phoneNumber', 'role', 'state', 'userName'].sort(),
    );
  });

  it('ningún campo escapa de la whitelist del backend', () => {
    // el backend solo acepta estos valores; si acá aparece otro, el orden se cae al default
    const permitidos = [
      'nombre',
      'email',
      'telefono',
      'role',
      'state',
      'createdAt',
    ];
    for (const campo of Object.values(CAMPOS_ORDEN)) {
      expect(permitidos).toContain(campo);
    }
  });
});

describe('sortingDesdeOrden', () => {
  it('pinta la flecha de la columna que está ordenada', () => {
    expect(sortingDesdeOrden({ campo: 'nombre', direccion: 'asc' })).toEqual([
      { id: 'userName', desc: false },
    ]);
    expect(sortingDesdeOrden({ campo: 'nombre', direccion: 'desc' })).toEqual([
      { id: 'userName', desc: true },
    ]);
  });

  it('marca el orden por defecto en la fecha de creación descendente', () => {
    expect(sortingDesdeOrden(ORDEN_POR_DEFECTO)).toEqual([
      { id: 'creationDate', desc: true },
    ]);
  });

  it('si el campo no está en la whitelist no pinta ninguna flecha', () => {
    expect(
      sortingDesdeOrden({ campo: 'password', direccion: 'asc' }),
    ).toEqual([]);
    expect(sortingDesdeOrden({ campo: '', direccion: 'asc' })).toEqual([]);
  });
});

describe('ordenDesdeSorting', () => {
  it('traduce el clic al campo que espera el backend', () => {
    expect(ordenDesdeSorting([{ id: 'userName', desc: false }])).toEqual({
      campo: 'nombre',
      direccion: 'asc',
    });
    expect(ordenDesdeSorting([{ id: 'creationDate', desc: true }])).toEqual({
      campo: 'createdAt',
      direccion: 'desc',
    });
    expect(ordenDesdeSorting([{ id: 'phoneNumber', desc: true }])).toEqual({
      campo: 'telefono',
      direccion: 'desc',
    });
    expect(ordenDesdeSorting([{ id: 'state', desc: false }])).toEqual({
      campo: 'state',
      direccion: 'asc',
    });
  });

  it('sin columna ordenada vuelve al orden por defecto', () => {
    expect(ordenDesdeSorting([])).toEqual(ORDEN_POR_DEFECTO);
  });

  it('una columna que no se pueda mapear cae al default en vez de inventar un campo', () => {
    expect(ordenDesdeSorting([{ id: 'acciones', desc: false }])).toEqual(
      ORDEN_POR_DEFECTO,
    );
    expect(
      ordenDesdeSorting([{ id: 'nombre); DROP TABLE usuario; --', desc: false }]),
    ).toEqual(ORDEN_POR_DEFECTO);
  });

  it('solo mira el primer criterio (la tabla ordena por una columna)', () => {
    expect(
      ordenDesdeSorting([
        { id: 'userName', desc: false },
        { id: 'email', desc: true },
      ]),
    ).toEqual({ campo: 'nombre', direccion: 'asc' });
  });
});

describe('round-trip entre backend y tabla', () => {
  it('cualquier orden del servidor se puede pintar y regresar sin perderse', () => {
    const casos = [
      { campo: 'nombre', direccion: 'asc' as const },
      { campo: 'nombre', direccion: 'desc' as const },
      { campo: 'email', direccion: 'asc' as const },
      { campo: 'telefono', direccion: 'desc' as const },
      { campo: 'role', direccion: 'asc' as const },
      { campo: 'state', direccion: 'desc' as const },
      { campo: 'createdAt', direccion: 'desc' as const },
      { campo: 'createdAt', direccion: 'asc' as const },
    ];

    for (const orden of casos) {
      expect(ordenDesdeSorting(sortingDesdeOrden(orden))).toEqual(orden);
    }
  });

  it('el id que pinta la flecha siempre es una columna real de la tabla', () => {
    for (const orden of [
      { campo: 'nombre', direccion: 'asc' as const },
      { campo: 'createdAt', direccion: 'desc' as const },
      { campo: 'state', direccion: 'asc' as const },
    ]) {
      const [flecha] = sortingDesdeOrden(orden);
      expect(flecha).toBeDefined();
      expect(Object.keys(CAMPOS_ORDEN)).toContain(flecha!.id);
    }
  });
});
