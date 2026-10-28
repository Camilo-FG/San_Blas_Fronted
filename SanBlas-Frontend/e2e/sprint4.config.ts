import { defineConfig, devices } from '@playwright/test';

// Solo para el arnés local descartable; no inicia el backend con el .env habitual.
export default defineConfig({
  testDir: '.',
  testMatch: 'matriculas-sprint4.spec.ts',
  workers: 1,
  timeout: 90000,
  reporter: 'list',
  use: { baseURL: 'http://localhost:5173', trace: 'off', video: 'off' },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'movil', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
});
