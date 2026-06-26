import { Comment, KeepAlive, Transition, computed, createVNode, defineComponent, provide, ref } from "vue";
import { INJECT_ACTIVE_TAB_KEY } from "@/shared";
import { useTabsManager } from "@/composables";
import type { ITabsManagerOptions } from "@/types";
import { DefaultEmptyComponent } from "@/components/default-state";
import { getTabCacheName, isIframeControllerTab, isIframeTab, shouldCacheComponentTab } from "./tab-cache";
import { useComponentTabs } from "./use-component-tabs";
import { useIframeTabs } from "./use-iframe-tabs";
import { useScrollRestore } from "./use-scroll-restore";
import { useTransitionRenderReady } from "./use-transition-render-ready";

export default defineComponent({
  name: "DynamicContainer",
  setup() {
    const tabsManager = useTabsManager();
    const managerOptions = tabsManager.options ? (tabsManager.options as unknown as ITabsManagerOptions) : null;
    const { transitionProps, keepAliveProps, noActiveComponent } = managerOptions || {};
    const componentTabs = useComponentTabs(tabsManager, managerOptions);
    const iframeTabs = useIframeTabs(tabsManager, managerOptions);
    const viewLayerRef = ref<HTMLElement>();
    const transitionRenderReady = useTransitionRenderReady(transitionProps);

    const keepAliveIncludes = computed<string[]>(() => {
      const cacheNames = tabsManager.tabs.filter(shouldCacheComponentTab).map(item => getTabCacheName(item._id));
      return [...new Set(cacheNames)];
    });

    const activeTabId = computed(() => tabsManager.activeTab?._id);
    useScrollRestore(tabsManager, activeTabId, viewLayerRef, transitionRenderReady.waitForRenderReady);

    provide(
      INJECT_ACTIVE_TAB_KEY,
      computed(() => tabsManager.activeTab)
    );

    const activeTabRender = () => {
      const tabId = activeTabId.value;
      if (!tabId) {
        return createVNode(noActiveComponent || DefaultEmptyComponent);
      }

      const activeTab = tabsManager.activeTab;
      if (!activeTab || activeTab._isRefresh || tabsManager.refreshAllTabFlag) {
        return createVNode(Comment);
      }

      if (iframeTabs.activeCachedIframeTabId.value === tabId && !isIframeControllerTab(activeTab)) {
        return createVNode(Comment);
      }

      if (isIframeTab(activeTab)) {
        if (isIframeControllerTab(activeTab)) return createVNode(Comment);
        return iframeTabs.renderIframe(activeTab);
      }

      return createVNode(componentTabs.getTabWrapper(tabId), { key: tabId });
    };

    const activeIframeControllerRender = () => {
      const tabId = activeTabId.value;
      const activeTab = tabsManager.activeTab;
      if (!tabId || !activeTab || activeTab._isRefresh || tabsManager.refreshAllTabFlag || !isIframeControllerTab(activeTab)) {
        return createVNode(Comment);
      }

      return createVNode(componentTabs.getTabWrapper(tabId), { key: tabId });
    };

    const hasActiveIframeController = computed(() => {
      const activeTab = tabsManager.activeTab;
      return Boolean(activeTab && !activeTab._isRefresh && isIframeControllerTab(activeTab));
    });

    const transitionFrameKey = computed(() => {
      const tabId = activeTabId.value || "empty";
      const refreshState = tabsManager.activeTab?._isRefresh || tabsManager.refreshAllTabFlag ? "refreshing" : "ready";
      return `${tabId}:${refreshState}`;
    });

    const keepAliveRender = () => {
      componentTabs.pruneStaleWrappers();
      return createVNode(
        KeepAlive,
        {
          ...keepAliveProps,
          include: keepAliveIncludes.value,
        },
        { default: activeTabRender }
      );
    };

    const transitionRender = () =>
      createVNode(
        Transition,
        {
          appear: true,
          mode: "out-in",
          ...transitionProps,
          ...transitionRenderReady.renderReadyTransitionHooks,
        },
        {
          default: () => [
            createVNode(
              "div",
              {
                key: transitionFrameKey.value,
                class: "dynamic-container__transition-frame",
                ariaHidden: "true",
                style: {
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  minHeight: 0,
                  overflow: "hidden",
                  pointerEvents: "none",
                  visibility: "hidden",
                },
              },
              []
            ),
          ],
        }
      );

    return () => {
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
          iframeTabs.hasCachedIframeTabs.value ? iframeTabs.cachedIframeRender() : null,
          hasActiveIframeController.value
            ? createVNode(
                "div",
                {
                  class: "dynamic-container__controller-layer",
                  style: {
                    display: "none",
                  },
                },
                [
                  createVNode(
                    KeepAlive,
                    {
                      ...keepAliveProps,
                      include: keepAliveIncludes.value,
                    },
                    { default: activeIframeControllerRender }
                  ),
                ]
              )
            : null,
          createVNode(
            "div",
            {
              ref: viewLayerRef,
              class: "dynamic-container__view-layer",
              style: {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                overflowX: transitionRenderReady.isRenderPending.value ? "hidden" : "auto",
                overflowY: "auto",
                scrollbarGutter: "stable",
                pointerEvents: iframeTabs.hasActiveCachedIframe.value ? "none" : "auto",
                zIndex: iframeTabs.hasActiveCachedIframe.value ? 0 : 2,
              },
            },
            [
              createVNode(
                "div",
                {
                  class: ["dynamic-container__transition-content", transitionRenderReady.renderTransitionClass.value],
                  style: {
                    width: "100%",
                    height: "100%",
                    minHeight: "100%",
                  },
                },
                [keepAliveRender()]
              ),
              transitionProps?.name ? transitionRender() : null,
            ]
          ),
        ]
      );
    };
  },
});
