import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import Vue from "@vitejs/plugin-vue";

const demoSrc = resolve(__dirname, "src/");
const coreSrc = resolve(__dirname, "../../packages/vue-tab-router/src/");
const routerTabSrc = resolve(__dirname, "../../packages/vue-router-tab/src/");
const coreEntry = resolve(coreSrc, "index.ts");
const routerTabEntry = resolve(routerTabSrc, "index.ts");
const normalizePath = (path: string) => path.replace(/\\/g, "/");

const workspacePackageAlias = (): Plugin => ({
  name: "workspace-router-tab-demo-alias",
  enforce: "pre" as const,
  async resolveId(id: string, importer?: string) {
    if (id === "@xsbcme/vue-tab-router") return coreEntry;
    if (id === "@xsbcme/vue-router-tab") return routerTabEntry;

    const normalizedImporter = importer ? normalizePath(importer) : "";
    if (id.startsWith("@/")) {
      const resolvedId = normalizedImporter.includes("/vue-tab-router/src/")
        ? resolve(coreSrc, id.slice(2))
        : normalizedImporter.includes("/vue-router-tab/src/")
          ? resolve(routerTabSrc, id.slice(2))
          : resolve(demoSrc, id.slice(2));
      const resolved = await this.resolve(resolvedId, importer, { skipSelf: true });
      return resolved?.id ?? resolvedId;
    }
  },
});

export default defineConfig(() => ({
  root: __dirname,
  base: "./",
  resolve: {
    alias: [
      { find: /^@\/assets\//, replacement: `${demoSrc}/assets/` },
      { find: /^@\/components$/, replacement: `${coreSrc}/components/index.ts` },
      { find: /^@\/components\//, replacement: `${coreSrc}/components/` },
      { find: /^@\/composables$/, replacement: `${coreSrc}/composables/index.ts` },
      { find: /^@\/composables\//, replacement: `${coreSrc}/composables/` },
      { find: /^@\/iframe$/, replacement: `${coreSrc}/iframe/index.ts` },
      { find: /^@\/iframe\//, replacement: `${coreSrc}/iframe/` },
      { find: /^@\/plugins$/, replacement: `${coreSrc}/plugins/index.ts` },
      { find: /^@\/plugins\//, replacement: `${coreSrc}/plugins/` },
      { find: /^@\/shared$/, replacement: `${coreSrc}/shared/index.ts` },
      { find: /^@\/shared\//, replacement: `${coreSrc}/shared/` },
      { find: /^@\/storage$/, replacement: `${coreSrc}/storage/index.ts` },
      { find: /^@\/storage\//, replacement: `${coreSrc}/storage/` },
      { find: /^@\/tabs$/, replacement: `${coreSrc}/tabs/index.ts` },
      { find: /^@\/tabs\//, replacement: `${coreSrc}/tabs/` },
      { find: /^@\/types$/, replacement: `${coreSrc}/types.ts` },
      { find: /^@\//, replacement: `${demoSrc}/` },
    ],
  },
  plugins: [workspacePackageAlias(), Vue()],
}));
