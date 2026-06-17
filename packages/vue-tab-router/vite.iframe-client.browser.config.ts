import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: "dist/browser",
    lib: {
      entry: resolve(__dirname, "src/iframe/client.ts"),
      name: "VueTabRouterIframeClient",
      formats: ["iife"],
      fileName: () => "iframe-client.global.js",
    },
  },
});
