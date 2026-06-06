import {
  App,
  AsyncComponentLoader,
  Component,
  defineAsyncComponent,
  defineComponent,
  createVNode,
  InjectionKey,
  markRaw,
  reactive,
} from "vue";
import type { ITabsManagerOptions, Modules } from "./types";
import type { TabsManager } from "./tabs-manager";

export const TABS_MANAGER_KEY = Symbol("TabsManager") as InjectionKey<TabsManager>;

export class TabsSharedContext {
  private app: App | null = null;
  private registered = false;
  private componentMap = new Map<string, Component>();

  constructor(private readonly options: ITabsManagerOptions) {}

  get modules() {
    return this.options.modules;
  }

  get source() {
    return this.options.source;
  }

  get registerTabPaths() {
    return Object.keys(this.modules || {});
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

    const loadingComponent = defineComponent({
      setup() {
        return () => createVNode("div", null, "加载中...");
      },
    });
    const errorComponent = defineComponent({
      setup() {
        return () => createVNode("div", null, "出错了!");
      },
    });

    return defineAsyncComponent<Component>({
      loadingComponent,
      errorComponent,
      delay: 500,
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
  app.provide(TABS_MANAGER_KEY, reactiveTabsManager);
  app.config.globalProperties.$tabsManager = reactiveTabsManager;
  return reactiveTabsManager;
}
