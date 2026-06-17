import type { Router } from "vue-router";
import type { TabsManagerPlugin } from "@xsbcme/vue-tab-router";
import { createVueRouterTabsBridge } from "./route-bridge";
import type { VueRouterTabsOptions } from "../types";

export function createVueRouterTabsPlugin(router: Router, options: VueRouterTabsOptions = {}): TabsManagerPlugin {
  return ({ app, tabsManager }) => {
    const bridge = createVueRouterTabsBridge({ router, tabsManager, app, ...options });
    return bridge.dispose;
  };
}
