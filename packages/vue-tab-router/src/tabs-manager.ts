import { App, defineAsyncComponent, nextTick, createVNode, defineComponent, toRaw } from "vue";
import { Plugin } from "./base/plugin";
import { Tab } from "./tab";
import { IOpenTabOptions, ITabsManagerOptions, IUpdateTabOptions, Modules, TabGuard, TabGuardName } from "./types";
import { isHttpUrl, jsonToObject, createRandomString, clone, findParentPathsByPath, resolveViewUrl } from "./utils";
import { RELATIVE_VIEW_URL_PREFIX_KEY, STORAGE_TABS_KEY } from "./constant";
import { useEventManager } from "./use-event-manager";
import { AbstractStorageAdapter } from "./abstract-storage-adapter";
import { StorageAdapter } from "./storage-adapter";

export class TabsManager extends Plugin {
  private static _instance: TabsManager | null = null;
  private _options: ITabsManagerOptions | null = null;
  private _app: App | null = null;
  private _tabs: Tab[] = [];
  private _refreshAllTabFlag: boolean = false;
  private _storageAdapter: AbstractStorageAdapter | null = null;

  get app() {
    return this._app;
  }

  get options() {
    return this._options;
  }

  get storage() {
    return this._storageAdapter;
  }

  get refreshAllTabFlag() {
    return this._refreshAllTabFlag;
  }

  /**
   * 当前打开的标签页数组
   */
  get tabs() {
    return this._tabs;
  }

  /**
   * 当前激活的标签页
   */
  get activeTab() {
    return this._tabs.find(item => item._isActive);
  }

  /**
   * 获取全部注册的标签页路径
   */
  get registerTabPaths() {
    return Object.keys(this._options.modules || {});
  }

  /**
   * 获取当前激活的标签页的父路径
   */
  get activeTabParentPaths() {
    return findParentPathsByPath(this.registerTabPaths, this.activeTab?.viewUrl);
  }

  private constructor() {
    super();
  }

  public static getInstance(): TabsManager {
    if (!this._instance) {
      this._instance = new this();
    }
    return this._instance;
  }

  public _initOptions(options: ITabsManagerOptions) {
    this._options = options;
    this._storageAdapter = options.storageAdapter ?? new StorageAdapter();
    this._tabs = this._storageAdapter.get(STORAGE_TABS_KEY, []).map(item => new Tab(item));
    return this;
  }

  private registerModules() {
    const { modules: rawModules, source } = this._options || {};
    const transformModules = (modules: Modules) => {
      return Object.keys(modules).reduce((pre, cur) => {
        const module = modules[cur];
        pre[cur] = typeof module === "function" ? module : Reflect.get(module, "default");
        return pre;
      }, {} as Modules);
    };
    const modules = transformModules(rawModules || {});
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
    Object.keys(modules).forEach(viewId => {
      if (!this._app) return;
      if (this.getAppComponentByName(viewId)) return;
      let component = modules[viewId];
      if (typeof component === "function") {
        component = defineAsyncComponent<Object>({
          loadingComponent,
          errorComponent,
          delay: 500,
          ...source,
          loader: component,
        });
      }
      this._app.component(viewId, component);
    });
  }

  /**
   * 按 tabId 获取标签页实例。
   */
  public getTabById(tabId: string | undefined) {
    return this._tabs.find(item => item._id === tabId);
  }

  private getTabByViewUrl(viewUrl: string) {
    return this._tabs.find(item => item.viewUrl == viewUrl);
  }

  private getAppComponentByName(name: string) {
    return this._app!._context.components[name];
  }

  private isUrl(url: string) {
    return url?.startsWith(RELATIVE_VIEW_URL_PREFIX_KEY) || isHttpUrl(url);
  }

  private getTabByViewUrlAndProps(viewUrl: string, props: Record<string, any> | undefined) {
    const filterTabsByComponent = this._tabs.filter(tab => tab.viewUrl === viewUrl);
    return filterTabsByComponent.find(tab => {
      return JSON.stringify(tab.viewProps) === JSON.stringify(props);
    });
  }

  private setTabNoAllowClose(noAllow: boolean = true, tabId?: string) {
    return nextTick<void>(() => {
      const findTab = this.getTabById(tabId || this.activeTab?._id);
      if (!findTab) {
        return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
      }
      Object.assign<Tab, Partial<Tab>>(findTab, { _noClose: noAllow });
      this.storage?.set(STORAGE_TABS_KEY, toRaw(this._tabs));
    });
  }

  private setFirstTab(tabId: string) {
    return nextTick<void>(async () => {
      const findIndex = this._tabs.findIndex(tab => tab._id === tabId);
      if (findIndex < 0) {
        return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
      }
      this._tabs.forEach(tab => (tab._isFirst = undefined));
      this._tabs[findIndex]._isFirst = true;
      if (findIndex >= 1) {
        this._tabs.unshift(this._tabs.splice(findIndex, 1)[0]);
      }
      this.storage?.set(STORAGE_TABS_KEY, toRaw(this._tabs));
    });
  }

  /** 激活首页标签（`_isFirst` 为 true 的 tab）。 */
  public activeFirstTab() {
    return nextTick(async () => {
      const findTab = this._tabs.find(tab => tab._isFirst);
      if (findTab) {
        await this.changeActiveTab(findTab._id);
      }
    });
  }

  /**
   * 打开首页标签。
   *
   * - `clear`: 清空后再打开
   * - `replace`: 替换已有首页
   * - `move`: 打开后移动到首位
   */
  public async openFirstTab<Url extends string>(
    viewUrl: Url,
    tabOptions?: Omit<IOpenTabOptions, "_viewOutside" | "_viewOutsideProps">,
    mode: "clear" | "replace" | "move" = "replace"
  ) {
    switch (mode) {
      case "clear":
        this.clear();
        break;

      case "replace":
        const existingFirstTab = this._tabs.find(tab => tab._isFirst);
        if (existingFirstTab) {
          await this.setTabNoAllowClose(false, existingFirstTab._id);
          await this.closeTab(existingFirstTab._id, true);
        }
        break;
      case "move":
        break;
    }

    const tabId = await this.openTab(viewUrl, {
      ...tabOptions,
      _viewOutside: false,
      _viewOutsideProps: undefined,
      _viewSingle: true,
    });

    await this.setTabNoAllowClose(true, tabId);
    await this.setFirstTab(tabId);
    return tabId;
  }

  public _registerTabGuard(tabId: string, guardName: TabGuardName, guard: TabGuard) {
    const findTab = this.getTabById(tabId);
    if (!findTab) return;
    findTab[guardName] = guard;
  }

  /**
   * 切换当前激活标签页。
   * @param triggerHook 是否触发全局进入守卫。
   */
  public changeActiveTab(tabId: string, triggerHook: boolean = true) {
    return nextTick(async () => {
      if (tabId === this.activeTab?._id) return tabId;
      const findTab = this.getTabById(tabId);
      if (!findTab) return Promise.reject(new Error(`标签页不存在[${tabId}]`));

      if (triggerHook) {
        try {
          const currentTab = this.activeTab;
          // 全局：进入前守卫
          const onBeforeTabEnter = this._options?.onBeforeTabEnter;
          typeof onBeforeTabEnter === "function" && (await onBeforeTabEnter(clone(findTab), clone(currentTab)));
          // 页面级：目标 tab 进入前守卫
          typeof findTab._onBeforeTabEnter === "function" &&
            (await findTab._onBeforeTabEnter(clone(findTab), clone(currentTab)));
        } catch (error) {
          return Promise.reject(error);
        }
      }

      this._tabs.forEach(item => {
        if (item._id === tabId) {
          Object.assign<Tab, Partial<Tab>>(item, { _isActive: true });
        } else {
          Object.assign<Tab, Partial<Tab>>(item, { _isActive: undefined });
        }
      });
      this.storage?.set(STORAGE_TABS_KEY, toRaw(this._tabs));

      return tabId;
    });
  }

  /**
   * 更新 tab 配置。支持传对象或 JSON 字符串。
   */
  public updateTabOptions(options: IUpdateTabOptions | string, tabId?: string) {
    return nextTick(() => {
      const findTab = tabId ? this.getTabById(tabId) : this.activeTab;
      if (!findTab) return;

      const parsedOptions = jsonToObject(options, {}) as IUpdateTabOptions;
      const { _viewName, _viewIcon, _viewUrl, _viewNoCache, _viewSingle, ...viewProps } = parsedOptions;

      // viewProps 采用浅合并，保证未覆盖字段仍然保留。
      const mergedViewProps = { ...findTab.viewProps, ...viewProps };

      Object.assign<Tab, Partial<Tab>>(findTab, {
        viewName: _viewName ?? findTab.viewName,
        viewIcon: _viewIcon ?? findTab.viewIcon,
        viewUrl: _viewUrl ?? findTab.viewUrl,
        viewProps: mergedViewProps,
        _noCache: _viewNoCache ?? findTab._noCache,
        _single: _viewSingle ?? findTab._single,
      });

      this.storage?.set(STORAGE_TABS_KEY, toRaw(this._tabs));
    });
  }

  /**
   * 打开新标签页或复用已存在标签页。
   * 若 `options._viewOutside` 为 true，则在新窗口打开链接并返回 `Window`。
   */
  public openTab<Url extends string>(viewUrl: Url, tabOptions?: IOpenTabOptions): Promise<string>;
  public openTab<Url extends string>(
    viewUrl: Url,
    tabOptions?: IOpenTabOptions & { _viewOutside: true }
  ): Promise<Window>;
  public openTab<Url extends string>(viewUrl: Url, tabOptions?: IOpenTabOptions) {
    return nextTick(async () => {
      const { _viewOutside, _viewOutsideProps, _viewName, _viewIcon, _viewNoCache, _viewSingle, ...viewProps } =
        jsonToObject(tabOptions || {}, {}) as IOpenTabOptions;

      // 链接型地址（http/https 或 relative: 前缀）
      if (this.isUrl(viewUrl)) {
        const newViewUrl = resolveViewUrl(viewUrl);
        if (_viewOutside) {
          const { target, features } = _viewOutsideProps || {};
          return window.open(newViewUrl, target, features);
        }
      } else if (!this.getAppComponentByName(viewUrl)) {
        return Promise.reject(new Error(`视图未注册[${viewUrl}]`));
      }

      // 初始化候选 tab
      const newTab = new Tab({
        viewUrl,
        viewName: _viewName,
        viewIcon: _viewIcon,
        viewProps,

        _sourceId: this.activeTab?._id,
        _noCache: _viewNoCache,
        _single: _viewSingle,
        _id: createRandomString(),
      });
      // 同一 viewUrl + viewProps 则复用
      const findTabByProps = this.getTabByViewUrlAndProps(newTab.viewUrl, newTab.viewProps);
      if (findTabByProps) {
        newTab._id = findTabByProps._id;
      }

      // 离开当前 tab 前先执行页面级离开守卫
      if (newTab._id !== this.activeTab?._id) {
        try {
          typeof this.activeTab?._onBeforeTabLeave === "function" &&
            (await this.activeTab._onBeforeTabLeave(clone(newTab), clone(this.activeTab)));
        } catch (error) {
          return Promise.reject(error);
        }
      }

      if (findTabByProps) {
        return await this.changeActiveTab(findTabByProps._id);
      }

      // 不存在同路径 tab，或目标是多例模式时，新增 tab
      const findTabByViewUrl = this.getTabByViewUrl(viewUrl);
      if (!findTabByViewUrl || (findTabByViewUrl && !newTab._single)) {
        const onBeforeTabOpen = this._options?.onBeforeTabOpen;
        typeof onBeforeTabOpen === "function" &&
          (await onBeforeTabOpen(clone(newTab), clone(this.getTabById(newTab._sourceId))));

        this._tabs.push(newTab);

        return await this.changeActiveTab(newTab._id, false);
      }

      const findTab = this.getTabById(findTabByViewUrl._id);
      if (findTab) {
        Object.assign<Tab, Partial<Tab>>(
          findTab,
          Object.assign<Tab, Partial<Tab>>(newTab, { _id: findTab._id, _sourceId: findTab._sourceId })
        );
      }
      await this.refreshTab(newTab._id);
      return await this.changeActiveTab(newTab._id);
    });
  }

  /**
   * 修复来源链路：把指向旧 tabId 的 `_sourceId` 重定向到新 tabId。
   */
  private setTabsSourceIdById(id: string, newId: string | undefined) {
    return this._tabs.filter(item => item._sourceId == id).forEach(item => (item._sourceId = newId));
  }

  /**
   * 关闭标签页。
   * @param force 为 true 时忽略 `_noClose` 限制。
   */
  public closeTab(tabId?: string, force: boolean = false) {
    return nextTick<void>(async () => {
      const findTab = this.getTabById(tabId || this.activeTab?._id);
      if (!findTab) {
        return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
      }
      const findTabIndex = this._tabs.indexOf(findTab);
      if (findTabIndex >= 0) {
        if (!force && findTab._noClose) {
          return;
        }

        try {
          // 页面级：关闭前守卫
          typeof findTab._onBeforeTabClose === "function" &&
            (await findTab._onBeforeTabClose(clone(this.getTabById(findTab._sourceId)), clone(findTab)));
          // 全局：关闭前守卫
          const onBeforeTabClose = this._options?.onBeforeTabClose;
          typeof onBeforeTabClose === "function" &&
            (await onBeforeTabClose(clone(findTab), clone(this.getTabById(findTab._sourceId))));
        } catch (error) {
          return Promise.reject(error);
        }

        const eventManager = useEventManager();
        eventManager.eventNames.forEach((eventName: string) => {
          if (eventName.startsWith(findTab._id)) {
            eventManager.off(eventName);
          }
        });

        if (this.activeTab?._id === findTab._id) {
          const parentTab = this.getTabById(findTab._sourceId);
          parentTab && (await this.changeActiveTab(parentTab._id));
        }
        this._tabs.splice(findTabIndex, 1);
        this.setTabsSourceIdById(findTab._id, findTab._sourceId);

        this.storage?.set(STORAGE_TABS_KEY, toRaw(this._tabs));
      }
    });
  }

  /**
   * 关闭全部标签页（不可关闭标签页除外）
   */
  public closeTabByAll() {
    return nextTick(async () => {
      const tabs = clone(this._tabs);
      for (let index = 0; index < tabs.length; index++) {
        await this.closeTab(tabs[index]._id);
      }
    });
  }

  /**
   * 刷新指定标签页（通过切换 `_isRefresh` 触发重建）。
   */
  public refreshTab(tabId?: string) {
    return nextTick(() => {
      const findTab = this.getTabById(tabId || this.activeTab?._id);
      if (!findTab) {
        return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
      }
      Object.assign<Tab, Partial<Tab>>(findTab, { _isRefresh: true });
      return nextTick(() => {
        Object.assign<Tab, Partial<Tab>>(findTab, { _isRefresh: undefined });
      });
    });
  }

  /**
   * 刷新所有标签页
   */
  public refreshTabAll() {
    return nextTick(() => {
      this._refreshAllTabFlag = true;
      return nextTick(() => {
        this._refreshAllTabFlag = false;
      });
    });
  }

  /**
   * 向来源（父）标签页发送事件。
   */
  public emit(eventName: string, data?: unknown, tabId?: string) {
    const findTab = this.getTabById(tabId || this.activeTab?._id);
    if (findTab && findTab._sourceId) {
      const eventManager = useEventManager();
      eventManager.emit(`${findTab._sourceId || ""}_${eventName}`, data);
    }
  }

  /**
   * 交换标签页位置
   * @param tabIndex1 标签页索引
   * @param tabIndex2 标签页索引
   */
  public swapTabByIndex(tabIndex1: number, tabIndex2: number) {
    return nextTick(() => {
      if (tabIndex1 >= 0 && tabIndex2 >= 0) {
        const temp = this._tabs[tabIndex1];
        this._tabs[tabIndex1] = this._tabs[tabIndex2];
        this._tabs[tabIndex2] = temp;
      }
    });
  }

  /**
   * 交换标签页位置
   * @param tabId1 标签页ID
   * @param tabId2 标签页ID
   */
  public swapTabById(tabId1: string, tabId2: string) {
    return nextTick(() => {
      const findTab1Index = this._tabs.findIndex(tab => tab._id === tabId1);
      const findTab2Index = this._tabs.findIndex(tab => tab._id === tabId2);
      return this.swapTabByIndex(findTab1Index, findTab2Index);
    });
  }

  /**
   * 关闭左侧所有标签页（不可关闭标签页除外）
   * @param tabId 标签页ID，不填时默认为当前激活的标签页
   */
  public closeTabsByLeft(tabId?: string) {
    return nextTick(async () => {
      const findTab = this.getTabById(tabId || this.activeTab?._id);
      if (!findTab) {
        return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
      }
      const tabs = clone(this._tabs);
      const findTabIndex = this._tabs.indexOf(findTab);
      for (let index = 0; index < findTabIndex; index++) {
        await this.closeTab(tabs[index]._id);
      }
      await this.changeActiveTab(findTab._id);
    });
  }

  /**
   * 关闭右侧所有标签页（不可关闭标签页除外）
   * @param tabId 标签页ID，不填时默认为当前激活的标签页
   */
  public closeTabsByRight(tabId?: string) {
    return nextTick(async () => {
      const findTab = this.getTabById(tabId || this.activeTab?._id);
      if (!findTab) {
        return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
      }
      const tabs = clone(this._tabs);
      const findTabIndex = this._tabs.indexOf(findTab);
      for (let index = findTabIndex + 1; index < tabs.length; index++) {
        await this.closeTab(tabs[index]._id);
      }
      await this.changeActiveTab(findTab._id);
    });
  }

  /**
   * 关闭除开所有标签页（不可关闭标签页除外）
   * @param tabId 标签页ID，不填时默认为当前激活的标签页
   */
  public closeTabsByOther(tabId?: string) {
    return nextTick(async () => {
      const findTab = this.getTabById(tabId || this.activeTab?._id);
      if (!findTab) {
        return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
      }
      const tabs = clone(this._tabs);
      const findTabIndex = this._tabs.indexOf(findTab);
      for (let index = 0; index < tabs.length; index++) {
        if (tabs[index]._id !== tabs[findTabIndex]._id) {
          await this.closeTab(tabs[index]._id);
        }
      }
      await this.changeActiveTab(findTab._id);
    });
  }

  /**
   * 清空标签（退出系统时调用）
   */
  public clear() {
    this._tabs = [];
    this._refreshAllTabFlag = false;
    this.storage?.del(STORAGE_TABS_KEY);
    useEventManager().clear();
  }

  private destroy() {
    super.clearPlugin();
    this._app = null;
    this._options = null;
    TabsManager._instance = null;
  }

  public install(app: App) {
    this._app = app;
    const mountApp = app.mount;
    app.mount = (...args) => {
      this.registerModules();
      // todo 这里应该将标签页列表遍历一遍提取参数缓存进内存中
      return mountApp(...args);
    };
    const unmountApp = app.unmount;
    app.unmount = (...args) => {
      this.destroy();
      return unmountApp(...args);
    };
    super.loadPlugin();
    app.config.globalProperties.$tabsManager = this;
  }
}
