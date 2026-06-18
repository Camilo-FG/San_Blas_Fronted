import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/framer-motion")) {
            return "framer-motion";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "lucide";
          }
          if (id.includes("node_modules/@tanstack/react-router")) {
            return "tanstack-router";
          }
          if (id.includes("node_modules/@tanstack/react-query")) {
            return "tanstack-query";
          }
          if (id.includes("node_modules/axios")) {
            return "axios";
          }
        },
      },
    },
  },
});
