import type { App, Component } from "vue";
import type { RouteLocationNormalizedLoaded, RouteLocationRaw, Router } from "vue-router";
import type { IOpenTabOptions, TabsManager } from "@xsbcme/vue-tab-router";

export type RouteTabMatchRule = "record" | "path" | "fullPath" | ((route: RouteLocationNormalizedLoaded) => unknown);

export type RouteTabType = "route" | "view" | "iframe";

export interface RouteTabMeta {
  /** 页签标题。未配置时回退到插件 title 选项、route.name 或 route.path。 */
  title?: string | ((route: RouteLocationNormalizedLoaded) => string | undefined);
  /** 页签图标。 */
  icon?: string | ((route: RouteLocationNormalizedLoaded) => string | undefined);
  /** 页签复用粒度。默认 record。 */
  match?: RouteTabMatchRule;
  /** 页签类型。route 会使用内部路由 viewUrl，view/iframe 可显式指定 viewUrl。 */
  type?: RouteTabType;
  /** 自定义 viewUrl。未配置时由 match 规则生成内部 viewUrl。 */
  viewUrl?: string | ((route: RouteLocationNormalizedLoaded) => string | undefined);
  /** 是否允许关闭。false 会打开后标记为不可关闭。 */
  closable?: boolean | ((route: RouteLocationNormalizedLoaded) => boolean);
  /** 是否缓存。false 会映射为 _viewNoCache。 */
  keepAlive?: boolean | ((route: RouteLocationNormalizedLoaded) => boolean);
  /** 是否置顶。 */
  pinned?: boolean | ((route: RouteLocationNormalizedLoaded) => boolean);
  /** 是否禁止拖拽。 */
  noDrag?: boolean | ((route: RouteLocationNormalizedLoaded) => boolean);
  /** 是否强制同 viewUrl 单例复用。未配置时由 match 规则推导。 */
  single?: boolean | ((route: RouteLocationNormalizedLoaded) => boolean);
  /** 点击页签时回到的路由位置。 */
  location?: RouteLocationRaw | ((route: RouteLocationNormalizedLoaded) => RouteLocationRaw);
}

export interface ResolvedRouteTabMeta {
  title?: string;
  icon?: string;
  match: RouteTabMatchRule;
  type: RouteTabType;
  viewUrl?: string;
  closable: boolean;
  keepAlive: boolean;
  pinned: boolean;
  noDrag: boolean;
  single?: boolean;
  location: RouteLocationRaw;
}

export interface RouteTabDescriptor {
  viewUrl: string;
  routeKey: string;
  route: RouteLocationNormalizedLoaded;
  location: RouteLocationRaw;
  openOptions: IOpenTabOptions;
}

export interface VueRouterTabsOptions {
  /** 限制哪些路由会同步为页签。默认跳过 meta.tab === false 的路由。 */
  include?: (route: RouteLocationNormalizedLoaded) => boolean;
  /** 全局默认页签复用粒度。 */
  match?: RouteTabMatchRule;
  /** 默认标题格式化。 */
  title?: (route: RouteLocationNormalizedLoaded) => string | undefined;
  /** 默认图标格式化。 */
  icon?: (route: RouteLocationNormalizedLoaded) => string | undefined;
  /** 自定义 route 到 tab 描述符的最终转换。 */
  resolveDescriptor?: (
    route: RouteLocationNormalizedLoaded,
    descriptor: RouteTabDescriptor
  ) => RouteTabDescriptor | undefined;
  /** 同步失败回调。 */
  onError?: (error: unknown) => void;
}

export interface VueRouterTabsBridgeOptions extends VueRouterTabsOptions {
  app: App;
  router: Router;
  tabsManager: TabsManager;
}

export interface RouterTabsContainerProps {
  tabs?: Component;
  container?: Component;
}

declare module "vue-router" {
  interface RouteMeta {
    tab?: boolean | RouteTabMeta;
  }
}
