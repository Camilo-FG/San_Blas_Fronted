import { defineConfig, devices } from '@playwright/test';

const PUERTO_FRONT = 5173;
const PUERTO_BACK = 3000;
const RUTA_BACKEND = '../../ing_san_blas_back';

// Los tests corren contra la DB real, así que van de a uno: nada de workers en paralelo
export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PUERTO_FRONT}`,
    locale: 'es-CR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // reutiliza la sesión guardada por el proyecto setup
        storageState: 'e2e/.auth/usuario.json',
      },
      testIgnore: /auth\.setup\.ts/,
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      // backend NestJS: si ya está corriendo lo reutiliza en vez de duplicarlo
      command: 'node dist/main',
      cwd: RUTA_BACKEND,
      url: `http://localhost:${PUERTO_BACK}`,
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'node node_modules/vite/bin/vite.js',
      url: `http://localhost:${PUERTO_FRONT}`,
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
