import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    preserveSymlinks: false,
    alias: {
      "@": path.resolve(__dirname, "src"),
      // update/remove these if you don't have shared or attached_assets in root
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
      // Ensure single React instance everywhere
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-dom/client": path.resolve(
        __dirname,
        "node_modules/react-dom/client",
      ),
      "react/jsx-runtime": path.resolve(
        __dirname,
        "node_modules/react/jsx-runtime",
      ),
      "react/jsx-dev-runtime": path.resolve(
        __dirname,
        "node_modules/react/jsx-dev-runtime",
      ),
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
      "react-router-dom",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
    ],
    force: true,
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - remove react manual chunking to avoid issues
          router: ["react-router-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
          ],
          query: ["@tanstack/react-query"],
          supabase: ["@supabase/supabase-js"],
          icons: ["lucide-react"],
          utils: ["clsx", "tailwind-merge"],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB for better performance
  },
}));
