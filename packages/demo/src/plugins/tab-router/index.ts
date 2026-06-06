import { ref, createVNode } from "vue";
import { createTabsManager, createTabUrlSyncPlugin, StorageAdapter } from "@xsbcme/vue-tab-router";
import router from "@/plugins/vue-router";

export const storageAdapter = new StorageAdapter(sessionStorage);
export const hookLogs = ref<string[]>([]);
export const iframeLogs = ref<string[]>([]);

const pushLog = (logs: typeof hookLogs, message: string) => {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
  logs.value = logs.value.slice(0, 30);
};

const tabsManager = createTabsManager({
  views: {
    modules: import.meta.glob("@/views/**/page-index.vue", { eager: false }),
  },
  storage: {
    adapter: storageAdapter,
  },
  render: {
    noActiveComponent: createVNode(
      "div",
      {
        style: { height: "100%" },
      },
      () => "欢迎使用标签页路由"
    ),
  },
  iframe: {
    messageOrigins: ["self"],
    onLoad: ({ iframe, tab }) => {
      pushLog(iframeLogs, `load ${tab.viewName || tab.viewUrl}`);
      iframe.style.backgroundColor = tab.viewProps?.iframeDemo ? "#f7f8fa" : "#fff";
      try {
        if (tab.viewProps?.iframeDemo && iframe.contentDocument) {
          const style = iframe.contentDocument.createElement("style");
          style.textContent = `
            body { outline: 4px solid rgba(22, 93, 255, 0.18); outline-offset: -4px; }
            h2::after { content: ' - injected style'; color: #165dff; font-size: 14px; }
          `;
          iframe.contentDocument.head.appendChild(style);
        }
      } catch {
        pushLog(iframeLogs, `无法访问 iframe 内部文档 ${tab.viewUrl}`);
      }
    },
    onMessage: message => {
      pushLog(iframeLogs, `message ${JSON.stringify(message.data)}`);
      const data = message.data;
      if (!data || typeof data !== "object") return;
      const payload = data as Record<string, unknown>;
      if (payload.type === "iframe:refresh-current") {
        tabsManager.refreshTab(message.tabId);
        message.reply({ type: "host:refreshed" });
      }
    },
  },
  plugins: [
    createTabUrlSyncPlugin(router, {
      routePath: "/dashboard",
      allowExternal: false,
      onError: error => {
        pushLog(hookLogs, `url-sync ${error instanceof Error ? error.message : String(error)}`);
      },
    }),
    ({ hooks, tabsManager }) => {
      hooks.on("tab:before-open", tab => {
        pushLog(hookLogs, `before-open ${tab.viewName || tab.viewUrl}`);
      });
      hooks.on("tab:opened", tab => {
        pushLog(hookLogs, `opened ${tab.viewName || tab.viewUrl}`);
      });
      hooks.on("tab:active-changed", tab => {
        pushLog(hookLogs, `active ${tab.viewName || tab.viewUrl}`);
      });
      hooks.on("tab:updated", tab => {
        pushLog(hookLogs, `updated ${tab.viewName || tab.viewUrl}`);
      });
      hooks.on("tab:before-refresh", tab => {
        pushLog(hookLogs, `before-refresh ${tab.viewName || tab.viewUrl}`);
      });
      hooks.on("tab:refreshed", tab => {
        pushLog(hookLogs, `refreshed ${tab.viewName || tab.viewUrl}`);
      });
      hooks.on("tab:closed", tab => {
        pushLog(hookLogs, `closed ${tab.viewName || tab.viewUrl}`);
      });
      hooks.on("tabs:cleared", () => {
        pushLog(hookLogs, "tabs cleared");
      });
      hooks.on("iframe:message", message => {
        const data = message.data;
        if (!data || typeof data !== "object") return;
        const payload = data as Record<string, unknown>;
        if (payload.type === "iframe:open-tab" && typeof payload.viewUrl === "string") {
          const options = payload.options && typeof payload.options === "object" ? payload.options : {};
          tabsManager.openTab(payload.viewUrl, options as Record<string, unknown>);
          message.reply({ type: "host:opened", viewUrl: payload.viewUrl });
        }
      });
      return () => {
        pushLog(hookLogs, `plugin disposed ${tabsManager.tabs.length}`);
      };
    },
  ],
  guards: {
    beforeOpen: async (to, from) => {
      pushLog(hookLogs, `global before-open ${to.viewName || to.viewUrl} from ${from?.viewName || from?.viewUrl || "-"}`);
    },
    beforeEnter: async (to, from) => {
      pushLog(hookLogs, `global before-enter ${to.viewName || to.viewUrl} from ${from?.viewName || from?.viewUrl || "-"}`);
    },
    beforeLeave: async (to, from) => {
      pushLog(hookLogs, `global before-leave ${from?.viewName || from?.viewUrl || "-"} to ${to.viewName || to.viewUrl}`);
    },
    beforeClose: async (tab, source) => {
      pushLog(hookLogs, `global before-close ${tab.viewName || tab.viewUrl} source ${source?.viewName || source?.viewUrl || "-"}`);
    },
  },
});

export default tabsManager;
