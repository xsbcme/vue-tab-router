import type { TabsManagerPlugin } from "@xsbcme/vue-tab-router";
import type { Tab } from "@xsbcme/vue-tab-router";
import type { Ref } from "vue";

const formatTab = (tab: Partial<Tab> | undefined) => {
  if (!tab) return "无";
  const name = tab.viewName || "未命名";
  const url = tab.viewUrl || "无地址";
  return `${name}（${url}）`;
};

const formatError = (error: unknown) => (error instanceof Error ? error.message : String(error));

const pushHookLog = (logs: Ref<string[]>, message: string) => {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
  logs.value = logs.value.slice(0, 30);
};

export const createDemoTabsManagerPlugin = (hookLogs: Ref<string[]>): TabsManagerPlugin => ({
  name: "demo-tabs-manager-plugin",
  setup({ hooks, tabsManager }) {
    hooks.on("tab:before-open", (tab, sourceTab) => {
      pushHookLog(hookLogs, `准备打开标签：${formatTab(tab)}，来源：${formatTab(sourceTab)}`);
    });
    hooks.on("tab:opened", (tab, sourceTab) => {
      pushHookLog(hookLogs, `标签已打开：${formatTab(tab)}，来源：${formatTab(sourceTab)}`);
    });
    hooks.on("tab:before-active-change", (to, from) => {
      pushHookLog(hookLogs, `准备切换激活标签：从 ${formatTab(from)} 到 ${formatTab(to)}`);
    });
    hooks.on("tab:active-changed", (to, from) => {
      pushHookLog(hookLogs, `激活标签已切换：当前 ${formatTab(to)}，上一个 ${formatTab(from)}`);
    });
    hooks.on("tab:updated", tab => {
      pushHookLog(hookLogs, `标签信息已更新：${formatTab(tab)}`);
    });
    hooks.on("tab:before-close", (tab, sourceTab) => {
      pushHookLog(hookLogs, `准备关闭标签：${formatTab(tab)}，来源：${formatTab(sourceTab)}`);
    });
    hooks.on("tab:before-refresh", tab => {
      pushHookLog(hookLogs, `准备刷新标签：${formatTab(tab)}`);
    });
    hooks.on("tab:refreshed", tab => {
      pushHookLog(hookLogs, `标签已刷新：${formatTab(tab)}`);
    });
    hooks.on("tab:closed", (tab, fallbackTab) => {
      pushHookLog(hookLogs, `标签已关闭：${formatTab(tab)}，回退激活：${formatTab(fallbackTab)}`);
    });
    hooks.on("tab:detached-opened", tab => {
      pushHookLog(hookLogs, `弹窗显示已打开：${formatTab(tab)}`);
    });
    hooks.on("tab:detached-closed", tab => {
      pushHookLog(hookLogs, `弹窗显示已关闭：${formatTab(tab)}`);
    });
    hooks.on("tab:detached-error", error => {
      pushHookLog(hookLogs, `弹窗显示渲染失败：${formatError(error)}`);
    });
    hooks.on("iframe:load", ({ tab }) => {
      pushHookLog(hookLogs, `Iframe 加载完成：${formatTab(tab)}`);
    });
    hooks.on("tabs:cleared", () => {
      pushHookLog(hookLogs, "全部标签状态已清空，持久化记录和页面事件监听也已清理");
    });
    hooks.on("iframe:message", message => {
      const data = message.data;
      if (!data || typeof data !== "object") return;
      const payload = data as Record<string, unknown>;
      pushHookLog(hookLogs, `收到 Iframe 消息：${JSON.stringify(payload)}，所属标签：${formatTab(message.tab)}`);
      if (payload.type === "iframe:open-tab" && typeof payload.viewUrl === "string") {
        const options = payload.options && typeof payload.options === "object" ? payload.options : {};
        tabsManager.openTab(payload.viewUrl, options as Record<string, unknown>);
        message.reply({ type: "host:opened", viewUrl: payload.viewUrl });
        pushHookLog(hookLogs, `已响应 Iframe 请求并打开标签：${payload.viewUrl}`);
      }
    });

    return () => {
      pushHookLog(hookLogs, `演示插件已卸载，卸载时仍有 ${tabsManager.tabs.length} 个标签`);
    };
  },
});
