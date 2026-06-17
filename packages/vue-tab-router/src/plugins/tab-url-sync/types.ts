import type { Ref } from "vue";
import type { Tab } from "../../tabs";

export type RouteQueryValue = string | number | boolean | null | undefined;
export type RouteQuery = Record<string, RouteQueryValue | RouteQueryValue[]>;

export interface TabUrlSyncRoute {
  path?: string;
  fullPath?: string;
  query?: RouteQuery;
}

export interface TabUrlSyncRouter {
  currentRoute: Ref<TabUrlSyncRoute> | TabUrlSyncRoute;
  push(to: unknown): Promise<unknown> | unknown;
  replace(to: unknown): Promise<unknown> | unknown;
  afterEach?(handler: (to: TabUrlSyncRoute, from: TabUrlSyncRoute) => void): () => void;
}

export interface TabUrlState {
  viewUrl: string;
  viewName?: string;
  viewIcon?: string;
  viewNoCache?: boolean;
  viewSingle?: boolean;
  viewProps?: Record<string, unknown>;
}

export interface CreateTabUrlSyncPluginOptions {
  /** 存储当前激活 tab 状态的 query 参数名。 */
  queryKey?: string;
  /** 初始化时如果 URL 没有 tab 状态，是否把当前激活 tab 写入 URL。默认开启。 */
  syncInitialActiveTab?: boolean;
  /** tab 激活、更新、关闭时是否同步浏览器标题。默认开启。 */
  syncDocumentTitle?: boolean;
  /** 自定义浏览器标题。返回空值时会回退到默认标题。 */
  formatDocumentTitle?: (tab: Partial<Tab> | undefined, route: TabUrlSyncRoute) => string | undefined;
  /** 限制只在指定路由 path 上同步。默认不限制。 */
  routePath?: string | ((route: TabUrlSyncRoute) => boolean);
  /** tab 切换时写入历史记录的方式。 */
  historyMode?: "push" | "replace";
  /** 是否允许从 URL 打开 http/https iframe 页面。 */
  allowExternal?: boolean;
  /** 是否允许从 URL 打开 TabViewUrl.createRelative 创建的 iframe 页面。 */
  allowRelative?: boolean;
  /** 是否同步同源 iframe 内部链接导航。默认开启。 */
  syncIframeNavigation?: boolean;
  /** 写入 URL 前自定义序列化。 */
  serialize?: (state: TabUrlState) => string;
  /** 从 URL 读取后自定义反序列化。 */
  deserialize?: (value: string) => TabUrlState | undefined;
  /** 从 URL 打开 tab 前的校验。 */
  validate?: (state: TabUrlState, route: TabUrlSyncRoute) => boolean;
  /** 路由同步失败回调。 */
  onError?: (error: unknown) => void;
}
