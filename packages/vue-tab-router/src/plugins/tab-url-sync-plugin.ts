import type { Tab } from "../tabs";
import type { TabsManagerPlugin } from "../tabs";
import { createTabRouterError } from "../shared";
import { resolveTabRouterLogger } from "../shared/logger";
import {
  createTabUrlSyncController,
  getCurrentRoute,
  isAllowedState,
  normalizeState,
  resolveIframeNavigationViewUrl,
  shouldSyncRoute,
  type CreateTabUrlSyncPluginOptions,
  type TabUrlSyncRouter,
} from "./tab-url-sync/index";

export type { CreateTabUrlSyncPluginOptions, TabUrlState, TabUrlSyncRoute, TabUrlSyncRouter } from "./tab-url-sync/index";

export function createTabUrlSyncPlugin(
  router: TabUrlSyncRouter,
  options: CreateTabUrlSyncPluginOptions = {}
): TabsManagerPlugin {
  const syncDocumentTitle = options.syncDocumentTitle !== false;

  return ({ tabsManager, hooks }) => {
    const initialDocumentTitle = typeof document === "undefined" ? "" : document.title;
    const logger = resolveTabRouterLogger(tabsManager.options.logger);

    const reportError = (error: unknown) => {
      if (options.onError) {
        options.onError(error);
        return;
      }
      logger.error?.("Tab URL sync failed", createTabRouterError("URL_SYNC_FAILED", "Tab URL sync failed", error));
    };

    const updateDocumentTitle = (tab: Partial<Tab> | undefined = tabsManager.activeTab) => {
      if (!syncDocumentTitle || typeof document === "undefined") return;
      const route = getCurrentRoute(router);
      if (!shouldSyncRoute(route, options.routePath)) return;

      const formattedTitle = options.formatDocumentTitle?.(tab, route);
      document.title = formattedTitle || tab?.viewName || tab?.viewUrl || initialDocumentTitle;
    };

    const syncController = createTabUrlSyncController({
      router,
      tabsManager,
      options,
      reportError,
      onRouteApplied: updateDocumentTitle,
    });

    const syncIframeNavigation = async (tab: Partial<Tab>, iframe: HTMLIFrameElement) => {
      if (options.syncIframeNavigation === false || syncController.applyingRoute) return;
      if (!tab._id || tab._id !== tabsManager.activeTab?._id) return;

      const viewUrl = resolveIframeNavigationViewUrl(tab, iframe);
      if (!viewUrl || viewUrl === tab.viewUrl) return;

      const nextState = normalizeState({ ...tab, viewUrl });
      if (!nextState || !isAllowedState(nextState, getCurrentRoute(router), options)) return;

      try {
        await tabsManager.updateTabOptions({ _viewUrl: viewUrl }, tab._id);
      } catch (error) {
        reportError(error);
      }
    };

    const applyInitialRouteState = syncController.applyRouteState(getCurrentRoute(router), true);
    updateDocumentTitle();
    Promise.resolve(applyInitialRouteState).then(syncController.syncInitialActiveTabToRoute);

    const removeRouteListener = router.afterEach?.(to => {
      syncController.applyRouteState(to).then(syncController.syncInitialActiveTabToRoute);
    });

    const removeOpened = hooks.on("tab:opened", tab => {
      updateDocumentTitle(tab);
      if (syncController.applyingRoute) return;
      return syncController.writeStateToRoute(normalizeState(tab));
    });
    const removeActiveChanged = hooks.on("tab:active-changed", tab => {
      updateDocumentTitle(tab);
      if (syncController.applyingRoute) return;
      return syncController.writeStateToRoute(normalizeState(tab));
    });
    const removeUpdated = hooks.on("tab:updated", tab => {
      updateDocumentTitle(tab);
      if (syncController.applyingRoute) return;
      return syncController.writeStateToRoute(normalizeState(tab), "replace");
    });
    const removeClosed = hooks.on("tab:closed", (_closedTab, fallbackTab) => {
      updateDocumentTitle(fallbackTab);
      if (syncController.applyingRoute) return;
      return syncController.writeStateToRoute(normalizeState(fallbackTab), "replace");
    });
    const removeCleared = hooks.on("tabs:cleared", () => {
      updateDocumentTitle(undefined);
      if (syncController.applyingRoute) return;
      return syncController.writeStateToRoute(undefined, "replace");
    });
    const removeIframeLoad = hooks.on("iframe:load", ({ tab, iframe }) => syncIframeNavigation(tab, iframe));

    return () => {
      removeRouteListener?.();
      removeOpened();
      removeActiveChanged();
      removeUpdated();
      removeClosed();
      removeCleared();
      removeIframeLoad();
    };
  };
}
