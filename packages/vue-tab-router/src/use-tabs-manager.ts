import { inject, markRaw } from "vue";
import type { IframePostMessageOptions } from "./iframe-message";
import { TabsManager } from "./tabs-manager";
import { INJECT_CURRENT_TAB_KEY } from "./constant";
import {
  DefineEvents,
  IDefineTabOptions,
  ITabsManagerOptions,
  TabsManagerOptions,
  TabCloseGuard,
  TabEnterGuard,
  TabLeaveGuard,
} from "./types";
import { TABS_MANAGER_KEY } from "./tabs-manager-context";

function normalizeTabsManagerOptions(options: TabsManagerOptions): ITabsManagerOptions {
  const views = options.views;
  const storage = options.storage;
  const render = options.render;
  const iframe = options.iframe;
  const guards = options.guards;
  const detached = options.detached;
  const noActiveComponent = render?.noActiveComponent ? markRaw(render.noActiveComponent) : undefined;
  const noExistComponent = render?.noExistComponent ? markRaw(render.noExistComponent) : undefined;
  const loadingComponent = render?.loadingComponent ? markRaw(render.loadingComponent) : undefined;
  const errorComponent = render?.errorComponent ? markRaw(render.errorComponent) : undefined;
  const iframeLoadingComponent = iframe?.loadingComponent ? markRaw(iframe.loadingComponent) : undefined;

  return {
    modules: views.modules,
    viewMeta: views.meta,
    source: views.source,
    storageAdapter: storage?.adapter,
    storageKey: storage?.key,
    storageEnabled: storage?.enabled,
    plugins: options.plugins,
    transitionProps: render?.transition,
    keepAliveProps: render?.keepAlive,
    noActiveComponent,
    noExistComponent,
    loadingComponent,
    errorComponent,
    viewNameMaxLength: render?.viewNameMaxLength,
    tabsDraggable: render?.draggable,
    tabsShowIcon: render?.showIcon,
    iframeLoadingComponent,
    iframeMessageOrigins: iframe?.messageOrigins,
    onIframeLoad: iframe?.onLoad,
    onIframeMessage: iframe?.onMessage,
    onBeforeTabOpen: guards?.beforeOpen,
    onBeforeTabEnter: guards?.beforeEnter,
    onBeforeTabLeave: guards?.beforeLeave,
    onBeforeTabClose: guards?.beforeClose,
    detachedZIndex: detached?.zIndex,
    detachedFullscreen: detached?.fullscreen,
  };
}

/** 创建并初始化 TabsManager。 */
export function createTabsManager(options: TabsManagerOptions) {
  return new TabsManager(normalizeTabsManagerOptions(options));
}

/** 获取响应式 TabsManager 实例。 */
export function useTabsManager(): TabsManager {
  const tabsManager = inject(TABS_MANAGER_KEY);
  if (!tabsManager) {
    throw new Error("TabsManager 未提供，请先通过 app.use(tabsManager) 安装或在局部容器中 provide TabsManager。");
  }
  return tabsManager;
}

/** 获取当前页面所在 tabId。若不在容器上下文中则返回 `undefined`。 */
export function useTabId() {
  const tab = inject(INJECT_CURRENT_TAB_KEY);
  return tab?.value?._id;
}

/**
 * 向当前页面所在的 iframe 标签页发送消息。
 *
 * 这个方法适合在被 `DynamicContainerComponent` 渲染的页面组件内部使用，
 * 内部会自动读取当前 tabId，使用方通常不需要感知 `useTabId()`。
 */
export function postCurrentIframeMessage(data: unknown, options?: IframePostMessageOptions): boolean;
export function postCurrentIframeMessage(data: unknown, targetOrigin?: string, transfer?: Transferable[]): boolean;
export function postCurrentIframeMessage(
  data: unknown,
  optionsOrTargetOrigin?: IframePostMessageOptions | string,
  transfer?: Transferable[]
) {
  const tabId = useTabId();
  const options =
    typeof optionsOrTargetOrigin === "string"
      ? { targetOrigin: optionsOrTargetOrigin, transfer }
      : optionsOrTargetOrigin;
  return useTabsManager().postIframeMessage(tabId, data, options);
}

/**
 * 定义当前 tab 的展示与行为选项。
 * 仅在 tab 容器内生效。
 */
export function defineTabOptions(options: IDefineTabOptions) {
  const tab = inject(INJECT_CURRENT_TAB_KEY)?.value;
  if (tab) {
    const tabsManager = useTabsManager();
    tabsManager.updateTabOptions(
      {
        _viewName: tab.viewName || options.viewName,
        _viewIcon: tab.viewIcon || options.viewIcon,
        _viewSingle: tab._single ?? options.viewSingle,
        _viewNoCache: tab._noCache ?? options.viewNoCache,
        _viewPinned: tab._pinned ?? options.viewPinned,
        _viewNoDrag: tab._noDrag ?? options.viewNoDrag,
      },
      tab._id
    );
  }
}

/**
 * 定义当前 tab 可监听的事件。
 * 子 tab 可通过 `tabsManager.emit` 向其来源 tab 发送消息。
 */
export function defineTabEvents(events: DefineEvents) {
  const tab = inject(INJECT_CURRENT_TAB_KEY)?.value;
  if (tab) {
    const tabsManager = useTabsManager();
    const eventManager = tabsManager.events;
    Object.keys(events || {}).forEach(eventName => {
      // key: `${tabId}_${eventName}`
      const _key = `${tab?._id || ""}_${eventName}`;
      eventManager.off(_key);
      eventManager.on(_key, events[eventName]);
    });
  }
}

/**
 * 注册当前 tab 的离开守卫。
 * 返回 false、rejected Promise（或抛错）会阻止切换。
 */
export function onBeforeTabLeave(guard: TabLeaveGuard) {
  const id = useTabId();
  if (id) {
    useTabsManager()._registerTabGuard(id, "_onBeforeTabLeave", guard);
  }
}

/**
 * 注册当前 tab 的关闭守卫。
 * 返回 false、rejected Promise（或抛错）会阻止关闭。
 */
export function onBeforeTabClose(guard: TabCloseGuard) {
  const id = useTabId();
  if (id) {
    useTabsManager()._registerTabGuard(id, "_onBeforeTabClose", guard);
  }
}

/**
 * 注册当前 tab 的进入守卫。
 * 当此 tab 被激活时触发（包括从 keep-alive 缓存中恢复）。
 * 返回 false、rejected Promise（或抛错）会阻止激活。
 */
export function onBeforeTabEnter(guard: TabEnterGuard) {
  const id = useTabId();
  if (id) {
    useTabsManager()._registerTabGuard(id, "_onBeforeTabEnter", guard);
  }
}
