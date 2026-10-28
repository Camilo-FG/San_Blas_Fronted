import { test, expect } from '@playwright/test';

// Nunca corre desde la configuración habitual sobre una base compartida.
test.skip(process.env.SPRINT4_ISOLATED !== '1', 'Requiere el arnés local de PostgreSQL descartable.');

test('listados, filtros, revisión y certificación conservan el flujo completo', async ({ page, request }) => {
  const errores: string[] = [];
  page.on('pageerror', (error) => errores.push(error.message));
  const respuesta = await request.get('http://localhost:3000/__pruebas/credenciales');
  expect(respuesta.ok()).toBeTruthy(); // no es un endpoint de la aplicación desplegada
  const credenciales = await respuesta.json();
  await page.goto('/login');
  await page.getByLabel('Correo electrónico', { exact: true }).fill(credenciales.email);
  await page.getByLabel('Contraseña', { exact: true }).fill(credenciales.password);
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  for (const modulo of ['cica', 'catequesis-bautismo']) {
    await page.goto(`/dashboard/${modulo}`);
    const buscar = page.getByRole('searchbox');
    await expect(page.getByRole('button', { name: 'Página siguiente' })).toBeEnabled();
    await page.getByRole('button', { name: 'Página siguiente' }).click();
    await expect(page.getByText(/Página\s+2 de/)).toBeVisible();
    await buscar.fill('NoExisteEsteRegistro');
    await expect(page.getByText('No se encontraron registros con los filtros aplicados.')).toBeVisible();
    await page.getByRole('button', { name: 'Limpiar', exact: true }).click();
    await expect(page.getByText(/Página\s+1 de/)).toBeVisible();
    await page.getByRole('combobox', { name: 'Cantidad de registros por página' }).selectOption('25');
    await expect(page.getByText(/Página\s+1 de\s+1/)).toBeVisible();

    await page.getByRole('button', { name: /^Ver detalle/ }).first().click();
    const detalle = page.getByRole('dialog', { name: 'Prueba Regresión', exact: true });
    await expect(detalle).toBeVisible();
    const cedula = (await detalle.getByText(/^400\d{6}$/).innerText()).trim();
    if (modulo === 'cica') {
      await detalle.getByRole('button', { name: 'Rechazar', exact: true }).click();
      const confirmar = page.getByRole('dialog', { name: 'Confirmar rechazo', exact: true });
      await expect(confirmar.getByRole('button', { name: 'Rechazar solicitud', exact: true })).toBeDisabled();
      await confirmar.locator('textarea').fill('Revisión de regresión local');
      await confirmar.getByRole('button', { name: 'Rechazar solicitud', exact: true }).click();
    } else {
      await detalle.locator('input[type=date]').nth(0).fill('2026-01-01');
      await detalle.locator('input[type=date]').nth(1).fill('2026-02-01');
      await detalle.getByPlaceholder('Ej: Padre Juan Mora').fill('Responsable Local');
      await detalle.getByRole('button', { name: 'Aprobar', exact: true }).click();
      await page.getByRole('dialog', { name: 'Confirmar aprobación', exact: true }).getByRole('button', { name: 'Aprobar', exact: true }).click();
    }
    await expect(detalle).not.toBeVisible();
    await page.getByRole('button', { name: 'Historial', exact: true }).click();
    await buscar.fill(cedula);
    await expect(page.getByText(/de 1 registros/)).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Historial', exact: true }).click();
    await page.getByRole('searchbox').fill(cedula);
    await expect(page.getByText(/de 1 registros/)).toBeVisible();
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(desborde).toBe(false);
  }
  expect(errores).toEqual([]);
});
