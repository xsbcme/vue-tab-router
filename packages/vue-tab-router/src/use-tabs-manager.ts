import { reactive, UnwrapRef, inject } from "vue";
import { TabsManager } from "./tabs-manager";
import { INJECT_CURRENT_TAB_KEY } from "./constant";
import { DefineEvents, IDefineTabOptions, ITabsManagerOptions, TabGuard } from "./types";
import { useEventManager } from "./use-event-manager";

/**
 * 创建并初始化标签页路由管理器实例
 * 
 * 此函数用于创建和配置 TabsManager 单例实例，是使用 vue-tab-router 的入口点。
 * 它会获取 TabsManager 的单例，并使用提供的选项进行初始化配置。
 * 
 * @param options - 标签页管理器配置选项
 * @param options.modules - 组件模块映射，键为组件名称，值为组件导入函数或组件对象
 * @param options.storageAdapter - 自定义存储适配器，用于持久化标签页状态
 * @param options.source - 异步组件加载配置选项
 * @param options.onBeforeTabEnter - 标签页激活前的全局守卫函数
 * @param options.onBeforeTabOpen - 标签页打开前的全局守卫函数
 * 
 * @returns 初始化后的 TabsManager 实例
 * 
 * @example
 * ```typescript
 * import { createTabsManager } from 'vue-tab-router';
 * import type { ITabsManagerOptions } from 'vue-tab-router/types';
 * 
 * const options: ITabsManagerOptions = {
 *   modules: {
 *     Home: () => import('./views/Home.vue'),
 *     About: () => import('./views/About.vue'),
 *     User: () => import('./views/User.vue')
 *   },
 *   onBeforeTabEnter: async (tab, sourceTab) => {
 *     console.log('即将进入标签页:', tab);
 *   }
 * };
 * 
 * const tabsManager = createTabsManager(options);
 * ```
 * 
 * @since 1.0.0
 */
export function createTabsManager(options: ITabsManagerOptions) {
    return TabsManager.getInstance()._initOptions(options);
}

/**
 * 获取响应式的标签页路由管理器实例
 * 
 * 在 Composition API 中使用此函数获取 TabsManager 实例，该实例具有响应性，
 * 当标签页状态发生变化时，相关的 Vue 组件会自动更新。
 * 
 * @returns 响应式的 TabsManager 实例
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useTabsManager } from 'vue-tab-router';
 * 
 * const tabsManager = useTabsManager();
 * 
 * // 获取当前激活的标签页
 * const activeTab = tabsManager.activeTab;
 * 
 * // 获取所有打开的标签页
 * const allTabs = tabsManager.tabs;
 * 
 * // 打开新标签页
 * const openNewTab = () => {
 *   tabsManager.openTab('User', { userId: 123 });
 * };
 * 
 * // 关闭当前标签页
 * const closeCurrentTab = () => {
 *   tabsManager.closeTab();
 * };
 * </script>
 * ```
 * 
 * @since 1.0.0
 */
export function useTabsManager(): UnwrapRef<TabsManager> {
    return reactive(TabsManager.getInstance());
}

/**
 * 获取当前组件所在标签页的唯一标识符
 * 
 * 通过 Vue 的依赖注入机制获取当前组件所属标签页的 ID。
 * 这对于需要识别自身所在标签页的组件非常有用。
 * 
 * @returns 当前标签页的 ID 字符串，如果不在标签页环境中则返回 undefined
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useTabId } from 'vue-tab-router';
 * 
 * const tabId = useTabId();
 * 
 * if (tabId) {
 *   console.log('当前组件所在的标签页 ID:', tabId);
 * } else {
 *   console.log('当前组件不在标签页环境中');
 * }
 * </script>
 * ```
 * 
 * @since 1.0.0
 */
export function useTabId() {
    const tab = inject(INJECT_CURRENT_TAB_KEY);
    return tab?._id;
}

/**
 * 定义当前标签页的配置选项
 * 
 * 在组件内部使用此函数来定义或更新当前标签页的配置信息，
 * 如标签页名称、图标、是否单例、是否缓存等。
 * 
 * @param options - 标签页配置选项
 * @param options.viewName - 标签页显示名称
 * @param options.viewIcon - 标签页图标
 * @param options.viewSingle - 是否单例模式（相同组件只能打开一个实例）
 * @param options.viewNoCahce - 是否禁用缓存（切换标签页时是否重新渲染）
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { defineTabOptions } from 'vue-tab-router';
 * 
 * // 定义当前标签页选项
 * defineTabOptions({
 *   viewName: '用户管理',
 *   viewIcon: 'user',
 *   viewSingle: true,
 *   viewNoCahce: false
 * });
 * 
 * // 或者根据组件属性动态设置
 * import { ref } from 'vue';
 * const props = defineProps<{
 *   userId: number;
 * }>();
 * 
 * defineTabOptions({
 *   viewName: `用户详情 - ${props.userId}`,
 *   viewIcon: 'user-detail'
 * });
 * </script>
 * ```
 * 
 * @since 1.0.0
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
 * 定义当前标签页可监听的事件
 * 
 * 允许父标签页定义可以监听的事件处理函数，子标签页可以通过 emit 方法触发这些事件。
 * 这为父子标签页之间的通信提供了一种机制。
 * 
 * @param events - 事件映射对象，键为事件名称，值为事件处理函数
 * 
 * @example
 * ```vue
 * <!-- 父标签页组件 -->
 * <script setup lang="ts">
 * import { defineTabEvents } from 'vue-tab-router';
 * 
 * // 定义可以监听的事件
 * defineTabEvents({
 *   'data-updated': (data) => {
 *     console.log('收到子标签页数据更新:', data);
 *   },
 *   'form-submitted': (formData) => {
 *     console.log('收到子标签页表单提交:', formData);
 *     // 处理表单数据
 *   }
 * });
 * </script>
 * 
 * <!-- 子标签页组件 -->
 * <script setup lang="ts">
 * import { useTabsManager } from 'vue-tab-router';
 * 
 * const tabsManager = useTabsManager();
 * 
 * // 向父标签页发送事件
 * const sendDataToParent = () => {
 *   tabsManager.emit('data-updated', { count: 10 });
 * };
 * 
 * const submitForm = (formData) => {
 *   // 提交表单逻辑...
 *   
 *   // 通知父标签页
 *   tabsManager.emit('form-submitted', formData);
 * };
 * </script>
 * ```
 * 
 * @since 1.0.0
 */export function defineTabEvents(events: DefineEvents) {
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
 * 注册标签页离开前的守卫函数
 * 
 * 当用户尝试切换到其他标签页时执行此守卫函数，可以用来确认用户是否真的想要离开当前标签页。
 * 如果返回 Promise.reject() 或抛出错误，将阻止标签页切换。
 * 
 * @param guard - 标签页离开前的守卫函数
 * @param guard.toTab - 即将切换到的标签页对象
 * @param guard.fromTab - 当前标签页对象
 * @returns 可以返回 Promise，若拒绝则阻止标签页切换
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { onBeforeTabLeave } from 'vue-tab-router';
 * import { ref } from 'vue';
 * 
 * const hasUnsavedChanges = ref(false);
 * 
 * // 注册标签页离开前守卫
 * onBeforeTabLeave(async (toTab, fromTab) => {
 *   if (hasUnsavedChanges.value) {
 *     const result = confirm('您有未保存的更改，确定要离开吗？');
 *     if (!result) {
 *       // 阻止标签页切换
 *       return Promise.reject(new Error('用户取消离开'));
 *     }
 *   }
 *   // 允许标签页切换
 * });
 * 
 * // 模拟表单更改
 * const updateForm = () => {
 *   hasUnsavedChanges.value = true;
 * };
 * 
 * // 保存表单
 * const saveForm = () => {
 *   // 保存逻辑...
 *   hasUnsavedChanges.value = false;
 * };
 * </script>
 * ```
 * 
 * @since 1.0.0
 */
export function onBeforeTabLeave(guard: TabGuard) {
    const id = useTabId();
    if (id) {
        useTabsManager()._registerTabGuard(id, '_onBeforeTabLeave', guard);
    }
}

/**
 * 注册标签页关闭前的守卫函数
 * 
 * 当用户尝试关闭当前标签页时执行此守卫函数，可以用来确认用户是否真的想要关闭标签页。
 * 如果返回 Promise.reject() 或抛出错误，将阻止标签页关闭。
 * 
 * @param guard - 标签页关闭前的守卫函数
 * @param guard.toTab - 导致当前标签页关闭的来源标签页对象（通常是父标签页）
 * @param guard.fromTab - 当前即将关闭的标签页对象
 * @returns 可以返回 Promise，若拒绝则阻止标签页关闭
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { onBeforeTabClose } from 'vue-tab-router';
 * import { ref } from 'vue';
 * 
 * const isProcessing = ref(false);
 * 
 * // 注册标签页关闭前守卫
 * onBeforeTabClose(async (toTab, fromTab) => {
 *   if (isProcessing.value) {
 *     return Promise.reject(new Error('正在处理中，无法关闭标签页'));
 *   }
 *   
 *   if (hasUnsavedChanges.value) {
 *     const result = confirm('您有未保存的更改，确定要关闭标签页吗？');
 *     if (!result) {
 *       return Promise.reject(new Error('用户取消关闭'));
 *     }
 *   }
 * });
 * 
 * // 模拟长时间运行的任务
 * const startProcess = async () => {
 *   isProcessing.value = true;
 *   try {
 *     // 执行任务...
 *     await someLongRunningTask();
 *   } finally {
 *     isProcessing.value = false;
 *   }
 * };
 * </script>
 * ```
 * 
 * @since 1.0.0
 */
export function onBeforeTabClose(guard: TabGuard) {
    const id = useTabId();
    if (id) {
        useTabsManager()._registerTabGuard(id, '_onBeforeTabClose', guard);
    }
}