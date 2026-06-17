import { createVNode } from "vue";
import type { Tab } from "@/tabs/tab";
import type { TabsManager } from "@/tabs/tabs-manager";
import type { ITabsManagerOptions } from "@/types";
import { clone, TabViewUrl } from "@/shared";
import type { IframeRefValue } from "../types";
import DynamicIframeComponent from "@/components/dynamic-iframe.vue";
import type { IframeMessageDispatcher } from "./iframe-message-dispatcher";
import type { IframeTabRegistry } from "./iframe-tab-registry";
import type { IframeControllerStyleManager } from "./iframe-controller-style";

function getUrlQueryKeys(url: string) {
  const hashIndex = url.indexOf("#");
  const linkWithoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const queryIndex = linkWithoutHash.indexOf("?");
  if (queryIndex < 0) return new Set<string>();

  const queryParams = new URLSearchParams(linkWithoutHash.slice(queryIndex + 1));
  return new Set(queryParams.keys());
}

function getIframeLinkProps(link: string, linkProps: Record<string, unknown> | undefined) {
  const existingQueryKeys = getUrlQueryKeys(link);
  if (!existingQueryKeys.size) return linkProps;

  return Object.fromEntries(Object.entries(linkProps || {}).filter(([key]) => !existingQueryKeys.has(key)));
}

export function createIframeRenderer(
  tabsManager: TabsManager,
  managerOptions: ITabsManagerOptions | null,
  iframeRegistry: IframeTabRegistry,
  iframeDispatcher: IframeMessageDispatcher,
  styleManager: IframeControllerStyleManager
) {
  const renderIframe = (currentTab: Tab) => {
    const controllerOptions = tabsManager._getIframeControllerOptions(currentTab._id);
    const viewUrl = TabViewUrl.resolveIframe(controllerOptions?.src || currentTab.viewUrl);
    return createVNode(DynamicIframeComponent, {
      ref: (exposed: IframeRefValue) => iframeRegistry.setIframeRef(currentTab._id, exposed),
      link: viewUrl,
      linkProps: getIframeLinkProps(viewUrl, currentTab.viewProps),
      loadingComponent: managerOptions?.iframeLoadingComponent || managerOptions?.loadingComponent,
      allowedOrigins: controllerOptions?.messageOrigins || managerOptions?.iframeMessageOrigins,
      messageTab: clone(currentTab),
      onLoad: (e: Event, iframe: HTMLIFrameElement) => {
        const latestTab = tabsManager.getTabById(currentTab._id) || currentTab;
        iframeRegistry.setLoadedIframe(latestTab._id, iframe);
        const payload = { event: e, iframe, tab: clone(latestTab) };
        const latestControllerOptions = tabsManager._getIframeControllerOptions(latestTab._id);
        styleManager.applyLoadedIframeControllerStyles(latestTab, iframe);
        latestControllerOptions?.onLoad?.(payload);
        managerOptions?.onIframeLoad?.(payload);
        tabsManager.hooks.call("iframe:load", payload);
      },
      onMessage: (e: MessageEvent) => iframeDispatcher.emitIframeMessage(e, currentTab),
    });
  };

  const renderCachedIframeLayer = (cachedIframeTabs: Tab[], activeCachedIframeTabId: string | undefined) =>
    createVNode(
      "div",
      {
        class: "dynamic-container__iframe-layer",
        style: {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 1,
        },
      },
      cachedIframeTabs.map(currentTab => {
        const isActive = activeCachedIframeTabId === currentTab._id;
        return createVNode(
          "div",
          {
            key: iframeRegistry.getIframeRenderKey(currentTab._id),
            class: "dynamic-container__iframe-item",
            style: {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              overflow: "hidden",
              visibility: isActive ? "visible" : "hidden",
              pointerEvents: isActive ? "auto" : "none",
              zIndex: isActive ? 1 : 0,
            },
          },
          [renderIframe(currentTab)]
        );
      })
    );

  return {
    renderCachedIframeLayer,
    renderIframe,
  };
}
