import { ref, createVNode } from "vue";
import { createTabsManager, createTabUrlSyncPlugin, StorageAdapter, TabViewUrl } from "@xsbcme/vue-tab-router";
import router from "@/plugins/vue-router";
import { createDemoTabsManagerPlugin } from "./demo-plugin";

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
    meta: [
      {
        title: "最小入门",
        children: [
          { title: "最小打开页面", viewUrl: "/src/views/learning/start/page-index.vue" },
          { title: "打开与复用", viewUrl: "/src/views/learning/basic-open/page-index.vue" },
        ],
      },
      {
        title: "基础操作",
        children: [
          { title: "当前页操作", viewUrl: "/src/views/learning/current-actions/page-index.vue" },
          { title: "缓存对照", viewUrl: "/src/views/learning/cache/page-index.vue" },
          { title: "批量与排序", viewUrl: "/src/views/learning/batch-sort/page-index.vue" },
        ],
      },
      {
        title: "菜单与层级",
        viewUrl: "/src/views/learning/menu-breadcrumb/page-index.vue",
      },
      {
        title: "通信与守卫",
        children: [
          { title: "父子通信", viewUrl: "/src/views/learning/events/page-index.vue" },
          { title: "页面守卫", viewUrl: "/src/views/learning/guards/page-index.vue" },
        ],
      },
      {
        title: "链接与 Iframe",
        children: [
          { title: "链接打开方式", viewUrl: "/src/views/learning/iframe-links/page-index.vue" },
          { title: "Iframe 缓存", viewUrl: "/src/views/learning/iframe-cache/page-index.vue" },
          { title: "Iframe 消息", viewUrl: "/src/views/learning/iframe-message/page-index.vue" },
          { title: "Iframe 导航同步", viewUrl: "/src/views/learning/iframe-navigation/page-index.vue" },
        ],
      },
      {
        title: "弹窗与预览",
        children: [
          {
            title: "弹窗显示",
            viewUrl: "/src/views/learning/detached/page-index.vue",
            props: { _viewSingle: true },
          },
          { title: "预览容器", viewUrl: "/src/views/learning/preview/page-index.vue" },
        ],
      },
      {
        title: "扩展与外观",
        icon: "IconApps",
        children: [
          { title: "插件 Hooks", icon: "IconApps", viewUrl: "/src/views/learning/plugin-hooks/page-index.vue" },
          { title: "主题与图标", icon: "IconApps", viewUrl: "/src/views/learning/theme/page-index.vue" },
          { title: "状态组件", icon: "IconApps", viewUrl: "/src/views/test-theme/state-components/page-index.vue" },
        ],
      },
      {
        title: "项目实践",
        children: [
          {
            title: "能力组合总览",
            viewUrl: "/src/views/practice/overview/page-index.vue",
            props: {
              _viewSingle: true,
            },
          },
          {
            title: "客户运营工作台",
            viewUrl: "/src/views/practice/customer-workbench/page-index.vue",
            props: {
              _viewSingle: true,
              _viewPinned: true,
              _viewNoDrag: true,
            },
          },
          {
            title: "订单处理中心",
            viewUrl: "/src/views/practice/order-center/page-index.vue",
            props: {
              _viewSingle: true,
            },
            children: [
              {
                title: "订单详情",
                viewUrl: "/src/views/practice/order-center/order-detail/page-index.vue",
              },
            ],
          },
          {
            title: "运营复盘报表",
            viewUrl: "/src/views/practice/operations-report/page-index.vue",
            props: {
              _viewSingle: true,
            },
          },
          {
            title: "列表详情联动",
            viewUrl: "/src/views/practice/test-table-detail/page-index.vue",
            props: {
              _viewSingle: true,
            },
            children: [
              {
                title: "项目详情",
                viewUrl: "/src/views/practice/test-table-detail/table-detail/page-index.vue",
              },
            ],
          },
          {
            title: "iframe 经营看板",
            viewUrl: TabViewUrl.createRelative("./iframe-tests/cache.html"),
          },
        ],
      },
      {
        title: "API 覆盖检查",
        viewUrl: "/src/views/learning/api-check/page-index.vue",
      },
    ],
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
    noExistComponent: createVNode(
      "div",
      {
        style: {
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-3)",
        },
      },
      () => "视图未注册或已失效"
    ),
    viewNameMaxLength: 12,
  },
  detached: {
    zIndex: 900,
    fullscreen: false,
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
    onMessage: async message => {
      pushLog(iframeLogs, `message ${JSON.stringify(message.data)}`);
      const data = message.data;
      if (!data || typeof data !== "object") return;
      const payload = data as Record<string, unknown>;
      if (payload.type === "iframe:refresh-current") {
        await tabsManager.refreshTab(message.tabId);
        message.reply({ type: "host:refreshed" });
      }
      if (payload.type === "iframe:close-current") {
        await tabsManager.closeTab(message.tabId);
        message.reply({ type: "host:close-requested" });
      }
    },
  },
  plugins: [
    createTabUrlSyncPlugin(router, {
      routePath: "/dashboard",
      queryKey: "activeTab",
      syncInitialActiveTab: true,
      syncDocumentTitle: true,
      formatDocumentTitle: tab => (tab?.viewName ? `${tab.viewName} - Vue Tab Router Demo` : "Vue Tab Router Demo"),
      allowExternal: true,
      onError: error => {
        pushLog(hookLogs, `url-sync ${error instanceof Error ? error.message : String(error)}`);
      },
    }),
    createDemoTabsManagerPlugin(hookLogs),
  ],
  guards: {
    beforeOpen: async (to, from) => {
      pushLog(
        hookLogs,
        `global before-open ${to.viewName || to.viewUrl} from ${from?.viewName || from?.viewUrl || "-"}`
      );
    },
    beforeEnter: async (to, from) => {
      pushLog(
        hookLogs,
        `global before-enter ${to.viewName || to.viewUrl} from ${from?.viewName || from?.viewUrl || "-"}`
      );
    },
    beforeLeave: async (to, from) => {
      pushLog(
        hookLogs,
        `global before-leave ${from?.viewName || from?.viewUrl || "-"} to ${to.viewName || to.viewUrl}`
      );
    },
    beforeClose: async (tab, source) => {
      pushLog(
        hookLogs,
        `global before-close ${tab.viewName || tab.viewUrl} source ${source?.viewName || source?.viewUrl || "-"}`
      );
    },
  },
});

export default tabsManager;
