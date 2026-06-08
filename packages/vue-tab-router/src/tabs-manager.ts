import { App, markRaw, nextTick, toRaw } from "vue";
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
import { jsonToObject, createRandomString, clone, findParentPathsByPath, stableStringify, TabViewUrl } from "./utils";
import { STORAGE_TABS_KEY } from "./constant";
import { AbstractStorageAdapter } from "./abstract-storage-adapter";
import { StorageAdapter } from "./storage-adapter";
import { runTabGuard } from "./tab-guard";
import { TabsManagerHooks, TabsManagerPluginCleanup } from "./tabs-manager-plugin";
import { EventManager } from "./event-manager";
import { provideTabsManager, TabsSharedContext } from "./tabs-manager-context";

export class TabsManager {
  private _options: ITabsManagerOptions;
  private _app: App | null = null;
  private _tabs: Tab[] = [];
  private _detachedTab: Partial<Tab> | null = null;
  private _refreshAllTabFlag: boolean = false;
  private _storageAdapter: AbstractStorageAdapter | null = null;
  private _storageKey: string = STORAGE_TABS_KEY;
  private _storageEnabled = true;
  private _hooks = new TabsManagerHooks();
  private _pluginCleanups: TabsManagerPluginCleanup[] = [];
  private _pluginsLoaded = false;
  private _reactiveManager: TabsManager | null = null;
  private _persistSuspendCount = 0;
  private _persistPending = false;
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
    this._storageEnabled = options.storageEnabled !== false;
    this._storageKey = options.storageKey || STORAGE_TABS_KEY;
    this._storageAdapter = this._storageEnabled ? (options.storageAdapter ?? new StorageAdapter()) : null;
    this._tabs = this.restoreTabs();
  }

  private readonly sharedContext: TabsSharedContext;

  get app() {
    return this._app;
  }

  get options() {
    return this._options;
  }

  get storage() {
    return this._storageAdapter;
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
    return this._tabs.find(item => item._isActive);
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
    return this.storage?.get<Partial<Tab>[]>(this._storageKey, []).map(item => new Tab(item)) || [];
  }

  private persistTabs() {
    if (this._persistSuspendCount > 0) {
      this._persistPending = true;
      return;
    }
    this.storage?.set(this._storageKey, toRaw(this._tabs));
  }

  private async deferPersist<T>(runner: () => Promise<T>) {
    this._persistSuspendCount++;
    try {
      return await runner();
    } finally {
      this._persistSuspendCount--;
      if (this._persistSuspendCount === 0 && this._persistPending) {
        this._persistPending = false;
        this.persistTabs();
      }
    }
  }

  private clearPersistedTabs() {
    this.storage?.del(this._storageKey);
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
    return this.sharedContext.resolveComponent(name);
  }

  public resolveComponent(name: string) {
    return this.sharedContext.resolveComponent(name);
  }

  private isUrl(url: string) {
    return TabViewUrl.isIframe(url);
  }

  private getTabByViewUrlAndProps(viewUrl: string, props: Record<string, unknown> | undefined) {
    const filterTabsByComponent = this._tabs.filter(tab => tab.viewUrl === viewUrl);
    return filterTabsByComponent.find(tab => {
      return stableStringify(tab.viewProps) === stableStringify(props);
    });
  }

  private insertTab(tab: Tab) {
    if (!tab._pinned) {
      this._tabs.push(tab);
      return;
    }
    const firstNormalIndex = this._tabs.findIndex(item => !item._isFirst && !item._pinned);
    if (firstNormalIndex >= 0) {
      this._tabs.splice(firstNormalIndex, 0, tab);
      return;
    }
    this._tabs.push(tab);
  }

  private sortPinnedTabs() {
    const firstTabs = this._tabs.filter(tab => tab._isFirst);
    const pinnedTabs = this._tabs.filter(tab => !tab._isFirst && tab._pinned);
    const normalTabs = this._tabs.filter(tab => !tab._isFirst && !tab._pinned);
    this._tabs = [...firstTabs, ...pinnedTabs, ...normalTabs];
  }

  private setTabNoAllowClose(noAllow: boolean = true, tabId?: string) {
    return nextTick<void>(() => {
      const findTab = this.getTabById(tabId || this.activeTab?._id);
      if (!findTab) {
        return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
      }
      Object.assign<Tab, Partial<Tab>>(findTab, { _noClose: noAllow });
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
      }
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

  public async openDetachedTab(tabId?: string) {
    const findTab = this.getTabById(tabId || this.activeTab?._id);
    if (!findTab) {
      return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
    }
    this._detachedTab = clone({
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
    if (fromTab) {
      await runTabGuard(this._options?.onBeforeTabLeave, clone(toTab), clone(fromTab));
      await runTabGuard(fromTab._onBeforeTabLeave, clone(toTab), clone(fromTab));
    }
    await runTabGuard(this._options?.onBeforeTabEnter, clone(toTab), clone(fromTab));
    await runTabGuard(toTab._onBeforeTabEnter, clone(toTab), clone(fromTab));
    await this._hooks.call("tab:before-active-change", clone(toTab), clone(fromTab));
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
      const fromTab = this.activeTab;

      if (triggerHook) {
        try {
          await this.runChangeActiveTabGuards(findTab, fromTab);
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
      this.persistTabs();
      await this._hooks.call("tab:active-changed", clone(findTab), clone(fromTab));

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
    return nextTick(async () => {
      const viewMeta = this.getViewMeta(viewUrl);
      const normalizedOptions = {
        ...(viewMeta?.props || {}),
        _viewName: viewMeta?.props?._viewName ?? viewMeta?.title,
        _viewIcon: viewMeta?.props?._viewIcon ?? viewMeta?.icon,
        ...jsonToObject(tabOptions || {}, {}),
      } as IOpenTabOptions;
      const {
        _viewOutside,
        _viewOutsideProps,
        _viewName,
        _viewIcon,
        _viewNoCache,
        _viewSingle,
        _viewPinned,
        _viewNoDrag,
        ...viewProps
      } = normalizedOptions;

      // 链接型地址（http/https 或 TabViewUrl.createRelative 创建的相对地址）
      if (this.isUrl(viewUrl)) {
        const newViewUrl = TabViewUrl.resolveIframe(viewUrl);
        if (_viewOutside) {
          if (typeof window === "undefined") return null;
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
        _pinned: _viewPinned,
        _noDrag: _viewNoDrag,
        _single: _viewSingle,
        _id: createRandomString(),
      });
      // 同一 viewUrl + viewProps 则复用
      const findTabByProps = this.getTabByViewUrlAndProps(newTab.viewUrl, newTab.viewProps);
      if (findTabByProps) {
        newTab._id = findTabByProps._id;
      }

      // 离开当前 tab 前先执行页面级离开守卫
      if (findTabByProps) {
        return await this.changeActiveTab(findTabByProps._id);
      }

      // 不存在同路径 tab，或目标是多例模式时，新增 tab
      const findTabByViewUrl = this.getTabByViewUrl(viewUrl);
      if (!findTabByViewUrl || (findTabByViewUrl && !newTab._single)) {
        const sourceTab = this.getTabById(newTab._sourceId);
        await runTabGuard(this._options?.onBeforeTabOpen, clone(newTab), clone(sourceTab));
        await this._hooks.call("tab:before-open", clone(newTab), clone(sourceTab));
        await this.runChangeActiveTabGuards(newTab);

        this.insertTab(newTab);

        const tabId = await this.changeActiveTab(newTab._id, false);
        await this._hooks.call("tab:opened", clone(newTab), clone(sourceTab));
        return tabId;
      }

      const findTab = this.getTabById(findTabByViewUrl._id);
      if (findTab) {
        const nextTab = new Tab({
          ...findTab,
          viewUrl: newTab.viewUrl,
          viewName: newTab.viewName,
          viewIcon: newTab.viewIcon,
          viewProps: newTab.viewProps,
          _noCache: newTab._noCache,
          _pinned: newTab._pinned,
          _noDrag: newTab._noDrag,
          _single: newTab._single,
        });
        if (findTab._id !== this.activeTab?._id) {
          await this.runChangeActiveTabGuards(nextTab);
        }
        Object.assign<Tab, Partial<Tab>>(findTab, {
          viewUrl: nextTab.viewUrl,
          viewName: nextTab.viewName,
          viewIcon: nextTab.viewIcon,
          viewProps: nextTab.viewProps,
          _noCache: nextTab._noCache,
          _pinned: nextTab._pinned,
          _noDrag: nextTab._noDrag,
          _single: nextTab._single,
        });
      }
      await this.refreshTab(findTabByViewUrl._id);
      return await this.changeActiveTab(findTabByViewUrl._id, false);
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
   * @param options 关闭选项。
   */
  public closeTab(tabId?: string, options: CloseTabOptions = {}) {
    return nextTick<void>(async () => {
      const findTab = this.getTabById(tabId || this.activeTab?._id);
      if (!findTab) {
        return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
      }
      const findTabIndex = this._tabs.indexOf(findTab);
      if (findTabIndex >= 0) {
        if (!options.ignoreNoClose && findTab._noClose) {
          return;
        }

        if (!options.skipGuard) {
          try {
            const sourceTab = this.getTabById(findTab._sourceId);
            await runTabGuard(findTab._onBeforeTabClose, clone(findTab), clone(sourceTab));
            await runTabGuard(this._options?.onBeforeTabClose, clone(findTab), clone(sourceTab));
            await this._hooks.call("tab:before-close", clone(findTab), clone(sourceTab));
          } catch (error) {
            return Promise.reject(error);
          }
        }

        const eventManager = this.events;
        const eventPrefix = `${findTab._id}_`;
        eventManager.eventNames.forEach((eventName: string) => {
          if (eventName.startsWith(eventPrefix)) {
            eventManager.off(eventName);
          }
        });

        const shouldActivateFallback = this.activeTab?._id === findTab._id;
        const parentTab = this.getTabById(findTab._sourceId);
        const fallbackTab = parentTab || this._tabs[findTabIndex - 1] || this._tabs[findTabIndex + 1];
        if (!options.skipGuard && shouldActivateFallback && fallbackTab) {
          try {
            await this.runChangeActiveTabGuards(fallbackTab, findTab);
          } catch (error) {
            return Promise.reject(error);
          }
        }
        this._tabs.splice(findTabIndex, 1);
        this.setTabsSourceIdById(findTab._id, findTab._sourceId);
        if (shouldActivateFallback) {
          this._tabs.forEach(item => {
            Object.assign<Tab, Partial<Tab>>(item, {
              _isActive: fallbackTab && item._id === fallbackTab._id ? true : undefined,
            });
          });
        }

        this.persistTabs();
        await this._hooks.call("tab:closed", clone(findTab), clone(fallbackTab));
      }
    });
  }

  /**
   * 关闭全部标签页（不可关闭标签页除外）
   */
  public closeTabByAll(options: CloseTabsOptions = {}): Promise<void> {
    return nextTick<void>(async () => {
      await this.deferPersist(async () => {
        const tabs = clone(this._tabs);
        for (let index = 0; index < tabs.length; index++) {
          try {
            await this.closeTab(tabs[index]._id, options);
          } catch (error) {
            if (!options.continueOnRejected) return Promise.reject(error);
          }
        }
      });
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
    return nextTick(() => {
      if (tabIndex1 >= 0 && tabIndex2 >= 0) {
        const temp = this._tabs[tabIndex1];
        this._tabs[tabIndex1] = this._tabs[tabIndex2];
        this._tabs[tabIndex2] = temp;
        this.persistTabs();
      }
    });
  }

  /**
   * 移动标签页位置。首页和禁止拖拽标签不可移动；置顶标签只能在首页之后、普通标签之前排序。
   */
  public moveTab(tabId: string, targetTabId: string, position: "before" | "after" = "before") {
    return nextTick(() => {
      if (tabId === targetTabId) return false;
      const movingIndex = this._tabs.findIndex(tab => tab._id === tabId);
      const targetIndex = this._tabs.findIndex(tab => tab._id === targetTabId);
      if (movingIndex < 0 || targetIndex < 0) return false;

      const movingTab = this._tabs[movingIndex];
      const targetTab = this._tabs[targetIndex];
      if (movingTab._isFirst || movingTab._noDrag || targetTab._isFirst || targetTab._noDrag) return false;
      if (Boolean(movingTab._pinned) !== Boolean(targetTab._pinned)) return false;

      this._tabs.splice(movingIndex, 1);
      const nextTargetIndex = this._tabs.findIndex(tab => tab._id === targetTabId);
      const insertIndex = position === "after" ? nextTargetIndex + 1 : nextTargetIndex;
      this._tabs.splice(insertIndex, 0, movingTab);
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
    return nextTick<void>(async () => {
      await this.deferPersist(async () => {
        const findTab = this.getTabById(tabId || this.activeTab?._id);
        if (!findTab) {
          return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
        }
        const tabs = clone(this._tabs);
        const findTabIndex = this._tabs.indexOf(findTab);
        await this.changeActiveTab(findTab._id);
        for (let index = 0; index < findTabIndex; index++) {
          try {
            await this.closeTab(tabs[index]._id, options);
          } catch (error) {
            if (!options.continueOnRejected) return Promise.reject(error);
          }
        }
      });
    });
  }

  /**
   * 关闭右侧所有标签页（不可关闭标签页除外）
   * @param tabId 标签页ID，不填时默认为当前激活的标签页
   */
  public closeTabsByRight(tabId?: string, options: CloseTabsOptions = {}): Promise<void> {
    return nextTick<void>(async () => {
      await this.deferPersist(async () => {
        const findTab = this.getTabById(tabId || this.activeTab?._id);
        if (!findTab) {
          return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
        }
        const tabs = clone(this._tabs);
        const findTabIndex = this._tabs.indexOf(findTab);
        await this.changeActiveTab(findTab._id);
        for (let index = findTabIndex + 1; index < tabs.length; index++) {
          try {
            await this.closeTab(tabs[index]._id, options);
          } catch (error) {
            if (!options.continueOnRejected) return Promise.reject(error);
          }
        }
      });
    });
  }

  /**
   * 关闭除开所有标签页（不可关闭标签页除外）
   * @param tabId 标签页ID，不填时默认为当前激活的标签页
   */
  public closeTabsByOther(tabId?: string, options: CloseTabsOptions = {}): Promise<void> {
    return nextTick<void>(async () => {
      await this.deferPersist(async () => {
        const findTab = this.getTabById(tabId || this.activeTab?._id);
        if (!findTab) {
          return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
        }
        const tabs = clone(this._tabs);
        const findTabIndex = this._tabs.indexOf(findTab);
        await this.changeActiveTab(findTab._id);
        for (let index = 0; index < tabs.length; index++) {
          if (tabs[index]._id !== tabs[findTabIndex]._id) {
            try {
              await this.closeTab(tabs[index]._id, options);
            } catch (error) {
              if (!options.continueOnRejected) return Promise.reject(error);
            }
          }
        }
      });
    });
  }

  /**
   * 清空标签（退出系统时调用）
   */
  public async clear() {
    this._tabs = [];
    this._refreshAllTabFlag = false;
    this._persistPending = false;
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
