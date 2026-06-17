import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import Vue from "@vitejs/plugin-vue";

import pluginPkg from "../../packages/vue-tab-router/package.json";

const demoSrc = resolve(__dirname, "src/");
const pluginSrc = resolve(__dirname, "../../packages/vue-tab-router/src/");
const pluginEntry = resolve(pluginSrc, "index.ts");
const pluginIframeClientEntry = resolve(pluginSrc, "iframe/client.ts");
const pluginTabUrlSyncEntry = resolve(pluginSrc, "plugins/tab-url-sync/index.ts");
const demoIndexEntry = resolve(__dirname, "index.html");
const iframeClientEntry = resolve(__dirname, "iframe-client.html");
const normalizePath = (path: string) => path.replace(/\\/g, "/");
const demoAlias = [
  { find: /^@\/App\.vue$/, replacement: resolve(demoSrc, "App.vue") },
  { find: /^@\/assets\//, replacement: `${demoSrc}/assets/` },
  { find: /^@\/layouts\//, replacement: `${demoSrc}/layouts/` },
  { find: /^@\/model\//, replacement: `${demoSrc}/model/` },
  { find: /^@\/utils\//, replacement: `${demoSrc}/utils/` },
  { find: /^@\/views\//, replacement: `${demoSrc}/views/` },
];

const workspacePluginAlias = (): Plugin => ({
  name: "workspace-vue-tab-router-alias",
  enforce: "pre" as const,
  async resolveId(id: string, importer?: string) {
    if (id === "@xsbcme/vue-tab-router") {
      return pluginEntry;
    }

    if (id === "@xsbcme/vue-tab-router/iframe/client") {
      return pluginIframeClientEntry;
    }

    if (id === "@xsbcme/vue-tab-router/plugins/tab-url-sync") {
      return pluginTabUrlSyncEntry;
    }

    const normalizedImporter = importer ? normalizePath(importer) : "";
    if (id.startsWith("@/")) {
      let resolvedId: string;
      if (normalizedImporter.includes("/packages/vue-tab-router/src/")) {
        resolvedId = resolve(pluginSrc, id.slice(2));
      } else {
        resolvedId = resolve(demoSrc, id.slice(2));
      }
      const resolved = await this.resolve(resolvedId, importer, { skipSelf: true });
      return resolved?.id ?? resolvedId;
    }
  },
});

export default defineConfig(() => {
  return {
    root: __dirname,
    base: "./",
    resolve: {
      alias: demoAlias,
    },
    plugins: [workspacePluginAlias(), Vue()],
    define: {
      __PLUGIN_VERSION__: JSON.stringify(pluginPkg.version),
    },
    build: {
      rollupOptions: {
        input: {
          index: demoIndexEntry,
          "iframe-client": iframeClientEntry,
        },
      },
    },
  };
});
