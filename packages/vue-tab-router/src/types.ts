import { AsyncComponentOptions, Component, TransitionProps } from "vue";
import { AbstractStorageAdapter } from "./abstract-storage-adapter";
import { Tab } from "./tab";

export interface ITabsManagerOptions {
    modules: Record<string, () => Promise<Component>> | Record<string, Component>;
    storageAdapter?: AbstractStorageAdapter;
    source?: Partial<AsyncComponentOptions>,
    transitionProps?: TransitionProps;
    keepAliveProps?: {
        max?: number;
    };
    noActiveComponent?: Component;
    onIframeLoad?: (e: Event, tab: Tab) => void;
}

export type TabGuard = () => Promise<void>;
export type TabGuardName = '_onBeforeTabOpen' | '_onBeforeTabEnter' | '_onBeforeTabLeave' | '_onBeforeTabClose';
export type Modules<T = any> = Record<string, () => Promise<T>> | Record<string, T>;
export type DefineEvents = { [key: string]: (data: any) => void };

export interface IDefineTabOptions {
    viewName?: string;
    viewIcon?: string;
    viewSingle?: boolean;
    viewNoCahce?: boolean;
}

export interface IUpdateTabOptions extends Record<string, any> {
    _viewName?: string;
    _viewIcon?: string;
    _viewUrl?: string;
    _viewNoCahce?: boolean;
    _viewSingle?: boolean;
}

export interface IOpenTabOptions extends Record<string, any> {
    /** 标签页标题 */
    _viewName?: string;
    /** 标签页图标 */
    _viewIcon?: string;

    /** 标签页链接 */
    // _viewUrl?: string;

    /** 标签页链接是否相对路径 - 使用[PEALTIVE_VIEW_URL_PREFIX_KEY]开头作为相对超链接 */
    // _viewUrlRelative?: boolean;

    /** 标签页是否单例 */
    _viewSingle?: boolean;

    /** 标签页是否缓存 */
    _viewNoCahce?: boolean;

    // /** 标签页打开前后事件通讯 - 使用defineTabEvents定义 */
    // _viewEvents?: DefineEvents;

    /** 标签页是否以浏览器标签方式打开 */
    _viewOutside?: boolean;

    /** 标签页以浏览器标签方式打开的参数 */
    _viewOutsideProps?: {
        target?: string;
        features?: string;
    };

    /** 标签页是否允许关闭 */
    // _noClose?: boolean;

    /** 标签页是否固定为第一个，定义为首页概念 - 调用setFirstTab方法设置 */
    // _isFirst?: boolean;
}