import type { Tab } from "../../tabs";
import type { TabsManager } from "../../tabs/tabs-manager";
import {
  clearQueryValue,
  createOpenOptions,
  defaultDeserialize,
  DEFAULT_QUERY_KEY,
  defaultSerialize,
  getCurrentRoute,
  getQueryValue,
  isAllowedState,
  isSameState,
  normalizeState,
  shouldSyncRoute,
} from "./tab-url-sync-state";
import type { CreateTabUrlSyncPluginOptions, TabUrlState, TabUrlSyncRoute, TabUrlSyncRouter } from "./types";

export interface TabUrlSyncControllerOptions {
  router: TabUrlSyncRouter;
  tabsManager: TabsManager;
  options: CreateTabUrlSyncPluginOptions;
  reportError(error: unknown): void;
  onRouteApplied(tab: Partial<Tab> | undefined): void;
}

export function createTabUrlSyncController({
  router,
  tabsManager,
  options,
  reportError,
  onRouteApplied,
}: TabUrlSyncControllerOptions) {
  const queryKey = options.queryKey || DEFAULT_QUERY_KEY;
  const serialize = options.serialize || defaultSerialize;
  const deserialize = options.deserialize || defaultDeserialize;
  const syncInitialActiveTab = options.syncInitialActiveTab !== false;
  let applyingRoute = false;
  let applyingTab = false;

  const readStateFromRoute = (route: TabUrlSyncRoute) => {
    const rawValue = getQueryValue(route.query, queryKey);
    return rawValue ? deserialize(rawValue) : undefined;
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
      onRouteApplied(tabsManager.activeTab);
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

  return {
    get applyingRoute() {
      return applyingRoute;
    },
    applyRouteState,
    syncInitialActiveTabToRoute,
    writeStateToRoute,
  };
}

export type TabUrlSyncController = ReturnType<typeof createTabUrlSyncController>;
