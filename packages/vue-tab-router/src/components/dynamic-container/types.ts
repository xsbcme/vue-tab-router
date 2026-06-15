import type { ComponentPublicInstance } from "vue";
import type { DynamicIframeExpose } from "@/iframe/iframe-message";
import type { Tab } from "@/tabs/tab";
import { TabViewUrl } from "@/shared";

export type IframeRefValue = Element | ComponentPublicInstance | DynamicIframeExpose | null;

export const getTabCacheName = (tabId: string) => `TabCache_${tabId}`;

export const isIframeTab = (tab: Partial<Tab>) => TabViewUrl.isIframe(tab.viewUrl);

export const isIframeControllerTab = (tab: Partial<Tab>) => TabViewUrl.isIframeController(tab.viewUrl);

export const shouldCacheTab = (tab: Tab) => !tab._noCache && !tab._isRefresh;

export const shouldCacheComponentTab = (tab: Tab) => shouldCacheTab(tab) && (!isIframeTab(tab) || isIframeControllerTab(tab));

export const shouldCacheIframeTab = (tab: Tab) => shouldCacheTab(tab) && isIframeTab(tab);
