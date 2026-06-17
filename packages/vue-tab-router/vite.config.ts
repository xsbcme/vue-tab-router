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
      afterDiagnostic(diagnostics) {
        if (diagnostics.length > 0) {
          throw new Error(`Declaration type check failed with ${diagnostics.length} diagnostics.`);
        }
      },
    }),
    cssInjectedByJs({
      jsAssetsFilterFunction: chunk => chunk.fileName === "index.js" || chunk.fileName === "index.cjs",
    }),
    externalizeDeps(),
  ],
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "iframe/client": resolve(__dirname, "src/iframe/client.ts"),
        "plugins/tab-url-sync": resolve(__dirname, "src/plugins/tab-url-sync/index.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
  },
});
