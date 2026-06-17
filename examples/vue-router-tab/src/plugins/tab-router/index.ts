import { h } from "vue";
import { createTabsManager, createVueRouterTabsPlugin, StorageAdapter } from "@xsbcme/vue-router-tab";
import router from "../vue-router";

const tabsManager = createTabsManager({
  views: {
    modules: {},
  },
  storage: {
    adapter: new StorageAdapter(sessionStorage),
    key: "router-tab-demo-tabs",
  },
  render: {
    noActiveComponent: h("div", { class: "empty-state" }, "选择左侧路由开始测试"),
    noExistComponent: h("div", { class: "empty-state" }, "路由视图未注册"),
  },
  plugins: [
    createVueRouterTabsPlugin(router, {
      include: route => route.meta.tab !== false && route.name !== "not-found",
      onError: error => {
        console.error(error);
      },
    }),
  ],
});

export default tabsManager;
