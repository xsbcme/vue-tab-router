import type { RouteLocationNormalizedLoaded } from "vue-router";

export function getDefaultRouteTabTitle(route: RouteLocationNormalizedLoaded) {
  return route.name ? String(route.name) : route.path;
}

export function getDefaultRouteTabIcon() {
  return undefined;
}
