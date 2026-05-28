import { resolve } from "node:path";
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";

import pluginPkg from "../vue-tab-router/package.json";

export default defineConfig(() => {
  return {
    base: "./",
    resolve: {
      alias: [{ find: "@", replacement: resolve(__dirname, "src/") }],
    },
    plugins: [Vue()],
    define: {
      __PLUGIN_VERSION__: JSON.stringify(pluginPkg.version),
    },
  };
});
