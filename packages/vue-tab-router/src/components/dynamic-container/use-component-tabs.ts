import { Component, computed, createVNode, defineComponent, provide } from "vue";
import { INJECT_CURRENT_TAB_KEY } from "@/shared";
import type { TabsManager } from "@/tabs/tabs-manager";
import type { ITabsManagerOptions } from "@/types";
import { clone, TabViewUrl } from "@/shared";
import { DefaultNotFoundComponent } from "@/components/default-state";
import { getTabCacheName, isIframeControllerTab } from "./tab-cache";

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

          const componentUrl = isIframeControllerTab(currentTab)
            ? TabViewUrl.resolveIframeController(currentTab.viewUrl).controllerUrl
            : currentTab.viewUrl;
          const comp = tabsManager.resolveComponent(componentUrl);
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
