import { reactive } from "vue";
import type { DynamicIframeExpose } from "@/iframe/iframe-message";
import type { IframeRefValue } from "../types";

export function createIframeTabRegistry() {
  const iframeRefs = new Map<string, DynamicIframeExpose>();
  const loadedIframes = new Map<string, HTMLIFrameElement>();
  const iframeRefreshKeys = reactive(new Map<string, number>());

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

  const postMessage = (tabId: string, data: unknown, targetOrigin?: string, transfer?: Transferable[]) => {
    return Boolean(iframeRefs.get(tabId)?.postMessage(data, targetOrigin, transfer));
  };

  const getIframeRenderKey = (tabId: string) => `${tabId}_${iframeRefreshKeys.get(tabId) || 0}`;

  const setLoadedIframe = (tabId: string, iframe: HTMLIFrameElement) => {
    loadedIframes.set(tabId, iframe);
  };

  const getLoadedIframe = (tabId: string) => loadedIframes.get(tabId);

  const refreshIframeTab = (tabId: string) => {
    iframeRefs.delete(tabId);
    loadedIframes.delete(tabId);
    iframeRefreshKeys.set(tabId, (iframeRefreshKeys.get(tabId) || 0) + 1);
  };

  const cleanupIframeTab = (tabId: string | undefined) => {
    if (!tabId) return;
    iframeRefs.delete(tabId);
    loadedIframes.delete(tabId);
    iframeRefreshKeys.delete(tabId);
  };

  const clear = () => {
    iframeRefs.clear();
    loadedIframes.clear();
    iframeRefreshKeys.clear();
  };

  return {
    cleanupIframeTab,
    clear,
    getIframeRenderKey,
    getLoadedIframe,
    postMessage,
    refreshIframeTab,
    setIframeRef,
    setLoadedIframe,
  };
}

export type IframeTabRegistry = ReturnType<typeof createIframeTabRegistry>;
