import { computed, createVNode, onBeforeUnmount, reactive } from "vue";
import type { DynamicIframeExpose, IframeMessageEvent } from "@/iframe/iframe-message";
import { createIframeTabClientResponse, isIframeTabClientRequest } from "@/iframe/iframe-tab-client-protocol";
import type { Tab } from "@/tabs/tab";
import type { TabsManager } from "@/tabs/tabs-manager";
import type { ITabsManagerOptions } from "@/types";
import { clone, TabViewUrl } from "@/shared";
import DynamicIframeComponent from "@/components/dynamic-iframe.vue";
import { IframeRefValue, isIframeTab, shouldCacheIframeTab } from "./types";

export function useIframeTabs(tabsManager: TabsManager, managerOptions: ITabsManagerOptions | null) {
  const { onIframeLoad, onIframeMessage } = managerOptions || {};
  const iframeRefs = new Map<string, DynamicIframeExpose>();
  const iframeRefreshKeys = reactive(new Map<string, number>());

  tabsManager._setIframeMessenger((tabId, data, targetOrigin, transfer) => {
    return Boolean(iframeRefs.get(tabId)?.postMessage(data, targetOrigin, transfer));
  });

  const isDynamicIframeExpose = (value: IframeRefValue): value is DynamicIframeExpose => {
    return Boolean(value && "postMessage" in value && typeof value.postMessage === "function");
  };

  const setIframeRef = (tabId: string, exposed: IframeRefValue) => {
    if (isDynamicIframeExpose(exposed)) {
      iframeRefs.set(tabId, exposed);
    } else {
      iframeRefs.delete(tabId);
    }
  };

  const getIframeRenderKey = (tabId: string) => `${tabId}_${iframeRefreshKeys.get(tabId) || 0}`;

  const cleanupIframeTab = (tabId: string | undefined) => {
    if (!tabId) return;
    iframeRefs.delete(tabId);
    iframeRefreshKeys.delete(tabId);
  };

  const hookCleanups = [
    tabsManager.hooks.on("tab:before-refresh", tab => {
      if (!tab._id || !isIframeTab(tab)) return;
      iframeRefs.delete(tab._id);
      iframeRefreshKeys.set(tab._id, (iframeRefreshKeys.get(tab._id) || 0) + 1);
    }),
    tabsManager.hooks.on("tab:closed", tab => cleanupIframeTab(tab._id)),
    tabsManager.hooks.on("tabs:cleared", () => {
      iframeRefs.clear();
      iframeRefreshKeys.clear();
    }),
  ];

  onBeforeUnmount(() => {
    hookCleanups.forEach(cleanup => cleanup());
    tabsManager._setIframeMessenger(undefined);
    iframeRefs.clear();
    iframeRefreshKeys.clear();
  });

  const handleIframeTabClientRequest = async (message: IframeMessageEvent) => {
    if (!isIframeTabClientRequest(message.data)) return false;

    const request = message.data;
    const tabId = message.tabId;
    const reply = (ok: boolean, data?: unknown, error?: string) => {
      const response = createIframeTabClientResponse(request, ok, data, error);
      if (message.source && "postMessage" in message.source) {
        (message.source.postMessage as (message: unknown, targetOrigin: string) => void)(response, message.origin);
        return;
      }
      message.reply(response);
    };

    try {
      if (!tabId) throw new Error("当前 iframe 页签不存在");

      switch (request.action) {
        case "tab:get":
          reply(true, clone(tabsManager.getTabById(tabId) || message.tab));
          break;
        case "tab:open": {
          const payload = request.payload || {};
          const viewUrl = payload.viewUrl;
          if (typeof viewUrl !== "string") throw new Error("tab:open 需要传入 viewUrl");
          const openedTabId = await tabsManager.openTab(viewUrl, payload.options as Record<string, unknown> | undefined);
          reply(true, openedTabId);
          break;
        }
        case "tab:refresh":
          await tabsManager.refreshTab(tabId);
          reply(true, true);
          break;
        case "tab:close":
          await tabsManager.closeTab(tabId);
          reply(true, true);
          break;
        case "tab:update":
          await tabsManager.updateTabOptions((request.payload?.options || {}) as Record<string, unknown>, tabId);
          reply(true, true);
          break;
        case "tab:emit": {
          const payload = request.payload || {};
          const eventName = payload.eventName;
          if (typeof eventName !== "string") throw new Error("tab:emit 需要传入 eventName");
          tabsManager.emit(eventName, payload.data, tabId);
          reply(true, true);
          break;
        }
        default:
          throw new Error(`未知 iframe tab client 动作：${request.action}`);
      }
    } catch (error) {
      reply(false, undefined, error instanceof Error ? error.message : String(error));
    }

    return true;
  };

  const emitIframeMessage = async (e: MessageEvent, tab: Tab) => {
    const latestTab = tabsManager.getTabById(tab._id) || tab;
    const payload: IframeMessageEvent = {
      data: e.data,
      origin: e.origin,
      source: e.source,
      rawEvent: e,
      tab: clone(latestTab),
      tabId: latestTab._id,
      reply: (data, options = {}) => {
        return tabsManager.postIframeMessage(latestTab._id, data, {
          targetOrigin: options.targetOrigin ?? e.origin,
          transfer: options.transfer,
        });
      },
    };

    if (await handleIframeTabClientRequest(payload)) return;

    onIframeMessage && onIframeMessage(payload);
    await tabsManager.hooks.call("iframe:message", payload);
  };

  const cachedIframeTabs = computed(() => tabsManager.tabs.filter(shouldCacheIframeTab));

  const activeCachedIframeTabId = computed(() => {
    const activeTab = tabsManager.activeTab;
    return activeTab && shouldCacheIframeTab(activeTab) ? activeTab._id : undefined;
  });

  const hasActiveCachedIframe = computed(() => Boolean(activeCachedIframeTabId.value));

  const renderIframe = (currentTab: Tab) => {
    const viewUrl = TabViewUrl.resolveIframe(currentTab.viewUrl);
    return createVNode(DynamicIframeComponent, {
      ref: (exposed: IframeRefValue) => setIframeRef(currentTab._id, exposed),
      link: viewUrl,
      linkProps: currentTab.viewProps,
      loadingComponent: managerOptions?.iframeLoadingComponent || managerOptions?.loadingComponent,
      allowedOrigins: managerOptions?.iframeMessageOrigins,
      messageTab: clone(currentTab),
      onLoad: (e: Event, iframe: HTMLIFrameElement) => {
        const latestTab = tabsManager.getTabById(currentTab._id) || currentTab;
        const payload = { event: e, iframe, tab: clone(latestTab) };
        onIframeLoad && onIframeLoad(payload);
        tabsManager.hooks.call("iframe:load", payload);
      },
      onMessage: (e: MessageEvent) => emitIframeMessage(e, currentTab),
    });
  };

  const cachedIframeRender = () =>
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
      cachedIframeTabs.value.map(currentTab => {
        const isActive = activeCachedIframeTabId.value === currentTab._id;
        return createVNode(
          "div",
          {
            key: getIframeRenderKey(currentTab._id),
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
    activeCachedIframeTabId,
    cachedIframeRender,
    getIframeRenderKey,
    hasActiveCachedIframe,
    renderIframe,
  };
}
