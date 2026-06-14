import { App, markRaw, nextTick } from "vue";
import type { IframePostMessageOptions } from "./iframe-message";
import { Tab } from "./tab";
import {
  CloseTabOptions,
  CloseTabsOptions,
  IOpenTabOptions,
  ITabsManagerOptions,
  IUpdateTabOptions,
  TabCloseGuard,
  TabEnterGuard,
  TabGuard,
  TabGuardName,
  TabLeaveGuard,
} from "./types";
import { jsonToObject, clone, findParentPathsByPath } from "./utils";
import { TabsManagerHooks, TabsManagerPluginCleanup } from "./tabs-manager-plugin";
import { EventManager } from "./event-manager";
import { provideTabsManager, TabsSharedContext } from "./tabs-manager-context";
import { closeSingleTab, closeTabsInBatch, type TabCloseRuntime } from "./tabs-manager-close";
import { TabsPersistence } from "./tabs-persistence";
import {
  changeActiveTab as changeActiveTabState,
  runChangeActiveTabGuards as runActiveTabGuards,
  type TabActiveRuntime,
} from "./tabs-manager-active";
import {
  getMoveTabState,
  insertTab as insertTabByOrder,
  moveTab as moveTabByOrder,
  sortPinnedTabs as sortTabsByPinned,
  swapTabByIndex as swapTabsByIndex,
} from "./tabs-order";
import { openTab as openTabState, type TabOpenRuntime } from "./tabs-manager-open";

export class TabsManager {
  private _options: ITabsManagerOptions;
  private _app: App | null = null;
  private _tabs: Tab[] = [];
  private _tabById = new Map<string, Tab>();
  private _firstTabByViewUrl = new Map<string, Tab>();
  private _activeTabId?: string;
  private _activeTab?: Tab;
  private _detachedTab: Partial<Tab> | null = null;
  private _refreshAllTabFlag: boolean = false;
  private _persistence: TabsPersistence;
  private _hooks = new TabsManagerHooks();
  private _pluginCleanups: TabsManagerPluginCleanup[] = [];
  private _pluginsLoaded = false;
  private _reactiveManager: TabsManager | null = null;
  private _noCloseTabCloseHandler?: (tab: Partial<Tab>) => boolean | Promise<boolean>;
  private _iframeMessenger?: (
    tabId: string,
    data: unknown,
    targetOrigin?: string,
    transfer?: Transferable[]
  ) => boolean;

  public readonly events = new EventManager();

  public constructor(options: ITabsManagerOptions, sharedContext = new TabsSharedContext(options)) {
    this.sharedContext = markRaw(sharedContext);
    this._options = options;
    this._persistence = new TabsPersistence(options);
    this.setTabs(this.restoreTabs());
  }

  private readonly sharedContext: TabsSharedContext;

  get app() {
    return this._app;
  }

  get options() {
    return this._options;
  }

  get storage() {
    return this._persistence.storage;
  }

  get hooks() {
    return this._hooks;
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
  get activeTab(): Tab | undefined {
    if (this._activeTab && this._activeTab._id === this._activeTabId && this._activeTab._isActive) {
      return this._activeTab;
    }
    const activeTab = this._tabs.find(item => item._isActive);
    this._activeTabId = activeTab?._id;
    this._activeTab = activeTab;
    return activeTab;
  }

  get detachedTab() {
    return this._detachedTab;
  }

  get detachedZIndex() {
    return this._options.detachedZIndex ?? 1000;
  }

  get detachedFullscreen() {
    return this._options.detachedFullscreen !== false;
  }

  /**
   * 获取全部注册的标签页路径
   */
  get registerTabPaths() {
    return this.sharedContext.registerTabPaths;
  }

  /**
   * 获取当前激活的标签页的父路径
   */
  get activeTabParentPaths(): string[] {
    const activeTab = this.activeTab;
    if (!activeTab) return [];
    return findParentPathsByPath(this.registerTabPaths, activeTab.viewUrl);
  }

  public getViewMeta(viewUrl: string | undefined) {
    return this.sharedContext.getViewMeta(viewUrl);
  }

  public getViewMetaPath(viewUrl: string | undefined) {
    return this.sharedContext.getViewMetaPath(viewUrl);
  }

  public createScopedManager(options: Partial<ITabsManagerOptions> = {}) {
    return new TabsManager(
      {
        ...this._options,
        ...options,
        modules: this._options.modules,
        source: options.source ?? this._options.source,
        storageAdapter: options.storageAdapter,
        storageKey: options.storageKey,
        storageEnabled: options.storageEnabled ?? false,
        plugins: options.plugins,
        onBeforeTabOpen: options.onBeforeTabOpen,
        onBeforeTabEnter: options.onBeforeTabEnter,
        onBeforeTabLeave: options.onBeforeTabLeave,
        onBeforeTabClose: options.onBeforeTabClose,
      },
      this.sharedContext
    );
  }

  private restoreTabs() {
    const tabs = this._persistence.restore<Partial<Tab>[]>([]).map(item => new Tab(item));
    const activeTab = tabs.find(item => item._isActive);
    this._activeTabId = activeTab?._id;
    this._activeTab = activeTab;
    return tabs;
  }

  private persistTabs() {
    this._persistence.persist(this._tabs);
  }

  private async deferPersist<T>(runner: () => Promise<T>) {
    return this._persistence.defer(runner, () => this.persistTabs());
  }

  private clearPersistedTabs() {
    this._persistence.clear();
  }

  private setupPlugins() {
    if (this._pluginsLoaded || !this._app) return;
    this._pluginsLoaded = true;
    const plugins = this._options?.plugins ?? [];
    const tabsManager = this.getReactiveManager();
    plugins.forEach(plugin => {
      const disposers: TabsManagerPluginCleanup[] = [];
      const setup = typeof plugin === "function" ? plugin : plugin.setup;
      const cleanup = setup({
        app: this._app!,
        tabsManager,
        hooks: this._hooks,
        onDispose: disposer => disposers.push(disposer),
      });
      if (typeof cleanup === "function") {
        disposers.push(cleanup);
      }
      this._pluginCleanups.push(...disposers.reverse());
    });
  }

  private disposePlugins() {
    this._pluginCleanups.splice(0).forEach(dispose => dispose());
    this._hooks.clear();
    this._pluginsLoaded = false;
  }

  public getReactiveManager() {
    return this._reactiveManager || this;
  }

  private getStateManager() {
    return this._reactiveManager || this;
  }

  private getCloseRuntime(): TabCloseRuntime {
    const manager = this;
    return {
      get tabs() {
        return manager._tabs;
      },
      get activeTab() {
        return manager.activeTab;
      },
      get detachedTab() {
        return manager._detachedTab;
      },
      get options() {
        return manager._options;
      },
      get hooks() {
        return manager._hooks;
      },
      get events() {
        return manager.events;
      },
      setTabs(tabs) {
        manager.setTabs(tabs);
      },
      setActiveTabId(tabId) {
        manager.setActiveTabId(tabId);
      },
      syncTabs() {
        manager.rebuildTabIndexes();
        manager.syncActiveTabId();
      },
      getTabById(tabId) {
        return manager.getTabById(tabId);
      },
      getNoCloseTabCloseHandler() {
        return manager._noCloseTabCloseHandler;
      },
      runChangeActiveTabGuards(toTab, fromTab) {
        return manager.runChangeActiveTabGuards(toTab, fromTab);
      },
      closeDetachedTab() {
        return manager.closeDetachedTab();
      },
      persistTabs() {
        manager.persistTabs();
      },
    };
  }

  private getActiveRuntime(): TabActiveRuntime {
    const manager = this;
    return {
      get tabs() {
        return manager._tabs;
      },
      get activeTab() {
        return manager.activeTab;
      },
      get options() {
        return manager._options;
      },
      get hooks() {
        return manager._hooks;
      },
      getTabById(tabId) {
        return manager.getTabById(tabId);
      },
      setActiveTabId(tabId) {
        manager.setActiveTabId(tabId);
      },
      persistTabs() {
        manager.persistTabs();
      },
    };
  }

  private getOpenRuntime(): TabOpenRuntime & { readonly tabs: Tab[] } {
    const manager = this;
    return {
      get tabs() {
        return manager._tabs;
      },
      get activeTab() {
        return manager.activeTab;
      },
      get options() {
        return manager._options;
      },
      get hooks() {
        return manager._hooks;
      },
      getViewMeta(viewUrl) {
        return manager.getViewMeta(viewUrl);
      },
      getTabById(tabId) {
        return manager.getTabById(tabId);
      },
      getTabByViewUrl(viewUrl) {
        return manager.getTabByViewUrl(viewUrl);
      },
      resolveComponent(name) {
        return manager.resolveComponent(name);
      },
      insertTab(tab) {
        manager.insertTab(tab);
      },
      runChangeActiveTabGuards(toTab, fromTab) {
        return manager.runChangeActiveTabGuards(toTab, fromTab);
      },
      changeActiveTab(tabId, triggerHook) {
        return manager.changeActiveTab(tabId, triggerHook);
      },
      refreshTab(tabId) {
        return manager.refreshTab(tabId);
      },
    };
  }

  /**
   * 按 tabId 获取标签页实例。
   */
  public getTabById(tabId: string | undefined) {
    return tabId ? this._tabById.get(tabId) : undefined;
  }

  private getTabByViewUrl(viewUrl: string) {
    return this._firstTabByViewUrl.get(viewUrl);
  }

  public resolveComponent(name: string) {
    return this.sharedContext.resolveComponent(name);
  }

  private insertTab(tab: Tab) {
    insertTabByOrder(this._tabs, tab);
    this.rebuildTabIndexes();
  }

  private sortPinnedTabs() {
    this.setTabs(sortTabsByPinned(this._tabs));
  }

  private setTabs(tabs: Tab[]) {
    this._tabs = tabs;
    this.rebuildTabIndexes();
    this.syncActiveTabId();
  }

  private rebuildTabIndexes() {
    this._tabById = new Map();
    this._firstTabByViewUrl = new Map();
    this._tabs.forEach(tab => {
      this._tabById.set(tab._id, tab);
      if (!this._firstTabByViewUrl.has(tab.viewUrl)) {
        this._firstTabByViewUrl.set(tab.viewUrl, tab);
      }
    });
  }

  private syncActiveTabId() {
    const activeTab = this._tabs.find(tab => tab._isActive);
    this._activeTabId = activeTab?._id;
    this._activeTab = activeTab;
  }

  private setActiveTabId(tabId: string | undefined) {
    this._activeTabId = tabId;
    this._activeTab = tabId ? this.getTabById(tabId) : undefined;
  }

  private setTabNoAllowClose(noAllow: boolean = true, tabId?: string) {
    return nextTick<void>(() => {
      const findTab = this.getTabById(tabId || this.activeTab?._id);
      if (!findTab) {
        return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
      }
      Object.assign<Tab, Partial<Tab>>(findTab, { _noClose: noAllow });
      this.rebuildTabIndexes();
      this.persistTabs();
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
      this._tabs[findIndex]._noDrag = true;
      if (findIndex >= 1) {
        this._tabs.unshift(this._tabs.splice(findIndex, 1)[0]);
        this.rebuildTabIndexes();
      }
      this.syncActiveTabId();
      this.persistTabs();
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
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.openFirstTab(viewUrl, tabOptions, mode);

    switch (mode) {
      case "clear":
        await this.clear();
        break;

      case "replace":
        const existingFirstTab = this._tabs.find(tab => tab._isFirst);
        if (existingFirstTab) {
          await this.setTabNoAllowClose(false, existingFirstTab._id);
          await this.closeTab(existingFirstTab._id, { ignoreNoClose: true, skipGuard: true });
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

  public _registerTabGuard(tabId: string, guardName: "_onBeforeTabEnter", guard: TabEnterGuard): void;
  public _registerTabGuard(tabId: string, guardName: "_onBeforeTabLeave", guard: TabLeaveGuard): void;
  public _registerTabGuard(tabId: string, guardName: "_onBeforeTabClose", guard: TabCloseGuard): void;
  public _registerTabGuard(tabId: string, guardName: TabGuardName, guard: TabGuard) {
    const findTab = this.getTabById(tabId);
    if (!findTab) return;
    findTab[guardName] = guard;
  }

  public _setIframeMessenger(
    messenger?: (tabId: string, data: unknown, targetOrigin?: string, transfer?: Transferable[]) => boolean
  ) {
    this._iframeMessenger = messenger;
  }

  public _setNoCloseTabCloseHandler(handler?: (tab: Partial<Tab>) => boolean | Promise<boolean>) {
    this._noCloseTabCloseHandler = handler;
  }

  public async openDetachedTab(tabId?: string) {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.openDetachedTab(tabId);

    const findTab = this.getTabById(tabId || this.activeTab?._id);
    if (!findTab) {
      return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
    }
    this._detachedTab = clone({
      _id: findTab._id,
      viewUrl: findTab.viewUrl,
      viewName: findTab.viewName,
      viewIcon: findTab.viewIcon,
      viewProps: findTab.viewProps,
      _noCache: findTab._noCache,
      _single: findTab._single,
    });
    await this._hooks.call("tab:detached-opened", clone(this._detachedTab));
    return this._detachedTab;
  }

  public async closeDetachedTab() {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.closeDetachedTab();

    const detachedTab = this._detachedTab ? clone(this._detachedTab) : undefined;
    this._detachedTab = null;
    await this._hooks.call("tab:detached-closed", detachedTab);
  }

  private getIframePostOptions(optionsOrTargetOrigin?: IframePostMessageOptions | string, transfer?: Transferable[]) {
    return typeof optionsOrTargetOrigin === "string"
      ? { targetOrigin: optionsOrTargetOrigin, transfer }
      : optionsOrTargetOrigin || {};
  }

  /**
   * 向指定 iframe 标签页发送消息。适合插件或需要精确指定目标 tab 的场景。
   */
  public postIframeMessage(tabId: string | undefined, data: unknown, options?: IframePostMessageOptions): boolean;
  public postIframeMessage(
    tabId: string | undefined,
    data: unknown,
    targetOrigin?: string,
    transfer?: Transferable[]
  ): boolean;
  public postIframeMessage(
    tabId: string | undefined,
    data: unknown,
    optionsOrTargetOrigin?: IframePostMessageOptions | string,
    transfer?: Transferable[]
  ) {
    if (!tabId) return false;
    const options = this.getIframePostOptions(optionsOrTargetOrigin, transfer);
    return Boolean(this._iframeMessenger?.(tabId, data, options.targetOrigin, options.transfer));
  }

  /**
   * 向当前激活的 iframe 标签页发送消息。布局、工具栏等外部区域通常使用此方法。
   */
  public postActiveIframeMessage(data: unknown, options?: IframePostMessageOptions): boolean;
  public postActiveIframeMessage(data: unknown, targetOrigin?: string, transfer?: Transferable[]): boolean;
  public postActiveIframeMessage(
    data: unknown,
    optionsOrTargetOrigin?: IframePostMessageOptions | string,
    transfer?: Transferable[]
  ) {
    return this.postIframeMessage(
      this.activeTab?._id,
      data,
      this.getIframePostOptions(optionsOrTargetOrigin, transfer)
    );
  }

  private async runChangeActiveTabGuards(toTab: Partial<Tab>, fromTab = this.activeTab) {
    return runActiveTabGuards(this.getActiveRuntime(), toTab, fromTab);
  }

  /**
   * 切换当前激活标签页。
   * @param triggerHook 是否触发全局进入守卫。
   */
  public changeActiveTab(tabId: string, triggerHook: boolean = true) {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.changeActiveTab(tabId, triggerHook);

    return nextTick(async () => {
      return changeActiveTabState(this.getActiveRuntime(), tabId, triggerHook);
    });
  }

  /**
   * 更新 tab 配置。支持传对象或 JSON 字符串。
   */
  public updateTabOptions(options: IUpdateTabOptions | string, tabId?: string) {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.updateTabOptions(options, tabId);

    return nextTick(() => {
      const findTab = tabId ? this.getTabById(tabId) : this.activeTab;
      if (!findTab) return;

      const parsedOptions = jsonToObject(options, {}) as IUpdateTabOptions;
      const { _viewName, _viewIcon, _viewUrl, _viewNoCache, _viewSingle, _viewPinned, _viewNoDrag, ...viewProps } =
        parsedOptions;

      // viewProps 采用浅合并，保证未覆盖字段仍然保留。
      const mergedViewProps = { ...findTab.viewProps, ...viewProps };
      const previousPinned = findTab._pinned;

      Object.assign<Tab, Partial<Tab>>(findTab, {
        viewName: _viewName ?? findTab.viewName,
        viewIcon: _viewIcon ?? findTab.viewIcon,
        viewUrl: _viewUrl ?? findTab.viewUrl,
        viewProps: mergedViewProps,
        _noCache: _viewNoCache ?? findTab._noCache,
        _single: _viewSingle ?? findTab._single,
        _pinned: findTab._isFirst ? findTab._pinned : (_viewPinned ?? findTab._pinned),
        _noDrag: findTab._isFirst ? true : (_viewNoDrag ?? findTab._noDrag),
      });

      if (previousPinned !== findTab._pinned) {
        this.sortPinnedTabs();
      } else {
        this.rebuildTabIndexes();
      }

      this.persistTabs();
      return this._hooks.call("tab:updated", clone(findTab));
    });
  }

  /**
   * 打开新标签页或复用已存在标签页。
   * 若 `options._viewOutside` 为 true，则在新窗口打开链接并返回 `Window`。
   */
  public openTab<Url extends string>(
    viewUrl: Url,
    tabOptions?: IOpenTabOptions & { _viewOutside: true }
  ): Promise<Window | null>;
  public openTab<Url extends string>(
    viewUrl: Url,
    tabOptions?: IOpenTabOptions & { _viewOutside?: false | undefined }
  ): Promise<string>;
  public openTab<Url extends string>(viewUrl: Url, tabOptions?: IOpenTabOptions): Promise<string | Window | null>;
  public openTab<Url extends string>(viewUrl: Url, tabOptions?: IOpenTabOptions) {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.openTab(viewUrl, tabOptions);

    return nextTick(async () => {
      return openTabState(this.getOpenRuntime(), viewUrl, tabOptions);
    });
  }

  /**
   * 关闭标签页。
   * @param options 关闭选项。
   */
  public closeTab(tabId?: string, options: CloseTabOptions = {}) {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.closeTab(tabId, options);

    return nextTick<void>(async () => {
      await closeSingleTab(this.getCloseRuntime(), tabId, options);
    });
  }

  /**
   * 关闭全部标签页（不可关闭标签页除外）
   */
  public closeTabByAll(options: CloseTabsOptions = {}): Promise<void> {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.closeTabByAll(options);

    return nextTick<void>(async () => {
      await this.deferPersist(async () => {
        await closeTabsInBatch(
          this.getCloseRuntime(),
          this._tabs.map(tab => tab._id),
          options
        );
      });
    });
  }

  /**
   * 刷新指定标签页（通过切换 `_isRefresh` 触发重建）。
   */
  public refreshTab(tabId?: string) {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.refreshTab(tabId);

    return nextTick(() => {
      const findTab = this.getTabById(tabId || this.activeTab?._id);
      if (!findTab) {
        return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
      }
      return this._hooks.call("tab:before-refresh", clone(findTab)).then(() => {
        Object.assign<Tab, Partial<Tab>>(findTab, { _isRefresh: true });
        return nextTick(() => {
          Object.assign<Tab, Partial<Tab>>(findTab, { _isRefresh: undefined });
          return this._hooks.call("tab:refreshed", clone(findTab));
        });
      });
    });
  }

  /**
   * 刷新所有标签页
   */
  public refreshTabAll() {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.refreshTabAll();

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
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.emit(eventName, data, tabId);

    const findTab = this.getTabById(tabId || this.activeTab?._id);
    if (findTab && findTab._sourceId) {
      const eventManager = this.events;
      eventManager.emit(`${findTab._sourceId || ""}_${eventName}`, data);
    }
  }

  /**
   * 交换标签页位置
   * @param tabIndex1 标签页索引
   * @param tabIndex2 标签页索引
   */
  public swapTabByIndex(tabIndex1: number, tabIndex2: number) {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.swapTabByIndex(tabIndex1, tabIndex2);

    return nextTick(() => {
      if (swapTabsByIndex(this._tabs, tabIndex1, tabIndex2)) {
        this.rebuildTabIndexes();
        this.persistTabs();
      }
    });
  }

  /**
   * 移动标签页位置。首页和禁止拖拽标签不可移动；置顶标签只能在首页之后、普通标签之前排序。
   */
  public canMoveTab(tabId: string | undefined, targetTabId: string | undefined, position: "before" | "after" = "before") {
    return getMoveTabState(this._tabs, tabId, targetTabId, position) !== undefined;
  }

  public moveTab(tabId: string, targetTabId: string, position: "before" | "after" = "before") {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.moveTab(tabId, targetTabId, position);

    return nextTick(() => {
      const moved = moveTabByOrder(this._tabs, tabId, targetTabId, position);
      if (!moved) return false;
      this.rebuildTabIndexes();
      this.persistTabs();
      return true;
    });
  }

  /**
   * 交换标签页位置
   * @param tabId1 标签页ID
   * @param tabId2 标签页ID
   */
  public swapTabById(tabId1: string, tabId2: string) {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.swapTabById(tabId1, tabId2);

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
  public closeTabsByLeft(tabId?: string, options: CloseTabsOptions = {}): Promise<void> {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.closeTabsByLeft(tabId, options);

    return nextTick<void>(async () => {
      await this.deferPersist(async () => {
        const findTab = this.getTabById(tabId || this.activeTab?._id);
        if (!findTab) {
          return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
        }
        const findTabIndex = this._tabs.indexOf(findTab);
        await this.changeActiveTab(findTab._id);
        await closeTabsInBatch(
          this.getCloseRuntime(),
          this._tabs.slice(0, findTabIndex).map(tab => tab._id),
          options
        );
      });
    });
  }

  /**
   * 关闭右侧所有标签页（不可关闭标签页除外）
   * @param tabId 标签页ID，不填时默认为当前激活的标签页
   */
  public closeTabsByRight(tabId?: string, options: CloseTabsOptions = {}): Promise<void> {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.closeTabsByRight(tabId, options);

    return nextTick<void>(async () => {
      await this.deferPersist(async () => {
        const findTab = this.getTabById(tabId || this.activeTab?._id);
        if (!findTab) {
          return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
        }
        const findTabIndex = this._tabs.indexOf(findTab);
        await this.changeActiveTab(findTab._id);
        await closeTabsInBatch(
          this.getCloseRuntime(),
          this._tabs.slice(findTabIndex + 1).map(tab => tab._id),
          options
        );
      });
    });
  }

  /**
   * 关闭除开所有标签页（不可关闭标签页除外）
   * @param tabId 标签页ID，不填时默认为当前激活的标签页
   */
  public closeTabsByOther(tabId?: string, options: CloseTabsOptions = {}): Promise<void> {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.closeTabsByOther(tabId, options);

    return nextTick<void>(async () => {
      await this.deferPersist(async () => {
        const findTab = this.getTabById(tabId || this.activeTab?._id);
        if (!findTab) {
          return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
        }
        await this.changeActiveTab(findTab._id);
        await closeTabsInBatch(
          this.getCloseRuntime(),
          this._tabs.filter(tab => tab._id !== findTab._id).map(tab => tab._id),
          options
        );
      });
    });
  }

  /**
   * 清空标签（退出系统时调用）
   */
  public async clear() {
    const stateManager = this.getStateManager();
    if (stateManager !== this) return stateManager.clear();

    this._tabs = [];
    this.rebuildTabIndexes();
    this._activeTabId = undefined;
    this._activeTab = undefined;
    this._refreshAllTabFlag = false;
    this.clearPersistedTabs();
    this.events.clear();
    await this._hooks.call("tabs:cleared");
  }

  private destroy() {
    this.disposePlugins();
    this._iframeMessenger = undefined;
    this._app = null;
    this._reactiveManager = null;
  }

  public install(app: App) {
    this._app = markRaw(app);
    this.sharedContext.bindApp(this._app);
    this._reactiveManager = provideTabsManager(this._app, this);
    const mountApp = app.mount;
    app.mount = (...args) => {
      this.sharedContext.registerModules();
      this.setupPlugins();
      // todo 这里应该将标签页列表遍历一遍提取参数缓存进内存中
      return mountApp(...args);
    };
    const unmountApp = app.unmount;
    app.unmount = (...args) => {
      this.destroy();
      return unmountApp(...args);
    };
  }
}
