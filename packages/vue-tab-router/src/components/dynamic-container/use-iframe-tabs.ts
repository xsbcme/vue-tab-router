import { computed } from "vue";
import type { TabsManager } from "@/tabs/tabs-manager";
import type { ITabsManagerOptions } from "@/types";
import { shouldCacheIframeTab } from "./tab-cache";
import {
  createIframeControllerStyleManager,
  createIframeMessageDispatcher,
  createIframeRenderer,
  createIframeTabRegistry,
} from "./iframe";
import { useIframeLifecycle } from "./iframe/iframe-lifecycle";

export function useIframeTabs(tabsManager: TabsManager, managerOptions: ITabsManagerOptions | null) {
  const iframeRegistry = createIframeTabRegistry();
  const iframeMessageDispatcher = createIframeMessageDispatcher(tabsManager, managerOptions);
  const iframeControllerStyles = createIframeControllerStyleManager(tabsManager, iframeRegistry);
  const iframeRenderer = createIframeRenderer(
    tabsManager,
    managerOptions,
    iframeRegistry,
    iframeMessageDispatcher,
    iframeControllerStyles
  );
  useIframeLifecycle(tabsManager, iframeRegistry, iframeControllerStyles);

  const cachedIframeTabs = computed(() => tabsManager.tabs.filter(shouldCacheIframeTab));

  const hasCachedIframeTabs = computed(() => cachedIframeTabs.value.length > 0);

  const activeCachedIframeTabId = computed(() => {
    const activeTab = tabsManager.activeTab;
    return activeTab && shouldCacheIframeTab(activeTab) ? activeTab._id : undefined;
  });

  const hasActiveCachedIframe = computed(() => Boolean(activeCachedIframeTabId.value));

  const cachedIframeRender = () =>
    iframeRenderer.renderCachedIframeLayer(cachedIframeTabs.value, activeCachedIframeTabId.value);

  return {
    activeCachedIframeTabId,
    cachedIframeRender,
    getIframeRenderKey: iframeRegistry.getIframeRenderKey,
    hasActiveCachedIframe,
    hasCachedIframeTabs,
    renderIframe: iframeRenderer.renderIframe,
  };
}
