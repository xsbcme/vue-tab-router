import { AsyncComponentOptions, Component, TransitionProps } from "vue";
import { AbstractStorageAdapter } from "./abstract-storage-adapter";
import { Tab } from "./tab";


/**
 * 标签页管理器配置选项接口
 * @interface ITabsManagerOptions
 */
export interface ITabsManagerOptions {
    /**
     * 路由模块映射，将组件名称映射到组件定义
     * 支持同步组件或异步组件加载器
     * @type {Record<string, () => Promise<Component>> | Record<string, Component>}
     */
    modules: Record<string, () => Promise<Component>> | Record<string, Component>;

    /**
     * 存储适配器，用于持久化标签页状态
     * @type {AbstractStorageAdapter}
     * @optional
     */
    storageAdapter?: AbstractStorageAdapter;

    /**
     * 异步组件加载的默认选项
     * @type {Partial<AsyncComponentOptions>}
     * @optional
     */
    source?: Partial<AsyncComponentOptions>;

    /**
     * 标签页切换时的过渡动画属性
     * @type {TransitionProps}
     * @optional
     */
    transitionProps?: TransitionProps;

    /**
     * 用于缓存标签页的 keep-alive 组件属性
     * @type {Object}
     * @property {number} [max] - 最大缓存组件数量
     * @optional
     */
    keepAliveProps?: {
        max?: number;
    };

    /**
     * 当没有标签页激活时显示的组件
     * @type {Component}
     * @optional
     */
    noActiveComponent?: Component;

    /**
     * 当请求的标签页不存在时显示的组件
     * @type {Component}
     * @optional
     */
    noExistComponent?: Component;

    /**
     * iframe 标签页加载完成时的回调函数
     * @type {Function}
     * @param {Event} e - 加载事件
     * @param {Partial<Tab>} tab - 标签页对象
     * @returns {void}
     * @optional
     */
    onIframeLoad?: (e: Event, tab: Partial<Tab>) => void;

    /**
     * 标签页打开前的守卫函数
     * @type {TabGuard}
     * @async
     * @optional
     */
    onBeforeTabOpen?: TabGuard;

    /**
     * 标签页进入前的守卫函数
     * @type {TabGuard}
     * @async
     * @optional
     */
    onBeforeTabEnter?: TabGuard;

    /**
     * 标签页名称的最大长度限制
     * @type {number}
     * @optional
     */
    viewNameMaxLength?: number;
}

// export type TabGuardName = '_onBeforeTabOpen' | '_onBeforeTabEnter' | '_onBeforeTabLeave' | '_onBeforeTabClose';

/**
 * 标签页守卫函数类型定义
 * @callback TabGuard
 * @param {Partial<Tab>} toTab - 目标标签页
     * @param {Partial<Tab>} [oldTab] - 当前标签页
     * @returns {Promise<void>} 完成后解析的 Promise
 */
export type TabGuard = (toTab: Partial<Tab>, oldTab?: Partial<Tab>) => Promise<void>;

/**
 * 可用的标签页守卫钩子名称
 * @typedef {('_onBeforeTabLeave' | '_onBeforeTabClose')} TabGuardName
 */
export type TabGuardName = '_onBeforeTabLeave' | '_onBeforeTabClose';

/**
 * 路由映射的通用模块类型
 * @template T - 模块类型参数
 * @type {Record<string, () => Promise<T>> | Record<string, T>}
 */
export type Modules<T = any> = Record<string, () => Promise<T>> | Record<string, T>;

/**
 * 标签页事件处理器类型定义
 * @typedef {Object.<string, Function>} DefineEvents
 * @property {Function} [eventName] - 事件处理函数
 */
export type DefineEvents = { [key: string]: (data: any) => void };


/**
 * 定义标签页属性的选项接口
 * @interface IDefineTabOptions
 */
export interface IDefineTabOptions {
    /**
     * 标签页显示名称
     * @type {string}
     * @optional
     */
    viewName?: string;

    /**
     * 标签页图标标识符
     * @type {string}
     * @optional
     */
    viewIcon?: string;

    /**
     * 标签页是否为单实例模式
     * @type {boolean}
     * @optional
     */
    viewSingle?: boolean;

    /**
     * 标签页是否禁用缓存
     * @type {boolean}
     * @optional
     */
    viewNoCahce?: boolean;
}

/**
 * 更新标签页属性的选项接口
 * @interface IUpdateTabOptions
 * @extends {Record<string, any>}
 */
export interface IUpdateTabOptions extends Record<string, any> {
    /**
     * 更新标签页的显示名称
     * @type {string}
     * @optional
     */
    _viewName?: string;

    /**
     * 更新标签页的图标
     * @type {string}
     * @optional
     */
    _viewIcon?: string;

    /**
     * 更新标签页的URL
     * @type {string}
     * @optional
     */
    _viewUrl?: string;

    /**
     * 更新标签页的缓存设置
     * @type {boolean}
     * @optional
     */
    _viewNoCahce?: boolean;

    /**
     * 更新标签页的单实例设置
     * @type {boolean}
     * @optional
     */
    _viewSingle?: boolean;
}


/**
 * 打开新标签页的选项接口
 * @interface IOpenTabOptions
 * @extends {Record<string, any>}
 */
export interface IOpenTabOptions extends Record<string, any> {

    /** 标签页链接 */
    // _viewUrl?: string;

    /** 标签页链接是否相对路径 - 使用[PEALTIVE_VIEW_URL_PREFIX_KEY]开头作为相对超链接 */
    // _viewUrlRelative?: boolean;

    // /** 标签页打开前后事件通讯 - 使用defineTabEvents定义 */
    // _viewEvents?: DefineEvents;

    /** 标签页是否允许关闭 */
    // _noClose?: boolean;

    /** 标签页是否固定为第一个，定义为首页概念 - 调用setFirstTab方法设置 */
    // _isFirst?: boolean;

    /**
     * 标签页标题/显示名称
     * @type {string}
     * @optional
     */
    _viewName?: string;

    /**
     * 标签页图标标识符
     * @type {string}
     * @optional
     */
    _viewIcon?: string;

    /**
     * 标签页是否为单实例模式
     * @type {boolean}
     * @optional
     */
    _viewSingle?: boolean;

    /**
     * 标签页是否禁用缓存
     * @type {boolean}
     * @optional
     */
    _viewNoCahce?: boolean;

    /**
     * 标签页是否在新浏览器窗口/标签页中打开
     * @type {boolean}
     * @optional
     */
    _viewOutside?: boolean;

    /**
     * 外部标签页打开的浏览器窗口属性
     * @type {Object}
     * @property {string} [target] - 目标窗口名称
     * @property {string} [features] - 窗口特性字符串
     * @optional
     */
    _viewOutsideProps?: {
        target?: string;
        features?: string;
    };
}