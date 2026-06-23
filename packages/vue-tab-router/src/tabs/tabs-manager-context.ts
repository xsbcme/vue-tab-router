import {
  App,
  AsyncComponentLoader,
  Component,
  defineAsyncComponent,
  InjectionKey,
  markRaw,
  reactive,
} from "vue";
import type { ITabsManagerOptions, Modules, TabViewMeta } from "../types";
import type { TabsManager } from "./tabs-manager";
import { DefaultErrorComponent, DefaultLoadingComponent } from "../components/default-state";

export const TABS_MANAGER_KEY = Symbol("TabsManager") as InjectionKey<TabsManager>;

let currentTabsManager: TabsManager | undefined;

export function setCurrentTabsManager(tabsManager: TabsManager | undefined) {
  currentTabsManager = tabsManager;
}

export function clearCurrentTabsManager(tabsManager: TabsManager | undefined) {
  if (currentTabsManager === tabsManager) {
    currentTabsManager = undefined;
  }
}

export function getCurrentTabsManager() {
  return currentTabsManager;
}

export class TabsSharedContext {
  private app: App | null = null;
  private registered = false;
  private componentMap = new Map<string, Component>();
  private viewMetaPathMap = new Map<string, TabViewMeta[]>();

  constructor(private readonly options: ITabsManagerOptions) {
    this.indexViewMeta(options.viewMeta || []);
  }

  get modules() {
    return this.options.modules;
  }

  get source() {
    return this.options.source;
  }

  get registerTabPaths() {
    return Object.keys(this.modules || {});
  }

  get viewMeta() {
    return this.options.viewMeta || [];
  }

  public bindApp(app: App) {
    this.app = markRaw(app);
    return this;
  }

  public registerModules() {
    if (this.registered || !this.app) return;
    this.registered = true;

    const modules = this.transformModules(this.modules || {});
    Object.keys(modules).forEach(viewId => {
      const component = markRaw(this.createComponent(modules[viewId]));
      this.componentMap.set(viewId, component);
      if (!this.appComponentExists(viewId)) {
        this.app!.component(viewId, component);
      }
    });
  }

  public resolveComponent(viewId: string) {
    return this.componentMap.get(viewId) || this.app?._context.components[viewId];
  }

  public getViewMeta(viewUrl: string | undefined) {
    if (!viewUrl) return undefined;
    const path = this.viewMetaPathMap.get(viewUrl);
    return path?.[path.length - 1];
  }

  public getViewMetaPath(viewUrl: string | undefined) {
    if (!viewUrl) return [];
    return this.viewMetaPathMap.get(viewUrl) || [];
  }

  private indexViewMeta(metas: TabViewMeta[], parentPath: TabViewMeta[] = []) {
    metas.forEach(meta => {
      const currentPath = [...parentPath, meta];
      if (meta.viewUrl) {
        this.viewMetaPathMap.set(meta.viewUrl, currentPath);
      }
      if (Array.isArray(meta.children)) {
        this.indexViewMeta(meta.children, currentPath);
      }
    });
  }

  private transformModules(modules: Modules) {
    return Object.keys(modules).reduce(
      (result, viewId) => {
        const module = modules[viewId];
        result[viewId] = typeof module === "object" && "default" in module ? module.default : module;
        return result;
      },
      {} as Record<string, Component | (() => Promise<Component>)>
    );
  }

  private createComponent(component: Component | (() => Promise<Component>)) {
    if (typeof component !== "function") return component;

    return defineAsyncComponent<Component>({
      loadingComponent: this.options.loadingComponent || DefaultLoadingComponent,
      errorComponent: this.options.errorComponent || DefaultErrorComponent,
      delay: 0,
      ...this.source,
      loader: component as AsyncComponentLoader<Component>,
    });
  }

  private appComponentExists(viewId: string) {
    return Boolean(this.app?._context.components[viewId]);
  }
}

export function provideTabsManager(app: App, tabsManager: TabsManager) {
  const reactiveTabsManager = reactive(tabsManager) as TabsManager;
  setCurrentTabsManager(reactiveTabsManager);
  app.provide(TABS_MANAGER_KEY, reactiveTabsManager);
  app.config.globalProperties.$tabsManager = reactiveTabsManager;
  return reactiveTabsManager;
}
