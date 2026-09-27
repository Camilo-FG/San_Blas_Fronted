import { expect, test, type Page } from '@playwright/test';
import { API_BASE } from './helpers';

// recoge errores de consola y fallos de red de la API mientras se visita la página
const vigilarErrores = (page: Page) => {
  const errores: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const texto = msg.text();
    // ruido de siempre del navegador, no de la app
    if (/favicon|Download the React DevTools/i.test(texto)) return;
    errores.push(texto);
  });

  page.on('pageerror', (err) => errores.push(String(err)));
  page.on('requestfailed', (req) => {
    // solo nos importan las caídas de la API, no de imágenes o fuentes
    if (req.url().includes(API_BASE)) {
      errores.push(`falló ${req.url()}`);
    }
  });

  return errores;
};

// todas las páginas públicas cierran con un encabezado visible
const verificarPagina = async (page: Page, ruta: string) => {
  const errores = vigilarErrores(page);

  await page.goto(ruta);
  await expect(page.getByRole('heading').first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.locator('main')).toBeVisible();

  expect(errores).toEqual([]);
};

test('la página de inicio carga sin errores', async ({ page }) => {
  await verificarPagina(page, '/');
});

test('la página de horarios renderiza sus bloques', async ({ page }) => {
  const errores = vigilarErrores(page);

  await page.goto('/horarios');
  await expect(page.getByRole('heading').first()).toBeVisible({
    timeout: 15_000,
  });
  // al menos un bloque con su listado de horarios
  await expect(page.locator('section').first()).toBeVisible();

  expect(errores).toEqual([]);
});

test('la página de donaciones muestra los datos bancarios', async ({
  page,
}) => {
  const errores = vigilarErrores(page);

  await page.goto('/donaciones');
  await expect(page.getByRole('heading').first()).toBeVisible({
    timeout: 15_000,
  });
  // la tarjeta de donación siempre trae un texto de este estilo
  await expect(page.getByText(/donaci/i).first()).toBeVisible();

  expect(errores).toEqual([]);
});

test('la página de sobre nosotros carga', async ({ page }) => {
  await verificarPagina(page, '/sobre-nosotros');
});

test('la página de contacto carga', async ({ page }) => {
  await verificarPagina(page, '/contacto');
});

test('la recuperación de contraseña está disponible', async ({ page }) => {
  const errores = vigilarErrores(page);

  await page.goto('/recuperar-contrasena');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Enviar enlace/ }),
  ).toBeVisible();

  expect(errores).toEqual([]);
});
