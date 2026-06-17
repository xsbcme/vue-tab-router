import { onBeforeUnmount } from "vue";
import type { Tab } from "@/tabs/tab";
import type { TabsManager } from "@/tabs/tabs-manager";
import { isIframeTab } from "../tab-cache";
import type { IframeControllerStyleManager } from "./iframe-controller-style";
import type { IframeTabRegistry } from "./iframe-tab-registry";

export function useIframeLifecycle(
  tabsManager: TabsManager,
  iframeRegistry: IframeTabRegistry,
  iframeControllerStyles: IframeControllerStyleManager
) {
  tabsManager._setIframeMessenger((tabId, data, targetOrigin, transfer) => {
    return iframeRegistry.postMessage(tabId, data, targetOrigin, transfer);
  });

  const hookCleanups = [
    tabsManager.hooks.on("tab:before-refresh", tab => {
      if (!tab._id || !isIframeTab(tab)) return;
      iframeRegistry.refreshIframeTab(tab._id);
    }),
    tabsManager.hooks.on("tab:closed", tab => {
      iframeRegistry.cleanupIframeTab(tab._id);
      tabsManager._clearIframeControllerOptions(tab._id);
    }),
    tabsManager.hooks.on("iframe:controller-options-updated", tab => {
      if (!tab?._id) return;
      iframeControllerStyles.syncLoadedIframeControllerStyles(tab as Tab);
    }),
    tabsManager.hooks.on("tabs:cleared", () => {
      iframeRegistry.clear();
    }),
  ];

  onBeforeUnmount(() => {
    hookCleanups.forEach(cleanup => cleanup());
    tabsManager._setIframeMessenger(undefined);
    iframeRegistry.clear();
  });
}
