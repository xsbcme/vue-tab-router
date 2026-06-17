import type { RouteLocationNormalizedLoaded } from "vue-router";
import { createRouteMatchKey } from "./match";
import { resolveRouteTabMeta } from "./meta";
import type { RouteTabDescriptor, VueRouterTabsOptions } from "./types";

const ROUTER_VIEW_URL_PREFIX = "__vue_router_tab__:";

export const ROUTER_VIEW_COMPONENT_NAME = "VueRouterTabRouteView";

export function createRouteViewUrl(routeKey: string) {
  return `${ROUTER_VIEW_URL_PREFIX}${encodeURIComponent(routeKey)}`;
}

export function isRouteViewUrl(viewUrl: string | undefined): viewUrl is string {
  return typeof viewUrl === "string" && viewUrl.startsWith(ROUTER_VIEW_URL_PREFIX);
}

export function resolveRouteTabDescriptor(
  route: RouteLocationNormalizedLoaded,
  options: VueRouterTabsOptions = {}
): RouteTabDescriptor | undefined {
  const meta = resolveRouteTabMeta(route, options);
  const routeKey = createRouteMatchKey(route, meta.match);
  const viewUrl = meta.viewUrl || createRouteViewUrl(routeKey);
  const descriptor: RouteTabDescriptor = {
    viewUrl,
    routeKey,
    route,
    location: meta.location,
    openOptions: {
      _viewName: meta.title,
      _viewIcon: meta.icon,
      _viewNoCache: !meta.keepAlive,
      _viewPinned: meta.pinned,
      _viewNoClose: !meta.closable,
      _viewNoDrag: meta.noDrag,
      _viewSingle: meta.single ?? meta.match === "record",
      route: {
        name: route.name ? String(route.name) : undefined,
        path: route.path,
        fullPath: route.fullPath,
        params: route.params,
        query: route.query,
        hash: route.hash,
        key: routeKey,
        location: meta.location,
      },
    },
  };
  return options.resolveDescriptor ? options.resolveDescriptor(route, descriptor) : descriptor;
}
