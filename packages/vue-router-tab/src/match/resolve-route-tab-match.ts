import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { RouteTabMatchRule, RouteTabMeta, VueRouterTabsOptions } from "../types";

export function resolveRouteTabMatch(
  route: RouteLocationNormalizedLoaded,
  meta: RouteTabMeta | undefined,
  options: VueRouterTabsOptions = {}
): RouteTabMatchRule {
  return meta?.match || options.match || "record";
}

export function shouldSyncRouteTab(route: RouteLocationNormalizedLoaded, options: VueRouterTabsOptions = {}) {
  if (route.meta.tab === false) return false;
  return options.include ? options.include(route) : true;
}
