import type { RouteTabDescriptor } from "../types";

export function formatRouteTabDebug(descriptor: RouteTabDescriptor) {
  return {
    routeKey: descriptor.routeKey,
    viewUrl: descriptor.viewUrl,
    location: descriptor.location,
  };
}
