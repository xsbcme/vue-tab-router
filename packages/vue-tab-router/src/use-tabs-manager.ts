import { reactive, UnwrapRef, inject } from "vue";
import { TabsManager } from "./tabs-manager";
import { INJECT_CURRENT_TAB_KEY } from "./constant";
import { DefineEvents, IDefineTabOptions, ITabsManagerOptions, TabGuard } from "./types";
import { useEventManager } from "./use-event-manager";

/** 创建并初始化 TabsManager 单例。 */
export function createTabsManager(options: ITabsManagerOptions) {
  return TabsManager.getInstance()._initOptions(options);
}

/** 获取响应式 TabsManager 实例。 */
export function useTabsManager(): UnwrapRef<TabsManager> {
  return reactive(TabsManager.getInstance());
}

/** 获取当前页面所在 tabId。若不在容器上下文中则返回 `undefined`。 */
export function useTabId() {
  const tab = inject(INJECT_CURRENT_TAB_KEY);
  return tab?._id;
}

/**
 * 定义当前 tab 的展示与行为选项。
 * 仅在 tab 容器内生效。
 */
export function defineTabOptions(options: IDefineTabOptions) {
  const tab = inject(INJECT_CURRENT_TAB_KEY);
  if (tab) {
    const tabsManager = useTabsManager();
    tabsManager.updateTabOptions(
      {
        _viewName: tab.viewName || options.viewName,
        _viewIcon: tab.viewIcon || options.viewIcon,
        _viewSingle: tab._single ?? options.viewSingle,
        _viewNoCache: tab._noCache ?? options.viewNoCache,
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
  const tab = inject(INJECT_CURRENT_TAB_KEY);
  if (tab) {
    const eventManager = useEventManager();
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
 * 返回 rejected Promise（或抛错）会阻止切换。
 */
export function onBeforeTabLeave(guard: TabGuard) {
  const id = useTabId();
  if (id) {
    useTabsManager()._registerTabGuard(id, "_onBeforeTabLeave", guard);
  }
}

/**
 * 注册当前 tab 的关闭守卫。
 * 返回 rejected Promise（或抛错）会阻止关闭。
 */
export function onBeforeTabClose(guard: TabGuard) {
  const id = useTabId();
  if (id) {
    useTabsManager()._registerTabGuard(id, "_onBeforeTabClose", guard);
  }
}

/**
 * 注册当前 tab 的进入守卫。
 * 当此 tab 被激活时触发（包括从 keep-alive 缓存中恢复）。
 * 返回 rejected Promise（或抛错）会阻止激活。
 */
export function onBeforeTabEnter(guard: TabGuard) {
  const id = useTabId();
  if (id) {
    useTabsManager()._registerTabGuard(id, "_onBeforeTabEnter", guard);
  }
}
