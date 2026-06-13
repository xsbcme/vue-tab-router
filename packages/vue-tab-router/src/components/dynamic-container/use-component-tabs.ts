import { Component, computed, createVNode, defineComponent, provide } from "vue";
import { INJECT_CURRENT_TAB_KEY } from "@/constant";
import type { TabsManager } from "@/tabs-manager";
import type { ITabsManagerOptions } from "@/types";
import { clone } from "@/utils";
import { DefaultNotFoundComponent } from "@/components/default-state";
import { getTabCacheName } from "./types";

export function useComponentTabs(tabsManager: TabsManager, managerOptions: ITabsManagerOptions | null) {
  const tabWrapperMap = new Map<string, Component>();
  const { noExistComponent } = managerOptions || {};

  const pruneStaleWrappers = () => {
    const tabIds = new Set(tabsManager.tabs.map(tab => tab._id));
    tabWrapperMap.forEach((_component, tabId) => {
      if (!tabIds.has(tabId)) {
        tabWrapperMap.delete(tabId);
      }
    });
  };

  const getTabWrapper = (tabId: string) => {
    const cached = tabWrapperMap.get(tabId);
    if (cached) return cached;

    const wrapper = defineComponent({
      name: getTabCacheName(tabId),
      setup() {
        provide(
          INJECT_CURRENT_TAB_KEY,
          computed(() => tabsManager.getTabById(tabId))
        );

        return () => {
          const currentTab = tabsManager.getTabById(tabId);
          if (!currentTab || currentTab._isRefresh) return null;

          const comp = tabsManager.resolveComponent(currentTab.viewUrl);
          if (!comp) {
            return createVNode(noExistComponent || DefaultNotFoundComponent);
          }

          return createVNode(comp, {
            ...clone(currentTab.viewProps || {}),
          });
        };
      },
    });

    tabWrapperMap.set(tabId, wrapper);
    return wrapper;
  };

  return {
    getTabWrapper,
    pruneStaleWrappers,
  };
}
