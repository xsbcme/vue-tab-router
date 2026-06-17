import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from "vue-router";
import { getDefaultRouteTabIcon, getDefaultRouteTabTitle } from "./route-meta-defaults";
import { resolveRouteTabMatch } from "../match";
import type { ResolvedRouteTabMeta, RouteTabMeta, VueRouterTabsOptions } from "../types";

function callMaybe<T>(value: T | ((route: RouteLocationNormalizedLoaded) => T), route: RouteLocationNormalizedLoaded) {
  return typeof value === "function" ? (value as (route: RouteLocationNormalizedLoaded) => T)(route) : value;
}

function getRouteTabMeta(route: RouteLocationNormalizedLoaded): RouteTabMeta | undefined {
  return typeof route.meta.tab === "object" ? route.meta.tab : undefined;
}

function getDefaultLocation(route: RouteLocationNormalizedLoaded): RouteLocationRaw {
  return route.name
    ? { name: route.name, params: route.params, query: route.query, hash: route.hash }
    : { path: route.path, query: route.query, hash: route.hash };
}

export function resolveRouteTabMeta(
  route: RouteLocationNormalizedLoaded,
  options: VueRouterTabsOptions = {}
): ResolvedRouteTabMeta {
  const meta = getRouteTabMeta(route);
  const title = meta?.title ? callMaybe(meta.title, route) : options.title?.(route) || getDefaultRouteTabTitle(route);
  const icon = meta?.icon ? callMaybe(meta.icon, route) : options.icon?.(route) || getDefaultRouteTabIcon();
  const viewUrl = meta?.viewUrl ? callMaybe(meta.viewUrl, route) : undefined;
  const location = meta?.location ? callMaybe(meta.location, route) : getDefaultLocation(route);
  return {
    title,
    icon,
    match: resolveRouteTabMatch(route, meta, options),
    type: meta?.type || "route",
    viewUrl,
    closable: meta?.closable === undefined ? true : callMaybe(meta.closable, route),
    keepAlive: meta?.keepAlive === undefined ? true : callMaybe(meta.keepAlive, route),
    pinned: meta?.pinned === undefined ? false : callMaybe(meta.pinned, route),
    noDrag: meta?.noDrag === undefined ? false : callMaybe(meta.noDrag, route),
    single: meta?.single === undefined ? undefined : callMaybe(meta.single, route),
    location,
  };
}
