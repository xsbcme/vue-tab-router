import {
  Component,
  KeepAlive,
  Transition,
  computed,
  createVNode,
  defineComponent,
  getCurrentInstance,
  provide,
} from "vue";
import { INJECT_ACTIVE_TAB_KEY, INJECT_CURRENT_TAB_KEY, RELATIVE_VIEW_URL_PREFIX_KEY } from "@/constant";
import { clone, findVueComponent, isHttpUrl, resolveViewUrl } from "@/utils";
import { useTabsManager } from "@/use-tabs-manager";

import DynamicIframeComponent from "@/components/dynamic-iframe.vue";

const getTabCacheName = (tabId: string) => `TabCache_${tabId}`;

export default defineComponent({
  name: "DynamicContainer",
  setup() {
    const instance = getCurrentInstance();
    const tabsManager = useTabsManager();
    const { transitionProps, keepAliveProps, noActiveComponent, noExistComponent, onIframeLoad } =
      tabsManager.options || {};
    const tabWrapperMap = new Map<string, Component>();

    const keepAliveIncludes = computed<string[]>(() => {
      const cacheNames = tabsManager.tabs
        .filter(item => !item._noCache && !item._isRefresh)
        .map(item => getTabCacheName(item._id));
      return [...new Set(cacheNames)];
    });

    const activeTabId = computed(() => tabsManager.activeTab?._id);

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
                link: viewUrl,
                linkProps: currentTab.viewProps,
                onLoad: (e: Event) => {
                  onIframeLoad && onIframeLoad(e, clone(currentTab));
                },
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

      return createVNode(getTabWrapper(tabId), { key: tabId });
    };

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

    return () =>
      !tabsManager.refreshAllTabFlag ? (transitionProps?.name ? transitionRender : keepAliveRender)() : null;
  },
});
