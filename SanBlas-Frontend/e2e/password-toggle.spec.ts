import { expect, test } from '@playwright/test';

test.describe('toggle en el login', () => {
  // sin sesión: si no, LoginPage te manda al dashboard apenas carga
  test.use({ storageState: { cookies: [], origins: [] } });

  test('el ojo alterna entre password y text sin borrar lo escrito', async ({
    page,
  }) => {
    await page.goto('/login');

    const campo = page.locator('#password');
    await expect(campo).toHaveAttribute('type', 'password');
    await campo.fill('claveDePrueba123');

    const mostrar = page.getByRole('button', { name: 'Mostrar contraseña' });
    await expect(mostrar).toHaveAttribute('aria-pressed', 'false');
    await mostrar.click();

    await expect(campo).toHaveAttribute('type', 'text');
    // no se pierde lo que ya había escrito
    await expect(campo).toHaveValue('claveDePrueba123');
    await expect(page.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.getByRole('button', { name: 'Ocultar contraseña' }).click();
    await expect(campo).toHaveAttribute('type', 'password');
    await expect(campo).toHaveValue('claveDePrueba123');
  });
});

test('el modal de crear usuario tiene ojo en los dos campos', async ({
  page,
}) => {
  await page.goto('/dashboard/usuarios');
  await expect(page.locator('table tbody tr').first()).toBeVisible();

  await page.getByRole('button', { name: /Agregar usuario/ }).click();

  const clave = page.locator('#nueva-contrasena-usuario');
  const confirmacion = page.locator('#confirmar-contrasena-usuario');
  await expect(clave).toBeVisible();
  await expect(confirmacion).toBeVisible();
  await expect(clave).toHaveAttribute('type', 'password');
  await expect(confirmacion).toHaveAttribute('type', 'password');

  await clave.fill('Abc12345');
  await confirmacion.fill('Abc12345');

  // los dos campos tienen su botón de ojo
  await expect(
    page.getByRole('button', { name: 'Mostrar contraseña' }),
  ).toHaveCount(2);

  // el primer ojo solo afecta a su campo: al invertirlo queda un solo
  // "Mostrar contraseña" en pantalla, que es el del segundo campo
  await page.getByRole('button', { name: 'Mostrar contraseña' }).first().click();
  await expect(clave).toHaveAttribute('type', 'text');
  await expect(confirmacion).toHaveAttribute('type', 'password');

  // el segundo, al suyo
  await page.getByRole('button', { name: 'Mostrar contraseña' }).first().click();
  await expect(clave).toHaveAttribute('type', 'text');
  await expect(confirmacion).toHaveAttribute('type', 'text');

  // el contenido sigue intacto en ambos
  await expect(clave).toHaveValue('Abc12345');
  await expect(confirmacion).toHaveValue('Abc12345');
});

test('el modal de editar usuario tiene ojo en su campo', async ({ page }) => {
  await page.goto('/dashboard/usuarios');
  await expect(page.locator('table tbody tr').first()).toBeVisible();

  await page.getByRole('button', { name: 'Editar usuario' }).first().click();

  const clave = page.locator('#u-contraseña');
  await expect(clave).toBeVisible();
  await expect(clave).toHaveAttribute('type', 'password');
  await clave.fill('NuevaClave123');

  await page.getByRole('button', { name: 'Mostrar contraseña' }).first().click();
  await expect(clave).toHaveAttribute('type', 'text');
  await expect(clave).toHaveValue('NuevaClave123');

  await page.getByRole('button', { name: 'Ocultar contraseña' }).first().click();
  await expect(clave).toHaveAttribute('type', 'password');
  await expect(clave).toHaveValue('NuevaClave123');
});
