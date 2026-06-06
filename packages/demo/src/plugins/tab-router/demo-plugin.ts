import type { TabsManagerPlugin } from "@xsbcme/vue-tab-router";
import type { Ref } from "vue";

const pushHookLog = (logs: Ref<string[]>, message: string) => {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
  logs.value = logs.value.slice(0, 30);
};

export const createDemoTabsManagerPlugin = (hookLogs: Ref<string[]>): TabsManagerPlugin => ({
  name: "demo-tabs-manager-plugin",
  setup({ hooks, tabsManager }) {
    hooks.on("tab:before-open", tab => {
      pushHookLog(hookLogs, `before-open ${tab.viewName || tab.viewUrl}`);
    });
    hooks.on("tab:opened", tab => {
      pushHookLog(hookLogs, `opened ${tab.viewName || tab.viewUrl}`);
    });
    hooks.on("tab:active-changed", tab => {
      pushHookLog(hookLogs, `active ${tab.viewName || tab.viewUrl}`);
    });
    hooks.on("tab:updated", tab => {
      pushHookLog(hookLogs, `updated ${tab.viewName || tab.viewUrl}`);
    });
    hooks.on("tab:before-refresh", tab => {
      pushHookLog(hookLogs, `before-refresh ${tab.viewName || tab.viewUrl}`);
    });
    hooks.on("tab:refreshed", tab => {
      pushHookLog(hookLogs, `refreshed ${tab.viewName || tab.viewUrl}`);
    });
    hooks.on("tab:closed", tab => {
      pushHookLog(hookLogs, `closed ${tab.viewName || tab.viewUrl}`);
    });
    hooks.on("tabs:cleared", () => {
      pushHookLog(hookLogs, "tabs cleared");
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
      pushHookLog(hookLogs, `plugin disposed ${tabsManager.tabs.length}`);
    };
  },
});
