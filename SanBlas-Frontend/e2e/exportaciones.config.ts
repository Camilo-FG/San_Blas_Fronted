import { defineConfig, devices } from "@playwright/test";

// Requiere el backend descartable: nunca levanta la app con la conexión de producción.
export default defineConfig({
  testDir: ".",
  testMatch: "exportaciones-matriculas.spec.ts",
  timeout: 90000,
  expect: { timeout: 15000 },
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5175",
    reducedMotion: "reduce",
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "escritorio-claro",
      use: { ...devices["Desktop Chrome"], colorScheme: "light" },
    },
    {
      name: "escritorio-oscuro",
      use: { ...devices["Desktop Chrome"], colorScheme: "dark" },
    },
    {
      name: "movil-claro",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
        colorScheme: "light",
      },
    },
    {
      name: "movil-oscuro",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
        colorScheme: "dark",
      },
    },
  ],
});
