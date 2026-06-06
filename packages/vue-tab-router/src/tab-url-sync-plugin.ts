import type { Ref } from "vue";
import type { Tab } from "./tab";
import type { TabsManagerPlugin } from "./tabs-manager-plugin";
import type { IOpenTabOptions } from "./types";
import { clone, stableStringify, TabViewUrl } from "./utils";

type RouteQueryValue = string | number | boolean | null | undefined;
type RouteQuery = Record<string, RouteQueryValue | RouteQueryValue[]>;

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
  /** 写入 URL 前自定义序列化。 */
  serialize?: (state: TabUrlState) => string;
  /** 从 URL 读取后自定义反序列化。 */
  deserialize?: (value: string) => TabUrlState | undefined;
  /** 从 URL 打开 tab 前的校验。 */
  validate?: (state: TabUrlState, route: TabUrlSyncRoute) => boolean;
  /** 路由同步失败回调。 */
  onError?: (error: unknown) => void;
}

const DEFAULT_QUERY_KEY = "tab";

function getCurrentRoute(router: TabUrlSyncRouter) {
  const currentRoute = router.currentRoute;
  return "value" in currentRoute ? currentRoute.value : currentRoute;
}

function getQueryValue(query: RouteQuery | undefined, key: string) {
  const value = query?.[key];
  if (Array.isArray(value)) {
    const firstValue = value[0];
    return firstValue === undefined || firstValue === null ? undefined : String(firstValue);
  }
  if (value === undefined || value === null) return undefined;
  return String(value);
}

function encodeBase64Url(value: string) {
  return btoa(encodeURIComponent(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return decodeURIComponent(atob(padded));
}

function defaultSerialize(state: TabUrlState) {
  return encodeBase64Url(JSON.stringify(state));
}

function defaultDeserialize(value: string): TabUrlState | undefined {
  try {
    const state = JSON.parse(decodeBase64Url(value)) as Partial<TabUrlState>;
    if (!state || typeof state.viewUrl !== "string") return undefined;
    const viewProps = state.viewProps && typeof state.viewProps === "object" ? state.viewProps : undefined;
    return {
      viewUrl: state.viewUrl,
      viewName: typeof state.viewName === "string" ? state.viewName : undefined,
      viewIcon: typeof state.viewIcon === "string" ? state.viewIcon : undefined,
      viewNoCache: typeof state.viewNoCache === "boolean" ? state.viewNoCache : undefined,
      viewSingle: typeof state.viewSingle === "boolean" ? state.viewSingle : undefined,
      viewProps: viewProps as Record<string, unknown> | undefined,
    };
  } catch (error) {
    return undefined;
  }
}

function shouldSyncRoute(route: TabUrlSyncRoute, routePath: CreateTabUrlSyncPluginOptions["routePath"]) {
  if (!routePath) return true;
  if (typeof routePath === "function") return routePath(route);
  return route.path === routePath;
}

function hasRecordValue(record: Record<string, unknown> | undefined) {
  return Boolean(record && Object.keys(record).length);
}

function normalizeState(tab: Partial<Tab> | undefined): TabUrlState | undefined {
  if (!tab?.viewUrl) return undefined;
  const viewProps = clone(tab.viewProps || {});
  return {
    viewUrl: tab.viewUrl,
    ...(tab.viewName ? { viewName: tab.viewName } : {}),
    ...(tab.viewIcon ? { viewIcon: tab.viewIcon } : {}),
    ...(tab._noCache !== undefined ? { viewNoCache: tab._noCache } : {}),
    ...(tab._single !== undefined ? { viewSingle: tab._single } : {}),
    ...(hasRecordValue(viewProps) ? { viewProps } : {}),
  };
}

function isSameState(left: TabUrlState | undefined, right: TabUrlState | undefined) {
  if (!left || !right) return left === right;
  return stableStringify(left) === stableStringify(right);
}

function createOpenOptions(state: TabUrlState): IOpenTabOptions {
  return {
    ...(state.viewProps || {}),
    _viewName: state.viewName,
    _viewIcon: state.viewIcon,
    _viewNoCache: state.viewNoCache,
    _viewSingle: state.viewSingle,
  };
}

function isAllowedState(state: TabUrlState, route: TabUrlSyncRoute, options: CreateTabUrlSyncPluginOptions) {
  if (TabViewUrl.isHttp(state.viewUrl) && options.allowExternal !== true) return false;
  if (TabViewUrl.isRelative(state.viewUrl) && options.allowRelative === false) return false;
  return options.validate ? options.validate(state, route) : true;
}

function clearQueryValue(query: RouteQuery, key: string) {
  const nextQuery = { ...query };
  delete nextQuery[key];
  return nextQuery;
}

export function createTabUrlSyncPlugin(
  router: TabUrlSyncRouter,
  options: CreateTabUrlSyncPluginOptions = {}
): TabsManagerPlugin {
  const queryKey = options.queryKey || DEFAULT_QUERY_KEY;
  const serialize = options.serialize || defaultSerialize;
  const deserialize = options.deserialize || defaultDeserialize;
  const syncInitialActiveTab = options.syncInitialActiveTab !== false;
  const syncDocumentTitle = options.syncDocumentTitle !== false;

  return ({ tabsManager, hooks }) => {
    let applyingRoute = false;
    let applyingTab = false;
    const initialDocumentTitle = typeof document === "undefined" ? "" : document.title;

    const reportError = (error: unknown) => {
      if (options.onError) {
        options.onError(error);
        return;
      }
      console.error(error);
    };

    const readStateFromRoute = (route: TabUrlSyncRoute) => {
      const rawValue = getQueryValue(route.query, queryKey);
      return rawValue ? deserialize(rawValue) : undefined;
    };

    const updateDocumentTitle = (tab: Partial<Tab> | undefined = tabsManager.activeTab) => {
      if (!syncDocumentTitle || typeof document === "undefined") return;
      const route = getCurrentRoute(router);
      if (!shouldSyncRoute(route, options.routePath)) return;

      const formattedTitle = options.formatDocumentTitle?.(tab, route);
      document.title = formattedTitle || tab?.viewName || tab?.viewUrl || initialDocumentTitle;
    };

    const writeStateToRoute = async (
      state: TabUrlState | undefined,
      mode: "push" | "replace" = options.historyMode || "push"
    ) => {
      const route = getCurrentRoute(router);
      if (!shouldSyncRoute(route, options.routePath)) return;

      const nextState = state && isAllowedState(state, route, options) ? state : undefined;
      const currentState = readStateFromRoute(route);
      const hasRawQueryState = Boolean(getQueryValue(route.query, queryKey));
      if (isSameState(currentState, nextState) && (nextState || !hasRawQueryState)) return;

      const query = nextState
        ? { ...(route.query || {}), [queryKey]: serialize(nextState) }
        : clearQueryValue(route.query || {}, queryKey);
      const method = mode === "push" && !getQueryValue(route.query, queryKey) ? "replace" : mode;

      applyingTab = true;
      try {
        await router[method]({ query });
      } catch (error) {
        reportError(error);
      } finally {
        applyingTab = false;
      }
    };

    const applyRouteState = async (route: TabUrlSyncRoute, replaceAfterOpen = false) => {
      if (applyingTab || !shouldSyncRoute(route, options.routePath)) return;

      const state = readStateFromRoute(route);
      const hasQueryState = Boolean(getQueryValue(route.query, queryKey));
      if (!state || !isAllowedState(state, route, options)) {
        if (hasQueryState) {
          await writeStateToRoute(undefined, "replace");
        }
        return;
      }

      const activeState = normalizeState(tabsManager.activeTab);
      if (isSameState(activeState, state)) return;

      applyingRoute = true;
      try {
        await tabsManager.openTab(state.viewUrl, createOpenOptions(state));
        if (replaceAfterOpen) {
          await writeStateToRoute(state, "replace");
        }
        updateDocumentTitle(tabsManager.activeTab);
      } catch (error) {
        reportError(error);
      } finally {
        applyingRoute = false;
      }
    };

    const syncInitialActiveTabToRoute = async () => {
      if (!syncInitialActiveTab) return;
      const route = getCurrentRoute(router);
      if (!shouldSyncRoute(route, options.routePath) || getQueryValue(route.query, queryKey)) return;
      await writeStateToRoute(normalizeState(tabsManager.activeTab), "replace");
    };

    const applyInitialRouteState = applyRouteState(getCurrentRoute(router), true);
    updateDocumentTitle();
    Promise.resolve(applyInitialRouteState).then(syncInitialActiveTabToRoute);

    const removeRouteListener = router.afterEach?.(to => {
      applyRouteState(to).then(syncInitialActiveTabToRoute);
    });

    const removeOpened = hooks.on("tab:opened", tab => {
      updateDocumentTitle(tab);
      if (applyingRoute) return;
      return writeStateToRoute(normalizeState(tab));
    });
    const removeActiveChanged = hooks.on("tab:active-changed", tab => {
      updateDocumentTitle(tab);
      if (applyingRoute) return;
      return writeStateToRoute(normalizeState(tab));
    });
    const removeUpdated = hooks.on("tab:updated", tab => {
      updateDocumentTitle(tab);
      if (applyingRoute) return;
      return writeStateToRoute(normalizeState(tab), "replace");
    });
    const removeClosed = hooks.on("tab:closed", (_closedTab, fallbackTab) => {
      updateDocumentTitle(fallbackTab);
      if (applyingRoute) return;
      return writeStateToRoute(normalizeState(fallbackTab), "replace");
    });
    const removeCleared = hooks.on("tabs:cleared", () => {
      updateDocumentTitle(undefined);
      if (applyingRoute) return;
      return writeStateToRoute(undefined, "replace");
    });

    return () => {
      removeRouteListener?.();
      removeOpened();
      removeActiveChanged();
      removeUpdated();
      removeClosed();
      removeCleared();
    };
  };
}
