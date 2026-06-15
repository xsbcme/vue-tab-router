import { AsyncComponentLoader, AsyncComponentOptions, Component, TransitionProps } from "vue";
import { AbstractStorageAdapter } from "./abstract-storage-adapter";
import type { IframeLoadEvent, IframeMessageEvent, IframeMessageOriginValidator } from "./iframe-message";
import { Tab } from "./tab";
import type { TabsManagerPlugin } from "./tabs-manager-plugin";

/**
 * TabsManager 内部归一化配置。
 */
export interface ITabsManagerOptions {
  /**
   * 页面模块映射，key 为组件注册名，value 为组件或懒加载函数。
   */
  modules: Record<string, () => Promise<Component>> | Record<string, Component>;

  /**
   * 页面元数据树，用于补充 viewUrl 的默认标题、图标、打开参数和层级。
   */
  viewMeta?: TabViewMeta[];

  /**
   * 自定义存储适配器，用于持久化 tabs 状态。
   */
  storageAdapter?: AbstractStorageAdapter;

  /**
   * 持久化 key。主实例默认使用 `tabs`，临时实例可使用独立 key 或关闭持久化。
   */
  storageKey?: string;

  /**
   * 是否启用持久化。主实例默认启用，临时实例默认关闭。
   */
  storageEnabled?: boolean;

  /**
   * 扩展插件。插件会在 `app.use(tabsManager)` 时安装。
   */
  plugins?: TabsManagerPlugin[];

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
   * 默认加载组件。异步页面与 iframe 未单独配置时会使用它。
   */
  loadingComponent?: Component;

  /**
   * 默认失败组件。异步页面加载失败且 views.source.errorComponent 未配置时会使用它。
   */
  errorComponent?: Component;

  /**
   * iframe 加载中展示的组件。未配置时使用 loadingComponent 或内置默认加载组件。
   */
  iframeLoadingComponent?: Component;

  /**
   * iframe 加载完成回调。可通过 `iframe` 访问 DOM；跨域 iframe 只能操作元素本身，不能访问内部 document。
   */
  onIframeLoad?: (context: IframeLoadEvent) => void;

  /**
   * 允许接收 iframe 消息的来源。默认只允许当前页面同源。
   */
  iframeMessageOrigins?: IframeMessageOriginValidator;

  /**
   * iframe 通过 postMessage 发送消息时触发。
   */
  onIframeMessage?: (message: IframeMessageEvent) => void;

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
   * 内置标签栏标题最大显示长度。
   */
  tabsTitleMaxLength?: number;

  /**
   * 是否启用内置标签栏拖拽排序。默认启用。
   */
  tabsDraggable?: boolean;

  /**
   * 是否在内置标签栏显示图标。默认显示。
   */
  tabsShowIcon?: boolean;

  /**
   * 内置标签栏虚拟滚动配置。默认启用。
   */
  tabsVirtual?: TabsVirtualOptions;

  /**
   * 弹窗显示层级。
   */
  detachedZIndex?: number;

  /**
   * 弹窗打开后是否默认全屏显示。默认启用。
   */
  detachedFullscreen?: boolean;
}

/** 页面模块与异步组件配置。 */
export interface TabsManagerViewsOptions {
  /** 页面模块映射，key 为组件注册名，value 为组件或懒加载函数。 */
  modules: ITabsManagerOptions["modules"];
  /** 页面元数据树，用于补充 viewUrl 的默认标题、图标、打开参数和层级。 */
  meta?: TabViewMeta[];
  /** 异步组件默认配置，会合并到 `defineAsyncComponent`。 */
  source?: ITabsManagerOptions["source"];
}

/** 页面元数据。它不是菜单，也不是路由，只用于补充 modules 扫描到的 viewUrl。 */
export interface TabViewMeta {
  /** 页面唯一标识。 */
  id?: string | number;
  /** 页面标题，会作为 tab 默认标题。 */
  title?: string;
  /** 页面图标，会作为 tab 默认图标。 */
  icon?: string;
  /** 页面地址，对应 modules 的 key 或 iframe/link viewUrl。 */
  viewUrl?: string;
  /** 默认 openTab 参数，可直接使用 `_viewName`、`_viewNoCache` 等现有参数。 */
  props?: IOpenTabOptions;
  /** 业务扩展元数据，不参与 openTab 参数合并。 */
  meta?: Record<string, unknown>;
  /** 子页面元数据，用于描述页面层级。 */
  children?: TabViewMeta[];
}

/** 持久化配置。 */
export interface TabsManagerStorageOptions {
  /** 自定义存储适配器，用于持久化 tabs 状态。 */
  adapter?: AbstractStorageAdapter;
  /** 持久化 key。默认 `tabs`。 */
  key?: string;
  /** 是否启用持久化。默认启用。 */
  enabled?: boolean;
}

/** 容器渲染、缓存与内置标签栏显示配置。 */
export interface TabsManagerRenderOptions {
  /** 标签页切换的过渡配置。 */
  transition?: TransitionProps;
  /** keep-alive 配置。 */
  keepAlive?: ITabsManagerOptions["keepAliveProps"];
  /** 无激活标签页时展示的占位组件。 */
  noActiveComponent?: Component;
  /** 目标组件不存在时展示的占位组件。 */
  noExistComponent?: Component;

  /** 默认加载组件。异步页面与 iframe 未单独配置时会使用它。 */
  loadingComponent?: Component;
  /** 默认失败组件。异步页面加载失败且 views.source.errorComponent 未配置时会使用它。 */
  errorComponent?: Component;

  /** 内置标签栏显示配置。 */
  tabs?: TabsManagerRenderTabsOptions;
}

/** 内置标签栏显示配置。 */
export interface TabsManagerRenderTabsOptions {
  /** 标签标题最大显示长度。 */
  titleMaxLength?: number;
  /** 是否启用拖拽排序。默认 `true`。 */
  draggable?: boolean;
  /** 是否显示图标。默认 `true`。 */
  showIcon?: boolean;
  /** 虚拟滚动配置。默认启用。 */
  virtual?: TabsVirtualOptions;
}

/** 内置标签栏虚拟滚动配置。 */
export type TabsVirtualOptions =
  | boolean
  | {
      /** 是否启用虚拟滚动。默认 `true`。 */
      enabled?: boolean;
      /** 标签数量达到该阈值时启用虚拟滚动。默认 `30`。 */
      threshold?: number;
      /** 可视区域两侧额外渲染的估算标签数量。默认 `6`。 */
      overscan?: number;
      /** 未完成真实测量时的标签估算宽度。默认 `148`。 */
      estimatedWidth?: number;
      /** 标签估算最小宽度。默认 `72`。 */
      minWidth?: number;
      /** 标签估算最大宽度。默认 `260`。 */
      maxWidth?: number;
    };

/** 弹窗显示配置。 */
export interface TabsManagerDetachedOptions {
  /** 弹窗显示层级。默认 `1000`。 */
  zIndex?: number;
  /** 弹窗打开后是否默认全屏显示。默认 `true`。 */
  fullscreen?: boolean;
}

/** iframe 页面配置。 */
export interface TabsManagerIframeOptions {
  /** iframe 加载中展示的组件。未配置时使用 render.loadingComponent 或内置默认加载组件。 */
  loadingComponent?: Component;
  /** iframe 加载完成回调。可通过 `iframe` 访问 DOM；跨域 iframe 只能操作元素本身，不能访问内部 document。 */
  onLoad?: (context: IframeLoadEvent) => void;
  /** 允许接收 iframe 消息的来源。默认只允许当前页面同源。 */
  messageOrigins?: IframeMessageOriginValidator;
  /** iframe 通过 postMessage 发送消息时触发。 */
  onMessage?: (message: IframeMessageEvent) => void;
}

/** 全局 tab 守卫配置。 */
export interface TabsManagerGuardsOptions {
  /** 全局：打开标签页前守卫。 */
  beforeOpen?: TabOpenGuard;
  /** 全局：激活标签页前守卫。 */
  beforeEnter?: TabEnterGuard;
  /** 全局：离开当前标签页前守卫。 */
  beforeLeave?: TabLeaveGuard;
  /** 全局：关闭标签页前守卫。 */
  beforeClose?: TabCloseGuard;
}

/**
 * TabsManager 初始化配置。
 */
export interface TabsManagerOptions {
  /** 页面模块与异步组件配置。 */
  views: TabsManagerViewsOptions;
  /** 持久化配置。 */
  storage?: TabsManagerStorageOptions;
  /** 扩展插件。插件会在 `app.use(tabsManager)` 时安装。 */
  plugins?: TabsManagerPlugin[];
  /** 容器渲染、缓存与内置标签栏显示配置。 */
  render?: TabsManagerRenderOptions;
  /** iframe 页面配置。 */
  iframe?: TabsManagerIframeOptions;
  /** 全局 tab 守卫配置。 */
  guards?: TabsManagerGuardsOptions;
  /** 弹窗显示配置。 */
  detached?: TabsManagerDetachedOptions;
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

/** 新窗口打开链接时的 `window.open` 配置。 */
export interface ViewOutsideOptions {
  /** `window.open` 的 target 参数。 */
  target?: string;
  /** `window.open` 的 features 参数。 */
  features?: string;
}

/**
 * 通用模块映射类型。
 */
export type ModuleItem = AsyncComponentLoader<Component> | Component | { default: Component };

/**
 * 通用模块映射类型。
 */
export type Modules = Record<string, ModuleItem>;

/**
 * 页面事件处理器映射。
 */
export type DefineEvents = { [key: string]: (data: unknown) => void };

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

  /**
   * 是否置顶。
   */
  viewPinned?: boolean;

  /**
   * 是否禁止拖拽排序。
   */
  viewNoDrag?: boolean;
}

/**
 * 更新 tab 时使用的参数。
 */
export interface IUpdateTabOptions extends Record<string, unknown> {
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

  /**
   * 更新置顶设置。
   */
  _viewPinned?: boolean;

  /**
   * 更新是否禁止拖拽排序。
   */
  _viewNoDrag?: boolean;

}

/**
 * 打开 tab 时使用的参数。
 */
export interface IOpenTabOptions extends Record<string, unknown> {
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
   * 是否置顶。置顶标签排序时位于首页之后、普通标签之前。
   */
  _viewPinned?: boolean;

  /**
   * 是否禁止拖拽排序。首页标签默认禁止拖拽。
   */
  _viewNoDrag?: boolean;

  /**
   * 是否在新窗口打开，或指定 `window.open` 配置（仅对链接型 viewUrl 生效）。
   */
  _viewOutside?: boolean | ViewOutsideOptions;
}
