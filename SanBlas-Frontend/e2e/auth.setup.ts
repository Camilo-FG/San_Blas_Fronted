import { test as setup, expect } from '@playwright/test';
import { CREDENCIALES_ARCHIVO, iniciarSesion } from './helpers';

// deja la sesión guardada para el resto de los specs (proyecto chromium la reutiliza)
setup('autenticar una vez y guardar la sesión', async ({ page }) => {
  await iniciarSesion(page);

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  await page.context().storageState({ path: CREDENCIALES_ARCHIVO });
});
