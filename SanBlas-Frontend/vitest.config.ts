import { defineConfig } from "vitest/config";

// config propio de vitest: no toca vite.config.js (que solo se usa para build/dev)
// y no arrastra el plugin de tailwind ni el manualChunks al correr tests
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
    clearMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
});
