import { resolve } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import cssInjectedByJs from "vite-plugin-css-injected-by-js";
import { externalizeDeps } from "vite-plugin-externalize-deps";

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "src/") }],
  },
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ["src"],
      skipDiagnostics: false,
      logDiagnostics: true,
      afterDiagnostic(diagnostics) {
        if (diagnostics.length > 0) {
          throw new Error(`Declaration type check failed with ${diagnostics.length} diagnostics.`);
        }
      },
    }),
    cssInjectedByJs(),
    externalizeDeps(),
  ],
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
  },
  define: {
    "process.env": {},
    __SSR__: `true`,
    __DEV__: `false`,
    __COMPAT__: `false`,
    __FEATURE_SUSPENSE__: `true`,
    __FEATURE_PROD_DEVTOOLS__: `false`,
  },
});
