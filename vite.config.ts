import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [react()].filter(Boolean),
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:5002",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
    ],
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Never split critical rendering dependencies
          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("lucide-react") ||
            id.includes("react-router-dom")
          ) {
            return undefined; // Keep in main bundle
          }

          // Optional splitting for large vendor libraries
          if (id.includes("@supabase/supabase-js")) {
            return "supabase";
          }
          if (id.includes("@tanstack/react-query")) {
            return "query";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
