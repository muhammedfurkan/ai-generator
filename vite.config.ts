import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss(), jsxLocPlugin()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    target: "es2022",
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Node modules chunking
          if (id.includes("node_modules")) {
            // React core
            if (id.includes("/react-dom/") || id.includes("/scheduler/")) {
              return "vendor-react-dom";
            }
            if (id.includes("/react/") && !id.includes("react-")) {
              return "vendor-react";
            }
            // Framer motion - large library, separate chunk
            if (id.includes("framer-motion")) {
              return "vendor-framer";
            }
            // Three.js + GSAP
            if (id.includes("/three/") || id.includes("/gsap/")) {
              return "vendor-3d";
            }
            // Lottie
            if (id.includes("lottie-react") || id.includes("lottie-web")) {
              return "vendor-lottie";
            }
            // Radix UI components
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            // Data fetching
            if (id.includes("@tanstack") || id.includes("@trpc")) {
              return "vendor-query";
            }
            // Form handling
            if (
              id.includes("react-hook-form") ||
              id.includes("@hookform") ||
              id.includes("/zod/")
            ) {
              return "vendor-form";
            }
            // Date utilities
            if (id.includes("date-fns")) {
              return "vendor-date";
            }
            // Lucide icons
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
          }
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
