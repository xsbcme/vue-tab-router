import { resolve } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJs from "vite-plugin-css-injected-by-js";

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "src/") }],
  },
  plugins: [vue(), cssInjectedByJs()],
  build: {
    emptyOutDir: false,
    outDir: "dist/browser",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "VueTabRouter",
      formats: ["iife"],
      fileName: () => "vue-tab-router.global.js",
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
