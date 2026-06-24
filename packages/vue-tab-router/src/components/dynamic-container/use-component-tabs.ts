import { Comment, computed, createVNode, defineComponent, provide } from "vue";
import { INJECT_CURRENT_TAB_KEY } from "@/shared";
import type { TabsManager } from "@/tabs/tabs-manager";
import type { ITabsManagerOptions } from "@/types";
import type { Component } from "vue";
import { clone, TabViewUrl } from "@/shared";
import { DefaultNotFoundComponent } from "@/components/default-state";
import { getTabCacheName, isIframeControllerTab } from "./tab-cache";
import { useAsyncComponentRender } from "./use-async-component-render";

export function useComponentTabs(tabsManager: TabsManager, managerOptions: ITabsManagerOptions | null) {
  const tabWrapperMap = new Map<string, Component>();
  const { errorComponent, loadingComponent, noExistComponent, transitionProps } = managerOptions || {};

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

        const componentUrl = computed(() => {
          const currentTab = tabsManager.getTabById(tabId);
          if (!currentTab || currentTab._isRefresh) return undefined;
          return isIframeControllerTab(currentTab)
            ? TabViewUrl.resolveIframeController(currentTab.viewUrl).controllerUrl
            : currentTab.viewUrl;
        });

        const asyncComponentRender = useAsyncComponentRender({
          source: managerOptions?.source,
          loadingComponent,
          errorComponent,
          transitionProps,
        });
        asyncComponentRender.watchComponent(() => {
          const url = componentUrl.value;
          return url ? (tabsManager.resolveComponent(url) as Component | undefined) : undefined;
        });

        return () => {
          const currentTab = tabsManager.getTabById(tabId);
          if (!currentTab || currentTab._isRefresh) return createVNode(Comment);

          const url = componentUrl.value;
          const comp = url ? tabsManager.resolveComponent(url) : undefined;
          if (!comp) {
            return createVNode(noExistComponent || DefaultNotFoundComponent);
          }

          return asyncComponentRender.render(resolvedComponent =>
            createVNode(resolvedComponent || comp, {
              ...clone(currentTab.viewProps || {}),
            })
          );
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
