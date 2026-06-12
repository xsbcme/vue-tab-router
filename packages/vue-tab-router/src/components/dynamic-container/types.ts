import type { ComponentPublicInstance } from "vue";
import type { DynamicIframeExpose } from "@/iframe-message";
import type { Tab } from "@/tab";
import { TabViewUrl } from "@/utils";

export type IframeRefValue = Element | ComponentPublicInstance | DynamicIframeExpose | null;

export const getTabCacheName = (tabId: string) => `TabCache_${tabId}`;

export const isIframeTab = (tab: Partial<Tab>) => TabViewUrl.isIframe(tab.viewUrl);

export const shouldCacheTab = (tab: Tab) => !tab._noCache && !tab._isRefresh;

export const shouldCacheComponentTab = (tab: Tab) => shouldCacheTab(tab) && !isIframeTab(tab);

export const shouldCacheIframeTab = (tab: Tab) => shouldCacheTab(tab) && isIframeTab(tab);
