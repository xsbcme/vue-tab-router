import { createVNode } from "vue";
import { createTabsManager, StorageAdapter } from "@xsbcme/vue-tab-router";

export const storageAdapter = new StorageAdapter(sessionStorage);

const tabsManager = createTabsManager({
  modules: import.meta.glob("@/views/**/page-index.vue", { eager: false }),
  storageAdapter,
  noActiveComponent: createVNode(
    "div",
    {
      style: { height: "100%" },
    },
    () => "欢迎使用标签页路由"
  ),
  onBeforeTabOpen: async (to, old) => {
    // console.log('onBeforeTabOpen', to, old);
  },
  onBeforeTabEnter: async (to, old) => {
    // console.log('onBeforeTabEnter', to, old);
  },
});

export default tabsManager;
