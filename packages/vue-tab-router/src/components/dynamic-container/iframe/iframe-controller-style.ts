import type { Tab } from "@/tabs/tab";
import type { TabsManager } from "@/tabs/tabs-manager";
import type { IframeTabRegistry } from "./iframe-tab-registry";

export function createIframeControllerStyleManager(tabsManager: TabsManager, iframeRegistry: IframeTabRegistry) {
  function injectIframeControllerStyles(iframe: HTMLIFrameElement, styles: string | undefined) {
    if (!styles) return;
    try {
      const iframeDocument = iframe.contentDocument;
      if (!iframeDocument) return;
      iframeDocument.head.querySelector("style[data-tab-router-iframe-controller]")?.remove();
      const style = iframeDocument.createElement("style");
      style.dataset.tabRouterIframeController = "";
      style.textContent = styles;
      iframeDocument.head.appendChild(style);
    } catch (error) {
      // 跨域 iframe 无法访问 contentDocument，局部样式注入会被跳过。
    }
  }

  function syncLoadedIframeControllerStyles(tab: Pick<Tab, "_id">) {
    const tabId = tab._id;
    const iframe = iframeRegistry.getLoadedIframe(tabId);
    if (!iframe) return;

    const controllerOptions = tabsManager._getIframeControllerOptions(tabId);
    injectIframeControllerStyles(iframe, controllerOptions?.styles);
  }

  function applyLoadedIframeControllerStyles(tab: Pick<Tab, "_id">, iframe: HTMLIFrameElement) {
    const tabId = tab._id;
    const controllerOptions = tabsManager._getIframeControllerOptions(tabId);
    injectIframeControllerStyles(iframe, controllerOptions?.styles);
  }

  return {
    applyLoadedIframeControllerStyles,
    syncLoadedIframeControllerStyles,
  };
}

export type IframeControllerStyleManager = ReturnType<typeof createIframeControllerStyleManager>;
