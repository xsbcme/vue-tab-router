import { KeepAlive, Transition, computed, createVNode, defineComponent, provide } from "vue";
import { INJECT_ACTIVE_TAB_KEY } from "@/constant";
import { useTabsManager } from "@/use-tabs-manager";
import type { ITabsManagerOptions } from "@/types";
import { getTabCacheName, isIframeTab, shouldCacheComponentTab } from "./types";
import { useComponentTabs } from "./use-component-tabs";
import { useIframeTabs } from "./use-iframe-tabs";

export default defineComponent({
  name: "DynamicContainer",
  setup() {
    const tabsManager = useTabsManager();
    const managerOptions = tabsManager.options ? (tabsManager.options as unknown as ITabsManagerOptions) : null;
    const { transitionProps, keepAliveProps, noActiveComponent } = managerOptions || {};
    const componentTabs = useComponentTabs(tabsManager, managerOptions);
    const iframeTabs = useIframeTabs(tabsManager, managerOptions);

    const keepAliveIncludes = computed<string[]>(() => {
      const cacheNames = tabsManager.tabs.filter(shouldCacheComponentTab).map(item => getTabCacheName(item._id));
      return [...new Set(cacheNames)];
    });

    const activeTabId = computed(() => tabsManager.activeTab?._id);

    provide(
      INJECT_ACTIVE_TAB_KEY,
      computed(() => tabsManager.activeTab)
    );

    const activeTabRender = () => {
      const tabId = activeTabId.value;
      if (!tabId) {
        if (noActiveComponent) {
          return createVNode(noActiveComponent);
        }
        return null;
      }

      const activeTab = tabsManager.activeTab;
      if (!activeTab || activeTab._isRefresh) {
        return null;
      }

      if (iframeTabs.activeCachedIframeTabId.value === tabId) {
        return null;
      }

      if (isIframeTab(activeTab)) {
        return iframeTabs.renderIframe(activeTab);
      }

      return createVNode(componentTabs.getTabWrapper(tabId), { key: tabId });
    };

    const keepAliveRender = () => {
      componentTabs.pruneStaleWrappers();
      return createVNode(
        KeepAlive,
        {
          ...keepAliveProps,
          include: keepAliveIncludes.value,
        },
        activeTabRender
      );
    };

    const transitionRender = () =>
      createVNode(
        Transition,
        {
          appear: true,
          mode: "out-in",
          ...transitionProps,
        },
        { default: keepAliveRender }
      );

    return () => {
      if (tabsManager.refreshAllTabFlag) return null;

      return createVNode(
        "div",
        {
          class: "dynamic-container",
          style: {
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          },
        },
        [
          iframeTabs.cachedIframeRender(),
          createVNode(
            "div",
            {
              class: "dynamic-container__view-layer",
              style: {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                overflow: "hidden",
                pointerEvents: iframeTabs.hasActiveCachedIframe.value ? "none" : "auto",
                zIndex: iframeTabs.hasActiveCachedIframe.value ? 0 : 2,
              },
            },
            [(transitionProps?.name ? transitionRender : keepAliveRender)()]
          ),
        ]
      );
    };
  },
});
