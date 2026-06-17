import type { RouteLocationRaw } from "vue-router";

export interface PersistedRouteTab {
  routeKey: string;
  location: RouteLocationRaw;
}

export function createPersistedRouteTab(routeKey: string, location: RouteLocationRaw): PersistedRouteTab {
  return { routeKey, location };
}
