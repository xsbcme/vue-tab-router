import { App, defineAsyncComponent, nextTick, createVNode, defineComponent, toRaw } from "vue";
import { Plugin } from './base/plugin';
import { Tab } from "./tab";
import { IOpenTabOptions, ITabsManagerOptions, IUpdateTabOptions, Modules, TabGuard, TabGuardName } from "./types";
import { isHttpUrl, jsonToObject, createRandomString, clone, findParentPathsByPath } from "./utils";
import { PEALTIVE_VIEW_URL_PREFIX_KEY, STORAGE_TABS_KEY } from "./constant";
import { useEventManager } from "./use-event-manager";
import { StorageAdapter } from "./storage-adapter";

export class TabsManager extends Plugin {
    private static _instance: TabsManager | null = null;
    private _options: ITabsManagerOptions | null = null;
    private _app: App | null = null;
    private _tabs: Tab[] = [];
    private _refreshAllTabFlag: boolean = false;

    get app() {
        return this._app;
    }

    get options() {
        return this._options;
    }

    get storage() {
        let storageAdapter = this._options?.storageAdapter;
        if (!storageAdapter) {
            storageAdapter = new StorageAdapter();
        }
        return storageAdapter;
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
        this.storage && (this._tabs = this.storage.get(STORAGE_TABS_KEY, []).map(item => new Tab(item)));
        return this;
    }

    private registerModules() {
        const { modules: rawModules, source } = this._options || {};
        const transformModules = (modules: Modules) => {
            return Object.keys(modules).reduce((pre, cur) => {
                const module = modules[cur];
                pre[cur] = typeof module === 'function' ? module : Reflect.get(module, 'default');
                return pre;
            }, {} as Modules);
        }
        const modules = transformModules(rawModules || {});
        const loadingComponent = defineComponent({
            setup() {
                return () => createVNode('div', null, '加载中...');
            }
        });
        const errorComponent = defineComponent({
            setup() {
                return () => createVNode('div', null, '出错了!');
            }
        });
        Object.keys(modules).forEach(viewId => {
            if (!this._app) return;
            if (this.getAppComponentByName(viewId)) return;
            let component = modules[viewId];
            if (typeof component === 'function') {
                component = defineAsyncComponent<Object>({
                    loadingComponent,
                    errorComponent,
                    delay: 500,
                    ...source,
                    loader: component
                });
            }
            this._app.component(viewId, component);
        });
    }

    // /**
    //  * 预加载组件 - 加载完成后自动会调用组件与自定义钩子关联
    //  * todo 期望能直接读取到注册的函数
    //  * @param tab 预加载标签页
    //  */
    // private preloadLoadComponent(tab: Tab) {
    //     return new Promise<void>((resolve) => {
    //         const component = this.getAppComponentByName(tab.viewUrl);
    //         if (!component) return Promise.reject(new Error(`组件不存在[${tab.viewUrl}]`));
    //         const containerEl = document.createDocumentFragment();
    //         const getActiveTab = computed(() => this.activeTab);
    //         const wrapperComponent = defineComponent({
    //             setup() {
    //                 provide(INJECT_ACTIVE_TAB_KEY, getActiveTab);
    //                 provide(INJECT_CURRENT_TAB_KEY, tab);
    //                 // return () => createVNode(Suspense, {
    //                 //     onFallback: (error: any) => {
    //                 //         reject(error);
    //                 //     }
    //                 // }, () => createVNode({ ...component }, {
    //                 //     onVnodeMounted() {
    //                 //         resolve();
    //                 //     }
    //                 // }));
    //                 return () => createVNode({ ...component }, {
    //                     onVnodeMounted() {
    //                         resolve();
    //                     }
    //                 });
    //             }
    //         });
    //         const runContainer = createApp(wrapperComponent);
    //         runContainer.mount(containerEl as unknown as Element);
    //     });
    // }

    /**
     * 根据标签页ID获取标签
     * @param tabId 标签页id
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
        return url?.startsWith(PEALTIVE_VIEW_URL_PREFIX_KEY) || isHttpUrl(url);
    }

    private getHttpUrl(url: string) {
        if (this.isUrl(url)) {
            if (url.startsWith(PEALTIVE_VIEW_URL_PREFIX_KEY) || isHttpUrl(url)) {
                let newUrl = '';
                if (url.startsWith(PEALTIVE_VIEW_URL_PREFIX_KEY)) {
                    newUrl = url.replace(PEALTIVE_VIEW_URL_PREFIX_KEY, '');
                } else {
                    newUrl = url;
                }
                return newUrl;
            }
        }
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
                return Promise.reject(new Error(`标签页不存在[${tabId || ''}]`));
            }
            Object.assign<Tab, Partial<Tab>>(findTab, { _noClose: noAllow });
            this.storage?.set(STORAGE_TABS_KEY, toRaw(this._tabs));
        });
    }

    private setFirstTab(tabId?: string) {
        return nextTick<void>(async () => {
            const findIndex = this._tabs.findIndex(tab => tab._id === tabId || this.activeTab?._id);
            if (findIndex < 0) {
                return Promise.reject(new Error(`标签页不存在[${tabId || ''}]`));
            }
            this._tabs.forEach(tab => tab._isFirst = undefined);
            this._tabs[findIndex]._isFirst = true;
            if (findIndex > 1) {
                this._tabs.unshift(this._tabs.splice(findIndex, 1)[0]);
            }
            this.storage?.set(STORAGE_TABS_KEY, toRaw(this._tabs));
        });
    }

    public _registerTabGuard(tabId: string, guardName: TabGuardName, guard: TabGuard) {
        const findTab = this.getTabById(tabId);
        if (!findTab) return;
        Reflect.set(findTab, guardName, guard);
    }

    /**
     * 改变激活标签页
     * @param tabId 标签页id
     * @param triggerHook 是否触发钩子
     */
    public changeActiveTab(tabId: string, triggerHook: boolean = true) {
        return nextTick(async () => {
            if (tabId === this.activeTab?._id) return tabId;
            const findTab = this.getTabById(tabId);
            if (!findTab) return Promise.reject(new Error(`标签页不存在[${tabId}]`));

            // // 如果目标组件还在加载中不允许激活
            // if (findTab._loading) return Promise.reject(new Error(`组件还在加载中[${tabId}]`));

            // if (triggerHook && !this.isHttpUrl(findTab.viewUrl)) {
            //     await this.preloadLoadComponent(findTab);
            //     await nextTick(async () => {
            //         await this.updateTabLoaing(findTab._id, async () => {
            //             try {
            //                 typeof findTab._onBeforeTabEnter === 'function' && await findTab._onBeforeTabEnter();
            //             } catch (error) {
            //                 return Promise.reject(error);
            //             }
            //         });
            //     });
            // }

            if (triggerHook) {
                try {
                    const onBeforeTabEnter = this._options?.onBeforeTabEnter;
                    typeof onBeforeTabEnter === 'function' && await onBeforeTabEnter(
                        clone(findTab),
                        clone(this.getTabById(findTab._sourceId)));
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
     * 激活第一个标签页
     */
    public activeFristTab() {
        return nextTick(async () => {
            const findTab = this._tabs.find(tab => tab._isFirst);
            if (findTab) {
                await this.changeActiveTab(findTab._id);
            }
        });
    }

    /**
     * 更新标签页参数
     * @param options 标签页参数
     * @param tabId 标签页ID
     */
    public updateTabOptions(options: IUpdateTabOptions | string, tabId?: string) {
        return nextTick(() => {
            const findTab = tabId ? this.getTabById(tabId) : this.activeTab;
            if (!findTab) return;
            const {
                _viewName,
                _viewIcon,
                _viewUrl,
                _viewNoCahce,
                _viewSingle,
                ...viewProps
            } = jsonToObject(options, {}) as IUpdateTabOptions;

            Object.assign<Tab, Partial<Tab>>(findTab, {
                viewName: _viewName ?? findTab.viewName,
                viewIcon: _viewIcon ?? findTab.viewIcon,
                viewUrl: _viewUrl ?? findTab.viewUrl,
                viewProps: Object.keys(viewProps).length > 0 ? viewProps : findTab.viewProps,
                _noCahce: _viewNoCahce ?? findTab._noCahce,
                _single: _viewSingle ?? findTab._single,
            });

            this.storage?.set(STORAGE_TABS_KEY, toRaw(this._tabs));

        });
    }

    // /**
    //  * 将指定标签页设置为加载状态，回调执行完后自动取消加载状态
    //  * @param tabId 标签页ID
    //  * @param taskCallbak 执行回调
    //  */
    // public updateTabLoaing(tabId: string, taskCallbak: () => Promise<void>) {
    //     const findTab = this.getTabById(tabId);
    //     if (findTab) {
    //         Object.assign<Tab, Partial<Tab>>(findTab, { _loading: true });
    //         return taskCallbak().finally(() => {
    //             Object.assign<Tab, Partial<Tab>>(findTab, { _loading: undefined });
    //         });
    //     }
    // }

    /**
     * 打开标签页
     * @param viewUrl 路由地址
     * @param tabOptions 打开标签页参数
     */
    public openTab<Url extends string>(viewUrl: Url, tabOptions?: IOpenTabOptions): Promise<string>;
    public openTab<Url extends string>(viewUrl: Url, tabOptions?: IOpenTabOptions & { _viewOutside: true }): Promise<Window>;
    public openTab<Url extends string>(viewUrl: Url, tabOptions?: IOpenTabOptions) {
        return nextTick(async () => {
            const {
                _viewOutside,
                _viewOutsideProps,
                _viewName,
                _viewIcon,
                _viewNoCahce,
                _viewSingle,
                ...viewProps
            } = jsonToObject(tabOptions || {}, {}) as IOpenTabOptions;

            // 判断是否为链接
            if (this.isUrl(viewUrl)) {
                const newViewUrl = this.getHttpUrl(viewUrl);
                if (_viewOutside) {
                    const { target, features } = _viewOutsideProps || {};
                    return window.open(newViewUrl, target, features);
                }
            } else if (!this.getAppComponentByName(viewUrl)) {
                return Promise.reject(new Error(`视图未注册[${viewUrl}]`));
            }

            // 初始化新tab页
            const newTab = new Tab({
                viewUrl,
                viewName: _viewName,
                viewIcon: _viewIcon,
                viewProps,

                _sourceId: this.activeTab?._id,
                _noCahce: _viewNoCahce,
                _single: _viewSingle,
                _id: createRandomString(),
            });
            // 如果标签页存在相同url和参数的，则直接复用
            const findTabByProps = this.getTabByViewUrlAndProps(newTab.viewUrl, newTab.viewProps);
            if (findTabByProps) {
                newTab._id = findTabByProps._id;
            }

            // 检查当前Tab页是否可以离开
            if (newTab._id !== this.activeTab?._id) {
                typeof this.activeTab?._onBeforeTabLeave === 'function' && await this.activeTab._onBeforeTabLeave(
                    clone(newTab),
                    clone(this.getTabById(newTab._sourceId))
                );
            }

            if (findTabByProps) {
                return await this.changeActiveTab(findTabByProps._id);
            }

            // 如果路径都不存在|存在且是多例，则直接添加
            const findTabByViewUrl = this.getTabByViewUrl(viewUrl);
            if (!findTabByViewUrl || (findTabByViewUrl && !newTab._single)) {

                const onBeforeTabOpen = this._options?.onBeforeTabOpen;
                typeof onBeforeTabOpen === 'function' && await onBeforeTabOpen(
                    clone(newTab),
                    clone(this.getTabById(newTab._sourceId))
                );

                this._tabs.push(newTab);

                // if (!this.isHttpUrl(newTab.viewUrl)) {
                //     await this.preloadLoadComponent(newTab);
                //     await nextTick(async () => {
                //         await this.updateTabLoaing(newTab._id, async () => {
                //             try {
                //                 typeof newTab._onBeforeTabOpen === 'function' && await newTab._onBeforeTabOpen();
                //             } catch (error) {
                //                 await this.closeTab(newTab._id);
                //                 return Promise.reject(error);
                //             }
                //             try {
                //                 typeof newTab._onBeforeTabEnter === 'function' && await newTab._onBeforeTabEnter();
                //             } catch (error) {
                //                 if (newTab._sourceId) {
                //                     // await this.changeActiveTab(newTab._sourceId, false);
                //                     return Promise.reject(error);
                //                 } else {
                //                     await this.closeTab(newTab._id);
                //                 }
                //                 return Promise.reject(error);
                //             }
                //         });
                //     });
                // }

                return await this.changeActiveTab(newTab._id, false);
            }

            const findTab = this.getTabById(findTabByViewUrl._id);
            if (findTab) {
                Object.assign<Tab, Partial<Tab>>(findTab,
                    Object.assign<Tab, Partial<Tab>>(newTab,
                        { _id: findTab._id, _sourceId: findTab._sourceId }
                    )
                );
            }
            await this.refreshTab(newTab._id);
            return await this.changeActiveTab(newTab._id);

        });
    }

    /**
     * 将指定路由地址的标签页置为为第一个不可关闭（重复使用将会覆盖）
     * @param viewUrl 路由地址
     * @param tabOptions 打开标签页参数
     */
    public async openFristTab<Url extends string>(viewUrl: Url, tabOptions?: Omit<IOpenTabOptions, '_viewOutside' | '_viewOutsideProps'>) {
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

    /**
     * 关闭当前tab时需断链拼接
     * @param sourceId 当前tab的Id
     * @param newSourceId 将指向当前tab的Id更新为当前tab的上级Id
     */
    private setTabsSourceIdById(id: string, newId: string | undefined) {
        return this._tabs
            .filter(item => item._sourceId == id) // 找到指向当前tabId数组
            .forEach(item => item._sourceId = newId); // 指向新的tabId
    }

    /**
     * 关闭标签页
     * @param tabId 标签页ID，不填时默认为当前激活的标签页（不可关闭标签页除外）
     */
    public closeTab(tabId?: string) {
        return nextTick<void>(async () => {
            const findTab = this.getTabById(tabId || this.activeTab?._id);
            if (!findTab) {
                return Promise.reject(new Error(`标签页不存在[${tabId || ''}]`));
            }
            const findTabIndex = this._tabs.indexOf(findTab);
            if (findTabIndex >= 0) {
                if (findTab._noClose) {
                    return;
                }

                typeof findTab._onBeforeTabLeave === 'function' && await findTab._onBeforeTabLeave(
                    clone(this.getTabById(findTab._sourceId)),
                    clone(findTab));

                typeof findTab._onBeforeTabClose === 'function' && await findTab._onBeforeTabClose(
                    clone(this.getTabById(findTab._sourceId)),
                    clone(findTab));

                const eventManager = useEventManager();
                eventManager.eventNames.forEach((eventName: string) => {
                    if (eventName.startsWith(findTab._id)) {
                        eventManager.off(eventName);
                    }
                });

                if (this.activeTab?._id === findTab._id) {
                    const parentTab = this.getTabById(findTab._sourceId);
                    parentTab && await this.changeActiveTab(parentTab._id);
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
     * 刷新标签页
     * @param tabId 标签页ID，不填时默认为当前激活的标签页
     */
    public refreshTab(tabId?: string) {
        return nextTick(() => {
            const findTab = this.getTabById(tabId || this.activeTab?._id);
            if (!findTab) {
                return Promise.reject(new Error(`标签页不存在[${tabId || ''}]`));
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
     * 当父标签页设置事件后，调用此方法向父标签页发送数据
     * @param eventName 事件名称
     * @param data 传输数据
     * @param tabId 标签页ID，不填时默认为当前激活的标签页
     */
    public emit(eventName: string, data?: unknown, tabId?: string) {
        const findTab = this.getTabById(tabId || this.activeTab?._id);
        if (findTab && findTab._sourceId) {
            const eventManager = useEventManager();
            eventManager.emit(`${findTab._sourceId || ''}_${eventName}`, data);
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
            const findTab1Index = this._tabs.findIndex(tab => tab._id = tabId1);
            const findTab2Index = this._tabs.findIndex(tab => tab._id = tabId2);
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
                return Promise.reject(new Error(`标签页不存在[${tabId || ''}]`));
            }
            const tabs = clone(this._tabs);
            const findTabIndex = this._tabs.indexOf(findTab);
            for (let index = 0; index < findTabIndex; index++) {
                await this.closeTab(tabs[index]._id);
            }
            const { viewUrl, viewProps } = tabs[findTabIndex];
            await this.openTab(viewUrl, viewProps);
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
                return Promise.reject(new Error(`标签页不存在[${tabId || ''}]`));
            }
            const tabs = clone(this._tabs);
            const findTabIndex = this._tabs.indexOf(findTab);
            for (let index = findTabIndex + 1; index < tabs.length; index++) {
                await this.closeTab(tabs[index]._id);
            }
            const { viewUrl, viewProps } = tabs[findTabIndex];
            await this.openTab(viewUrl, viewProps);
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
                return Promise.reject(new Error(`标签页不存在[${tabId || ''}]`));
            }
            const tabs = clone(this._tabs);
            const findTabIndex = this._tabs.indexOf(findTab);
            for (let index = 0; index < tabs.length; index++) {
                if (tabs[index]._id !== tabs[findTabIndex]._id) {
                    await this.closeTab(tabs[index]._id);
                }
            }
            const { viewUrl, viewProps } = tabs[findTabIndex];
            await this.openTab(viewUrl, viewProps);
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
        this.destroy();
    }

    public install(app: App) {
        this._app = app;
        const mountApp = app.mount;
        app.mount = (...args) => {
            this.registerModules();
            // todo 这里应该将标签页列表遍历一遍提取参数缓存进内存中
            return mountApp(...args);
        }
        const unmountApp = app.unmount;
        app.unmount = (...args) => {
            this.destroy();
            return unmountApp(...args);
        }
        super.loadPlugin();
        app.config.globalProperties.$tabsManager = this;
    }

}