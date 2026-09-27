import { expect, test } from '@playwright/test';
import { USUARIOS_API_GLOB } from './helpers';

const TABLA = 'table tbody tr';

test('si el backend no responde muestra el error y permite reintentar', async ({
  page,
}) => {
  // corta la API de usuarios: simula caída de red o de servidor
  await page.route(USUARIOS_API_GLOB, (route) => route.abort('failed'));

  await page.goto('/dashboard/usuarios');

  // en vez de la tabla aparece el mensaje de error con su botón
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(TABLA)).toHaveCount(0);
  const reintentar = page.getByRole('button', { name: /Reintentar/ });
  await expect(reintentar).toBeVisible();

  // vuelve la conexión y el mismo botón recarga la lista
  await page.unroute(USUARIOS_API_GLOB);
  await reintentar.click();

  await expect(page.locator(TABLA).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('con la red cortada no quedan datos viejos haciéndose pasar por actuales', async ({
  page,
}) => {
  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  const filasAntes = await page.locator(TABLA).count();
  expect(filasAntes).toBeGreaterThan(0);

  // ahora se cae
  await page.route(USUARIOS_API_GLOB, (route) => route.abort('failed'));
  await page.getByRole('columnheader', { name: 'Email' }).click();

  await expect(page.getByRole('alert')).toBeVisible({ timeout: 20_000 });
  // la tabla desaparece: no se pintan resultados obsoletos como si fueran nuevos
  await expect(page.locator(TABLA)).toHaveCount(0);
});

test('el mensaje distingue que hubo un fallo y no un listado vacío', async ({
  page,
}) => {
  await page.route(USUARIOS_API_GLOB, (route) => route.abort('failed'));

  await page.goto('/dashboard/usuarios');

  const alerta = page.getByRole('alert');
  await expect(alerta).toBeVisible({ timeout: 20_000 });
  const texto = (await alerta.first().innerText()).trim();
  expect(texto.length).toBeGreaterThan(5);
  // no es el estado vacío normal de "No hay usuarios registrados"
  expect(texto).not.toMatch(/^No hay usuarios registrados$/);
});
