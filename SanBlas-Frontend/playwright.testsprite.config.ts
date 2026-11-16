import { defineConfig, devices } from "@playwright/test";

// Regresiones aisladas: todas las APIs se simulan en el navegador, sin tocar datos reales.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "testsprite-regresiones.spec.ts",
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:5174",
    locale: "es-CR",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm exec vite --host localhost --port 5174 --strictPort",
    url: "http://localhost:5174",
    reuseExistingServer: false,
    env: { VITE_API_URL: "http://localhost:3000" },
  },
});
