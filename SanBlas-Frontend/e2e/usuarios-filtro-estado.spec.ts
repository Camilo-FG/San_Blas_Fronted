import { expect, test } from '@playwright/test';
import { capturarPeticionesUsuarios } from './helpers';

const TABLA = 'table tbody tr';

const abrirFiltros = async (page: import('@playwright/test').Page) => {
  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();
  await page.getByRole('button', { name: 'Filtros' }).click();
};

// el select de Estado es el único que trae la opción "inactive"
const selectEstado = (page: import('@playwright/test').Page) =>
  page
    .locator('select')
    .filter({ has: page.locator('option[value="inactive"]') })
    .first();

test('el filtro de Estado trae solo cuentas inactivas', async ({ page }) => {
  const peticiones = capturarPeticionesUsuarios(page);

  await abrirFiltros(page);
  await selectEstado(page).selectOption('inactive');
  await page.getByRole('button', { name: 'Buscar' }).click();

  // la petición sí lleva el filtro al backend
  await expect
    .poll(
      () =>
        peticiones.filter((u) => u.searchParams.get('state') === 'inactive')
          .length,
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);

  // la 5ª columna de la tabla es el Estado
  const celdasEstado = page.locator('table tbody tr td:nth-child(5)');

  // esperamos a que la tabla termine de reflejar el filtro: si contamos las filas
  // antes de que llegue la respuesta filtrada, el total queda desfasado
  await expect
    .poll(
      async () => {
        const textos = await celdasEstado.allInnerTexts();
        if (textos.length === 0) return 'vacio';
        return textos.every((t) => t.trim() === 'Inactivo')
          ? 'todas-inactivas'
          : 'pendiente';
      },
      { timeout: 15_000 },
    )
    .toMatch(/todas-inactivas|vacio/);

  const total = await celdasEstado.count();
  test.skip(total === 0, 'La base no tiene cuentas inactivas');

  // ninguna fila devuelta debe verse como Inactiva (antes salía "Activo" siempre)
  for (let indice = 0; indice < total; indice += 1) {
    await expect(celdasEstado.nth(indice)).toHaveText('Inactivo');
  }
});

test('limpiar los filtros vuelve a traer las cuentas activas', async ({
  page,
}) => {
  await abrirFiltros(page);
  await selectEstado(page).selectOption('inactive');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator(TABLA).first()).toBeVisible();

  await page.getByRole('button', { name: /Limpiar/ }).click();

  // tras limpiar vuelve el estado por defecto (solo activos) y el badge es "Activo"
  const celdasEstado = page.locator('table tbody tr td:nth-child(5)');
  const total = await celdasEstado.count();
  test.skip(total === 0, 'La base no tiene cuentas que listar');
  await expect(celdasEstado.first()).toHaveText('Activo');
});
