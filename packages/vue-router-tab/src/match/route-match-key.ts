import type { RouteLocationNormalizedLoaded } from "vue-router";
import { stableStringify } from "../shared";
import type { RouteTabMatchRule } from "../types";

function getRouteRecordKey(route: RouteLocationNormalizedLoaded) {
  const record = route.matched[route.matched.length - 1];
  return String(record?.name || record?.path || route.name || route.path);
}

export function resolveRouteMatchValue(route: RouteLocationNormalizedLoaded, match: RouteTabMatchRule) {
  if (typeof match === "function") return match(route);
  if (match === "fullPath") return route.fullPath;
  if (match === "path") return route.path;
  return getRouteRecordKey(route);
}

export function createRouteMatchKey(route: RouteLocationNormalizedLoaded, match: RouteTabMatchRule) {
  const value = resolveRouteMatchValue(route, match);
  return typeof value === "string" ? value : stableStringify(value);
}
