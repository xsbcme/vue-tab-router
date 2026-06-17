import type { Tab } from "../../tabs";
import type { IOpenTabOptions } from "../../types";
import { clone, stableStringify, TabViewUrl } from "../../shared";
import type { CreateTabUrlSyncPluginOptions, RouteQuery, TabUrlState, TabUrlSyncRoute, TabUrlSyncRouter } from "./types";

const DEFAULT_QUERY_KEY = "tab";

export function getCurrentRoute(router: TabUrlSyncRouter) {
  const currentRoute = router.currentRoute;
  return "value" in currentRoute ? currentRoute.value : currentRoute;
}

export function getQueryValue(query: RouteQuery | undefined, key: string) {
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

export function defaultSerialize(state: TabUrlState) {
  return encodeBase64Url(JSON.stringify(state));
}

export function defaultDeserialize(value: string): TabUrlState | undefined {
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

export function shouldSyncRoute(route: TabUrlSyncRoute, routePath: CreateTabUrlSyncPluginOptions["routePath"]) {
  if (!routePath) return true;
  if (typeof routePath === "function") return routePath(route);
  return route.path === routePath;
}

export function hasRecordValue(record: Record<string, unknown> | undefined) {
  return Boolean(record && Object.keys(record).length);
}

export function normalizeState(tab: Partial<Tab> | undefined): TabUrlState | undefined {
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

export function isSameState(left: TabUrlState | undefined, right: TabUrlState | undefined) {
  if (!left || !right) return left === right;
  return stableStringify(left) === stableStringify(right);
}

export function createOpenOptions(state: TabUrlState): IOpenTabOptions {
  return {
    ...(state.viewProps || {}),
    _viewName: state.viewName,
    _viewIcon: state.viewIcon,
    _viewNoCache: state.viewNoCache,
    _viewSingle: state.viewSingle,
  };
}

export function isAllowedState(state: TabUrlState, route: TabUrlSyncRoute, options: CreateTabUrlSyncPluginOptions) {
  if (TabViewUrl.isHttp(state.viewUrl) && options.allowExternal !== true) return false;
  if (TabViewUrl.isRelative(state.viewUrl) && options.allowRelative === false) return false;
  return options.validate ? options.validate(state, route) : true;
}

export function clearQueryValue(query: RouteQuery, key: string) {
  const nextQuery = { ...query };
  delete nextQuery[key];
  return nextQuery;
}

export { DEFAULT_QUERY_KEY };
