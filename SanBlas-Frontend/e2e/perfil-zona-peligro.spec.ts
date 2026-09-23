import { expect, test } from '@playwright/test';
import { leerCredenciales } from './helpers';

const AVISO_PROPIA_CUENTA =
  'No puede desactivar su propia cuenta desde aquí.';
const TABLA = 'table tbody tr';

// abre el modal de perfil de la primera fila que no sea la mía y devuelve su índice
const abrirPerfilAjeno = async (
  page: import('@playwright/test').Page,
): Promise<number> => {
  const { email: miCorreo } = leerCredenciales();

  await page.goto('/dashboard/usuarios');
  await expect(page.locator(TABLA).first()).toBeVisible();

  const filas = page.locator(TABLA);
  const total = await filas.count();

  for (let indice = 0; indice < total; indice += 1) {
    const correo = (await filas.nth(indice).locator('td').nth(1).innerText())
      .trim()
      .toLowerCase();
    if (correo !== miCorreo.toLowerCase()) {
      await page
        .getByRole('button', { name: 'Ver perfil' })
        .nth(indice)
        .click();
      return indice;
    }
  }

  test.skip(true, 'La tabla solo tiene mi propia cuenta');
  return -1;
};

test('en mi propio perfil la zona de peligro no ofrece desactivar la cuenta', async ({
  page,
}) => {
  await page.goto('/dashboard/perfil');

  await expect(page.getByText(AVISO_PROPIA_CUENTA)).toBeVisible();
  // el botón destructivo no debe existir para la cuenta propia
  await expect(
    page.getByRole('button', { name: 'Desactivar cuenta' }),
  ).toHaveCount(0);
  await expect(page.getByText('Zona de peligro')).toHaveCount(0);
});

test('mi perfil sí muestra mis datos y el estado de la cuenta', async ({
  page,
}) => {
  await page.goto('/dashboard/perfil');

  await expect(page.getByText('Mi perfil')).toBeVisible();
  await expect(page.getByText('Nombre')).toBeVisible();
  await expect(page.getByText('Correo')).toBeVisible();
  await expect(page.getByText(/Activo|Inactivo/).first()).toBeVisible();
});

test('en una cuenta ajena la zona de peligro sí ofrece desactivar', async ({
  page,
}) => {
  await abrirPerfilAjeno(page);

  // acá sí debe estar la zona de peligro con su botón destructivo
  await expect(page.getByText('Zona de peligro')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Desactivar cuenta' }),
  ).toBeVisible();
  await expect(page.getByText(AVISO_PROPIA_CUENTA)).toHaveCount(0);
});

test('la desactivación pide confirmación con el mismo modal de sacramentos', async ({
  page,
}) => {
  await abrirPerfilAjeno(page);
  await expect(
    page.getByRole('button', { name: 'Desactivar cuenta' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Desactivar cuenta' }).click();

  // es el ConfirmacionAccionModal, con su propio título como aria-label
  const confirmacion = page.getByRole('dialog', {
    name: 'Confirmar desactivación',
  });
  await expect(confirmacion).toBeVisible();
  await expect(
    confirmacion.getByRole('button', { name: 'Sí, desactivar' }),
  ).toBeVisible();
  await expect(
    confirmacion.getByRole('button', { name: 'Cancelar' }),
  ).toBeVisible();
  // icono de advertencia del patrón de sacramentos
  await expect(confirmacion.locator('svg').first()).toBeVisible();
  // el texto va en minúscula: "Esta acción no se puede deshacer."
  await expect(
    confirmacion.getByText(/no se puede deshacer/i),
  ).toBeVisible();

  // cancelar cierra el modal y deja todo igual (no se desactiva nada)
  await confirmacion.getByRole('button', { name: 'Cancelar' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Confirmar desactivación' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Desactivar cuenta' }),
  ).toBeVisible();
  await expect(page.getByText('Zona de peligro')).toBeVisible();
});
