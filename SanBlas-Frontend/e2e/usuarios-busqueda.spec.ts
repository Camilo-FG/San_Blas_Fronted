import { expect, test } from '@playwright/test';
import { capturarPeticionesUsuarios, conSearch, sinSearch } from './helpers';

const TABLA = 'table tbody tr';
const ESPERA_DEBOUNCE_MS = 900;

const buscar = (page: import('@playwright/test').Page) =>
  page.getByLabel('Buscar usuarios');

test('no consulta con menos de dos caracteres', async ({ page }) => {
  const peticiones = capturarPeticionesUsuarios(page);

  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  const antes = peticiones.length;
  await buscar(page).fill('a');

  // bastante más que el debounce: si igual no manda nada, la regla se cumple
  await page.waitForTimeout(ESPERA_DEBOUNCE_MS);
  expect(conSearch(peticiones.slice(antes), 'a')).toHaveLength(0);

  // y con dos sí consulta
  await buscar(page).fill('an');
  await expect
    .poll(() => conSearch(peticiones, 'an').length, { timeout: 10_000 })
    .toBeGreaterThan(0);
});

test('espera a dejar de escribir antes de consultar (debounce)', async ({
  page,
}) => {
  const peticiones = capturarPeticionesUsuarios(page);

  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  const input = buscar(page);

  // medimos cuánto tarda la petición desde que escribimos: es inmune a que la
  // máquina esté lenta, mientras que un "esperar 250ms y mirar" no lo es
  const inicio = Date.now();
  await input.fill('ana');

  await expect
    .poll(() => conSearch(peticiones, 'ana').length, { timeout: 10_000 })
    .toBeGreaterThan(0);
  const transcurrido = Date.now() - inicio;

  // el hook espera 400ms; con holgura exigimos al menos 300ms.
  // si el debounce no existiera, la petición saldría al instante y esto revienta
  expect(transcurrido).toBeGreaterThanOrEqual(300);

  await expect(input).toHaveValue('ana');
});

test('Enter dispara la búsqueda sin esperar el debounce', async ({ page }) => {
  const peticiones = capturarPeticionesUsuarios(page);

  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  const input = buscar(page);
  await input.fill('bet');
  await input.press('Enter');

  // si tuviera que esperar los 400ms este timeout tan corto fallaría
  await expect
    .poll(() => conSearch(peticiones, 'bet').length, { timeout: 1500 })
    .toBeGreaterThan(0);
});

test('vaciar el campo vuelve a traer la lista completa', async ({ page }) => {
  const peticiones = capturarPeticionesUsuarios(page);

  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  const input = buscar(page);
  await input.fill('bet');
  await expect
    .poll(() => conSearch(peticiones, 'bet').length, { timeout: 10_000 })
    .toBeGreaterThan(0);

  const sinFiltroAntes = sinSearch(peticiones).length;
  await input.fill('');
  await expect
    .poll(() => sinSearch(peticiones).length, { timeout: 10_000 })
    .toBeGreaterThan(sinFiltroAntes);

  await expect(input).toHaveValue('');
  await expect(page.locator(TABLA).first()).toBeVisible();
});

test('mientras carga con datos previos muestra el spinner y aria-busy', async ({
  page,
}) => {
  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  // retraso solo a partir de acá, para que haya datos viejos en pantalla
  await page.route('http://localhost:3000/usuario*', async (route) => {
    await new Promise((resolver) => setTimeout(resolver, 1200));
    await route.continue();
  });

  await page.getByRole('button', { name: 'Filtros' }).click();
  const input = buscar(page);
  await input.fill('an');
  await input.press('Enter');

  // el spinner nuevo: el loader de "Cargando..." solo sale con tabla vacía
  await expect(page.getByText('Buscando usuarios...')).toBeVisible({
    timeout: 6000,
  });
  await expect(page.locator('[aria-busy="true"]').first()).toBeVisible();

  // el botón Buscar queda deshabilitado mientras consulta
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeDisabled();

  // y al terminar el spinner desaparece
  await expect(page.getByText('Buscando usuarios...')).toBeHidden({
    timeout: 10_000,
  });
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeEnabled();
});
