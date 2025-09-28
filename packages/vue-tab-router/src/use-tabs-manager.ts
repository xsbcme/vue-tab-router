import { reactive, UnwrapRef, inject } from "vue";
import { TabsManager } from "./tabs-manager";
import { INJECT_CURRENT_TAB_KEY } from "./constant";
import { DefineEvents, IDefineTabOptions, ITabsManagerOptions, TabGuard } from "./types";
import { useEventManager } from "./use-event-manager";

/**
 * 创建标签页路由服务
 */

export function createTabsManager(options: ITabsManagerOptions) {
    return TabsManager.getInstance()._initOptions(options);
}

/**
 * 标签页路由服务
 */
export function useTabsManager(): UnwrapRef<TabsManager> {
    return reactive(TabsManager.getInstance());
}

/**
 * 当前页面所对应的标签页ID
 */
export function useTabId() {
    const tab = inject(INJECT_CURRENT_TAB_KEY);
    return tab?._id;
}

/**
 * 定义标签页参数
 * @param options 标签页参数
 */
export function defineTabOptions(options: IDefineTabOptions) {
    const tab = inject(INJECT_CURRENT_TAB_KEY);
    if (tab) {
        const tabsManager = useTabsManager();
        tabsManager.updateTabOptions({
            _viewName: tab.viewName || options.viewName,
            _viewIcon: tab.viewIcon || options.viewIcon,
            _viewSingle: tab._single ?? options.viewSingle,
            _viewNoCahce: tab._noCache ?? options.viewNoCahce
        }, tab._id);
    }
}

/**
 * 定义标签页事件 子页面通过emit触发事件
 * @param options 定义事件
 */
export function defineTabEvents(events: DefineEvents) {
    const tab = inject(INJECT_CURRENT_TAB_KEY);
    if (tab) {
        const eventManager = useEventManager();
        Object.keys(events || {}).forEach(eventName => {
            // 当前标签页_事件名称
            const _key = `${tab?._id || ''}_${eventName}`;
            eventManager.off(_key);
            eventManager.on(_key, events[eventName]);
        });
    }
}

// /**
//  * 路由守卫 - 标签页打开前条用
//  * @param guard 执行回调
//  */
// export function onBeforeTabOpen(guard: TabGuard) {
//     const id = useTabId();
//     if (id) {
//         useTabsManager()._registerTabGuard(id, '_onBeforeTabOpen', guard);
//     }
// }

// /**
//  * 路由守卫 - 标签页进入前条用
//  * @param guard 执行回调
//  */
// export function onBeforeTabEnter(guard: TabGuard) {
//     const id = useTabId();
//     if (id) {
//         useTabsManager()._registerTabGuard(id, '_onBeforeTabEnter', guard);
//     }
// }

/**
 * 路由守卫 - 标签页离开前条用
 * @param guard 执行回调
 */
export function onBeforeTabLeave(guard: TabGuard) {
    const id = useTabId();
    if (id) {
        useTabsManager()._registerTabGuard(id, '_onBeforeTabLeave', guard);
    }
}

/**
 * 路由守卫 - 标签页关闭前条用
 * @param guard 执行回调
 */
export function onBeforeTabClose(guard: TabGuard) {
    const id = useTabId();
    if (id) {
        useTabsManager()._registerTabGuard(id, '_onBeforeTabClose', guard);
    }
}