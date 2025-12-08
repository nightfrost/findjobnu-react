import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // Generate precompressed assets for production hosting (gzip and brotli)
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      filter: (file) => /\.(js|css|html|svg|json|xml|txt|woff2?)$/i.test(file),
      threshold: 1024,
    }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      filter: (file) => /\.(js|css|html|svg|json|xml|txt|woff2?)$/i.test(file),
      threshold: 1024,
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setupTests.ts",
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});