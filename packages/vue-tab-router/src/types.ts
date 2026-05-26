import { AsyncComponentOptions, Component, TransitionProps } from "vue";
import { AbstractStorageAdapter } from "./abstract-storage-adapter";
import { Tab } from "./tab";

/**
 * TabsManager 初始化配置。
 */
export interface ITabsManagerOptions {
  /**
   * 页面模块映射，key 为组件注册名，value 为组件或懒加载函数。
   */
  modules: Record<string, () => Promise<Component>> | Record<string, Component>;

  /**
   * 自定义存储适配器，用于持久化 tabs 状态。
   */
  storageAdapter?: AbstractStorageAdapter;

  /**
   * 异步组件默认配置，会合并到 `defineAsyncComponent`。
   */
  source?: Partial<AsyncComponentOptions>;

  /**
   * 标签页切换的过渡配置。
   */
  transitionProps?: TransitionProps;

  /**
   * keep-alive 配置。
   */
  keepAliveProps?: {
    /** 最大缓存数量。 */
    max?: number;
  };

  /**
   * 无激活标签页时展示的占位组件。
   */
  noActiveComponent?: Component;

  /**
   * 目标组件不存在时展示的占位组件。
   */
  noExistComponent?: Component;

  /**
   * iframe 加载完成回调。
   */
  onIframeLoad?: (e: Event, tab: Partial<Tab>) => void;

  /**
   * 全局：打开标签页前守卫。
   */
  onBeforeTabOpen?: TabOpenGuard;

  /**
   * 全局：激活标签页前守卫。
   */
  onBeforeTabEnter?: TabEnterGuard;

  /**
   * 全局：离开当前标签页前守卫。
   */
  onBeforeTabLeave?: TabLeaveGuard;

  /**
   * 全局：关闭标签页前守卫。
   * rejected Promise 或抛错会阻止关闭。
   */
  onBeforeTabClose?: TabCloseGuard;

  /**
   * 标签名称最大显示长度（主要用于内置 Tabs 组件）。
   */
  viewNameMaxLength?: number;
}

/**
 * 标签页守卫函数。
 * 返回 false、rejected Promise 或抛错会中断当前流程。
 */
export type MaybeGuardReturn = void | boolean | Promise<void | boolean>;

export type TabOpenGuard = (openingTab: Partial<Tab>, sourceTab?: Partial<Tab>) => MaybeGuardReturn;

export type TabEnterGuard = (toTab: Partial<Tab>, fromTab?: Partial<Tab>) => MaybeGuardReturn;

export type TabLeaveGuard = (toTab: Partial<Tab>, fromTab?: Partial<Tab>) => MaybeGuardReturn;

export type TabCloseGuard = (closingTab: Partial<Tab>, sourceTab?: Partial<Tab>) => MaybeGuardReturn;

export type TabGuard = TabOpenGuard | TabEnterGuard | TabLeaveGuard | TabCloseGuard;

/**
 * 页面级守卫字段名（挂载在 Tab 实例上）。
 */
export type TabGuardName = "_onBeforeTabEnter" | "_onBeforeTabLeave" | "_onBeforeTabClose";

export type PersistedTab = Omit<Tab, TabGuardName | "_isRefresh" | "_loading" | "toJSON">;

export interface CloseTabOptions {
  ignoreNoClose?: boolean;
  skipGuard?: boolean;
}

export interface CloseTabsOptions extends CloseTabOptions {
  continueOnRejected?: boolean;
}

/**
 * 通用模块映射类型。
 */
export type Modules<T = any> = Record<string, () => Promise<T>> | Record<string, T>;

/**
 * 页面事件处理器映射。
 */
export type DefineEvents = { [key: string]: (data: any) => void };

/**
 * 在页面内部声明 tab 元信息时使用的参数。
 */
export interface IDefineTabOptions {
  /**
   * 标签页标题。
   */
  viewName?: string;

  /**
   * 标签页图标。
   */
  viewIcon?: string;

  /**
   * 是否单例。
   */
  viewSingle?: boolean;

  /**
   * 是否禁用缓存。
   */
  viewNoCache?: boolean;
}

/**
 * 更新 tab 时使用的参数。
 */
export interface IUpdateTabOptions extends Record<string, any> {
  /**
   * 更新标题。
   */
  _viewName?: string;

  /**
   * 更新图标。
   */
  _viewIcon?: string;

  /**
   * 更新视图地址。
   */
  _viewUrl?: string;

  /**
   * 更新缓存设置。
   */
  _viewNoCache?: boolean;

  /**
   * 更新单例设置。
   */
  _viewSingle?: boolean;
}

/**
 * 打开 tab 时使用的参数。
 */
export interface IOpenTabOptions extends Record<string, any> {
  /**
   * 标签标题。
   */
  _viewName?: string;

  /**
   * 标签图标。
   */
  _viewIcon?: string;

  /**
   * 是否单例。
   */
  _viewSingle?: boolean;

  /**
   * 是否禁用缓存。
   */
  _viewNoCache?: boolean;

  /**
   * 是否在新窗口打开（仅对链接型 viewUrl 生效）。
   */
  _viewOutside?: boolean;

  /**
   * 新窗口打开时的 `window.open` 配置。
   */
  _viewOutsideProps?: {
    /** `window.open` 的 target 参数。 */
    target?: string;
    /** `window.open` 的 features 参数。 */
    features?: string;
  };
}
