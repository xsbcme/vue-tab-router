import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { Tab } from "@xsbcme/vue-tab-router";
import { isRouteViewUrl, resolveRouteTabDescriptor } from "../route-descriptor";
import { RouteViewWrapper } from "../components";
import { shouldSyncRouteTab } from "../match";
import type { VueRouterTabsBridgeOptions } from "../types";

export function createVueRouterTabsBridge({
  router,
  tabsManager,
  app,
  onError,
  ...options
}: VueRouterTabsBridgeOptions) {
  let applyingRoute = false;
  let applyingTab = false;

  const reportError = (error: unknown) => {
    if (onError) {
      onError(error);
      return;
    }
    console.error(error);
  };

  const registerRouteView = (viewUrl: string) => {
    if (!app.component(viewUrl)) {
      app.component(viewUrl, RouteViewWrapper);
    }
  };

  const restoreRouteViews = () => {
    tabsManager.tabs.forEach(tab => {
      if (isRouteViewUrl(tab.viewUrl)) {
        registerRouteView(tab.viewUrl);
      }
    });
  };

  const applyRoute = async (route: RouteLocationNormalizedLoaded) => {
    if (applyingRoute || applyingTab || !shouldSyncRouteTab(route, options)) return;
    const descriptor = resolveRouteTabDescriptor(route, options);
    if (!descriptor) return;

    applyingRoute = true;
    try {
      registerRouteView(descriptor.viewUrl);
      await tabsManager.openTab(descriptor.viewUrl, descriptor.openOptions);
    } catch (error) {
      reportError(error);
    } finally {
      applyingRoute = false;
    }
  };

  const getTabLocation = (tab: Partial<Tab>) => {
    const route = tab.viewProps?.route;
    if (!route || typeof route !== "object" || !("location" in route)) return undefined;
    return route.location;
  };

  const getTabFullPath = (tab: Partial<Tab>) => {
    const route = tab.viewProps?.route;
    if (!route || typeof route !== "object" || !("fullPath" in route) || typeof route.fullPath !== "string") {
      return undefined;
    }
    return route.fullPath;
  };

  const applyTab = async (tab: Partial<Tab>) => {
    if (applyingRoute) return;
    const location = getTabLocation(tab);
    if (!location) return;

    applyingTab = true;
    try {
      await router.replace(location);
    } catch (error) {
      reportError(error);
    } finally {
      applyingTab = false;
    }
  };

  const applyClosedTab = async (closedTab: Partial<Tab>, fallbackTab?: Partial<Tab>) => {
    if (applyingRoute || getTabFullPath(closedTab) !== router.currentRoute.value.fullPath) return;
    if (fallbackTab) {
      await applyTab(fallbackTab);
    }
  };

  const syncCurrentRoute = () => applyRoute(router.currentRoute.value);
  restoreRouteViews();
  const removeRouteListener = router.afterEach(to => {
    void applyRoute(to);
  });
  const removeTabListener = tabsManager.hooks.on("tab:active-changed", tab => {
    void applyTab(tab);
  });
  const removeClosedListener = tabsManager.hooks.on("tab:closed", (closedTab, fallbackTab) => {
    void applyClosedTab(closedTab, fallbackTab);
  });

  void syncCurrentRoute();

  return {
    applyRoute,
    applyTab,
    syncCurrentRoute,
    dispose: () => {
      removeClosedListener();
      removeTabListener();
      removeRouteListener();
    },
  };
}

export type VueRouterTabsBridge = ReturnType<typeof createVueRouterTabsBridge>;
