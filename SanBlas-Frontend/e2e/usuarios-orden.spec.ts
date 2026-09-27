import { expect, test } from '@playwright/test';
import {
  capturarPeticionesUsuarios,
  nombresVisibles,
  USUARIOS_API_GLOB,
} from './helpers';

const TABLA = 'table tbody tr';

test('clic en un encabezado manda sortBy y sortDirection al backend', async ({
  page,
}) => {
  const peticiones = capturarPeticionesUsuarios(page);

  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  const encabezado = page.getByRole('columnheader', {
    name: 'Nombre de Usuario',
  });

  // primer clic → ascendente
  await encabezado.click();
  await expect
    .poll(() => peticiones.length, { timeout: 10_000 })
    .toBeGreaterThan(1);
  const primera = peticiones[peticiones.length - 1];
  expect(primera.searchParams.get('sortBy')).toBe('nombre');
  expect(primera.searchParams.get('sortDirection')).toBe('asc');
  // la flecha del encabezado refleja el estado
  await expect(encabezado).toContainText('↑');

  // segundo clic → descendente
  const trasPrimero = peticiones.length;
  await encabezado.click();
  await expect
    .poll(() => peticiones.length, { timeout: 10_000 })
    .toBeGreaterThan(trasPrimero);
  const segunda = peticiones[peticiones.length - 1];
  expect(segunda.searchParams.get('sortBy')).toBe('nombre');
  expect(segunda.searchParams.get('sortDirection')).toBe('desc');
  await expect(encabezado).toContainText('↓');
});

test('la fecha de creación usa el campo createdAt del backend', async ({
  page,
}) => {
  const peticiones = capturarPeticionesUsuarios(page);

  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  const antes = peticiones.length;
  await page.getByRole('columnheader', { name: 'Fecha de Creación' }).click();
  await expect
    .poll(() => peticiones.length, { timeout: 10_000 })
    .toBeGreaterThan(antes);

  const ultima = peticiones[peticiones.length - 1];
  // el id de columna de la tabla es creationDate; el backend espera createdAt
  expect(ultima.searchParams.get('sortBy')).toBe('createdAt');
  expect(ultima.searchParams.get('sortDirection')).not.toBe('');
});

test('el resto de columnas mapea al nombre que espera el backend', async ({
  page,
}) => {
  const peticiones = capturarPeticionesUsuarios(page);

  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  const casos: Array<[string, string]> = [
    ['Email', 'email'],
    ['Rol', 'role'],
    ['Estado', 'state'],
  ];

  for (const [encabezado, esperado] of casos) {
    const antes = peticiones.length;
    await page.getByRole('columnheader', { name: encabezado }).click();
    await expect
      .poll(() => peticiones.length, { timeout: 10_000 })
      .toBeGreaterThan(antes);
    expect(peticiones[peticiones.length - 1].searchParams.get('sortBy')).toBe(
      esperado,
    );
  }
});

test('la tabla pinta el orden del servidor sin reordenar en el cliente', async ({
  page,
}) => {
  // la clave de esta prueba: doy vuelta la respuesta. Si siguiera existiendo
  // getSortedRowModel, la tabla la reordenaría alfabéticamente y no coincidiría
  const respuestas: string[][] = [];

  await page.route(USUARIOS_API_GLOB, async (route) => {
    const respuesta = await route.fetch();
    const json = (await respuesta.json()) as {
      data?: Array<{ nombre?: string; userName?: string }>;
    };

    if (Array.isArray(json.data)) {
      const invertido = [...json.data].reverse();
      json.data = invertido;
      respuestas.push(
        invertido.map((u) => String(u.nombre ?? u.userName ?? '')),
      );
    }

    await route.fulfill({ response: respuesta, json });
  });

  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  const vistasAntes = respuestas.length;
  await page.getByRole('columnheader', { name: 'Nombre de Usuario' }).click();
  await expect
    .poll(() => respuestas.length, { timeout: 10_000 })
    .toBeGreaterThan(vistasAntes);

  const ordenDelServidor = respuestas[respuestas.length - 1];
  // si el cliente reordenara, acá explotaría
  await expect.poll(() => nombresVisibles(page)).toEqual(ordenDelServidor);
});

test('al clicar la misma columna la flecha alterna en vez de quedarse quieta', async ({
  page,
}) => {
  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  const fecha = page.getByRole('columnheader', { name: /Fecha de Creación/ });

  // por defecto el orden es createdAt desc → flecha hacia abajo
  await expect(fecha).toContainText('↓');

  // primer clic: asc
  await fecha.click();
  await expect(fecha).toContainText('↑');

  // segundo clic: vuelve a desc (sin pasar por "sin orden", que dejaba la flecha clavada)
  await fecha.click();
  await expect(fecha).toContainText('↓');
});

test('reordenar devuelve a la primera página', async ({ page }) => {
  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  const siguiente = page.getByRole('button', { name: 'Página siguiente' });
  const puedeAvanzar = await siguiente.isEnabled().catch(() => false);
  test.skip(!puedeAvanzar, 'Solo hay una página de usuarios en la base');

  await siguiente.click();
  await expect(page.getByText(/Página\s+2\s+de/)).toBeVisible();

  await page.getByRole('columnheader', { name: 'Email' }).click();
  await expect(page.getByText(/Página\s+1\s+de/)).toBeVisible();
});
