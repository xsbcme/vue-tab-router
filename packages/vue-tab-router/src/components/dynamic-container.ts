import {
  Component,
  ComponentPublicInstance,
  KeepAlive,
  Transition,
  computed,
  createVNode,
  defineComponent,
  getCurrentInstance,
  provide,
} from "vue";
import { INJECT_ACTIVE_TAB_KEY, INJECT_CURRENT_TAB_KEY, RELATIVE_VIEW_URL_PREFIX_KEY } from "@/constant";
import type { DynamicIframeExpose, IframeMessageEvent } from "@/iframe-message";
import { clone, findVueComponent, isHttpUrl, resolveViewUrl } from "@/utils";
import { useTabsManager } from "@/use-tabs-manager";

import DynamicIframeComponent from "@/components/dynamic-iframe.vue";
import type { Tab } from "@/tab";
import type { ITabsManagerOptions } from "@/types";

type IframeRefValue = Element | ComponentPublicInstance | DynamicIframeExpose | null;

const getTabCacheName = (tabId: string) => `TabCache_${tabId}`;

const isIframeTab = (tab: Tab) => tab.viewUrl.startsWith(RELATIVE_VIEW_URL_PREFIX_KEY) || isHttpUrl(tab.viewUrl);

const shouldCacheTab = (tab: Tab) => !tab._noCache && !tab._isRefresh;

const shouldCacheComponentTab = (tab: Tab) => shouldCacheTab(tab) && !isIframeTab(tab);

const shouldCacheIframeTab = (tab: Tab) => shouldCacheTab(tab) && isIframeTab(tab);

export default defineComponent({
  name: "DynamicContainer",
  setup() {
    const instance = getCurrentInstance();
    const tabsManager = useTabsManager();
    const managerOptions = tabsManager.options ? (tabsManager.options as unknown as ITabsManagerOptions) : null;
    const {
      transitionProps,
      keepAliveProps,
      noActiveComponent,
      noExistComponent,
      onIframeLoad,
      onIframeMessage,
    } = managerOptions || {};
    const tabWrapperMap = new Map<string, Component>();
    const iframeRefs = new Map<string, DynamicIframeExpose>();

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

    const emitIframeMessage = (e: MessageEvent, tab: Tab) => {
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
      onIframeMessage && onIframeMessage(payload);
      tabsManager.hooks.call("iframe:message", payload);
    };

    const keepAliveIncludes = computed<string[]>(() => {
      const cacheNames = tabsManager.tabs
        .filter(shouldCacheComponentTab)
        .map(item => getTabCacheName(item._id));
      return [...new Set(cacheNames)];
    });

    const activeTabId = computed(() => tabsManager.activeTab?._id);

    const cachedIframeTabs = computed(() => tabsManager.tabs.filter(shouldCacheIframeTab));

    const activeCachedIframeTabId = computed(() => {
      const activeTab = tabsManager.activeTab;
      return activeTab && shouldCacheIframeTab(activeTab) ? activeTab._id : undefined;
    });

    const hasActiveCachedIframe = computed(() => Boolean(activeCachedIframeTabId.value));

    provide(
      INJECT_ACTIVE_TAB_KEY,
      computed(() => tabsManager.activeTab)
    );

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

          return () => {
            const currentTab = tabsManager.getTabById(tabId);
            if (!currentTab || currentTab._isRefresh) return null;

            if (currentTab.viewUrl.startsWith(RELATIVE_VIEW_URL_PREFIX_KEY) || isHttpUrl(currentTab.viewUrl)) {
              const viewUrl = resolveViewUrl(currentTab.viewUrl);
              return createVNode(DynamicIframeComponent, {
                key: currentTab._id,
                ref: (exposed: IframeRefValue) => setIframeRef(currentTab._id, exposed),
                link: viewUrl,
                linkProps: currentTab.viewProps,
                allowedOrigins: managerOptions?.iframeMessageOrigins,
                messageTab: clone(currentTab),
                onLoad: (e: Event, iframe: HTMLIFrameElement) => {
                  onIframeLoad && onIframeLoad({ event: e, iframe, tab: clone(currentTab) });
                },
                onMessage: (e: MessageEvent) => emitIframeMessage(e, currentTab),
              });
            }

            const comp = findVueComponent(instance, currentTab.viewUrl);
            if (!comp) {
              if (noExistComponent) {
                return createVNode(noExistComponent);
              }
              return createVNode("div", null, "此页面不存在！");
            }

            return createVNode(comp, {
              ...clone(currentTab.viewProps || {}),
            });
          };
        },
      });

      tabWrapperMap.set(tabId, wrapper);
      return wrapper;
    };

    const activeTabRender = () => {
      const tabId = activeTabId.value;
      if (!tabId) {
        if (noActiveComponent) {
          return createVNode(noActiveComponent);
        }
        return null;
      }

      if (tabsManager.activeTab?._isRefresh) {
        return null;
      }

      if (activeCachedIframeTabId.value === tabId) {
        return null;
      }

      return createVNode(getTabWrapper(tabId), { key: tabId });
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
          const viewUrl = resolveViewUrl(currentTab.viewUrl);
          return createVNode(
            "div",
            {
              key: currentTab._id,
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
            [
              createVNode(DynamicIframeComponent, {
                ref: (exposed: IframeRefValue) => setIframeRef(currentTab._id, exposed),
                link: viewUrl,
                linkProps: currentTab.viewProps,
                allowedOrigins: managerOptions?.iframeMessageOrigins,
                messageTab: clone(currentTab),
                onLoad: (e: Event, iframe: HTMLIFrameElement) => {
                  const latestTab = tabsManager.getTabById(currentTab._id) || currentTab;
                  onIframeLoad && onIframeLoad({ event: e, iframe, tab: clone(latestTab) });
                },
                onMessage: (e: MessageEvent) => emitIframeMessage(e, currentTab),
              }),
            ]
          );
        })
      );

    const keepAliveRender = () => {
      pruneStaleWrappers();
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
          cachedIframeRender(),
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
                pointerEvents: hasActiveCachedIframe.value ? "none" : "auto",
                zIndex: hasActiveCachedIframe.value ? 0 : 2,
              },
            },
            [(transitionProps?.name ? transitionRender : keepAliveRender)()]
          ),
        ]
      );
    };
  },
});
