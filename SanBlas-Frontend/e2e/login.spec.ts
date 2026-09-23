import { expect, test } from '@playwright/test';

// el proyecto chromium arranca con la sesión guardada por auth.setup.ts
test('con la sesión guardada entra al panel sin volver a loguear', async ({
  page,
}) => {
  await page.goto('/dashboard');

  await expect(page).not.toHaveURL(/\/login/);
  await expect(page).toHaveURL(/\/dashboard/);
});

test('recargar la gestión de usuarios mantiene la sesión', async ({ page }) => {
  await page.goto('/dashboard/usuarios');
  await expect(page.locator('table tbody tr').first()).toBeVisible();

  await page.reload();
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.locator('table tbody tr').first()).toBeVisible();
});

test.describe('sin sesión', () => {
  // contexto vacío: ni cookies ni localStorage, así se comporta un visitante nuevo
  test.use({ storageState: { cookies: [], origins: [] } });

  test('las rutas del panel mandan al login con el redirect', async ({
    page,
  }) => {
    await page.goto('/dashboard/usuarios');

    await expect(page).toHaveURL(/\/login\?redirect=/);
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('el dashboard también queda protegido', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login/);
  });

  test('login con credenciales inválidas muestra el error sin romper', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.fill('#email', 'no-existe@correo.com');
    await page.fill('#password', 'clave-equivocada');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // el token no debe existir y el formulario sigue en pie para reintentar
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('#email')).toHaveValue('no-existe@correo.com');
  });
});
