import { Tab } from "./tab";
import { runTabGuard } from "./tab-guard";
import { TabsManagerHooks } from "./tabs-manager-plugin";
import type { IOpenTabOptions, ITabsManagerOptions } from "../types";
import { clone, createRandomString, jsonToObject, stableStringify, TabViewUrl } from "../shared";

export interface TabOpenRuntime {
  readonly activeTab: Tab | undefined;
  readonly options: ITabsManagerOptions;
  readonly hooks: TabsManagerHooks;
  getViewMeta(viewUrl: string | undefined): { title?: string; icon?: string; props?: Record<string, unknown> } | undefined;
  getTabById(tabId: string | undefined): Tab | undefined;
  getTabByViewUrl(viewUrl: string): Tab | undefined;
  resolveComponent(name: string): unknown;
  insertTab(tab: Tab): void;
  runChangeActiveTabGuards(toTab: Partial<Tab>, fromTab?: Tab): Promise<void>;
  changeActiveTab(tabId: string, triggerHook?: boolean): Promise<string>;
  refreshTab(tabId?: string): Promise<unknown>;
}

function getTabByViewUrlAndProps(
  tabs: Tab[],
  viewUrl: string,
  props: Record<string, unknown> | undefined
) {
  const propsKey = stableStringify(props);
  return tabs.find(tab => tab.viewUrl === viewUrl && stableStringify(tab.viewProps) === propsKey);
}

export async function openTab<Url extends string>(
  runtime: TabOpenRuntime & { readonly tabs: Tab[] },
  viewUrl: Url,
  tabOptions?: IOpenTabOptions
) {
  const viewMeta = runtime.getViewMeta(viewUrl);
  const normalizedOptions = {
    ...(viewMeta?.props || {}),
    _viewName: viewMeta?.props?._viewName ?? viewMeta?.title,
    _viewIcon: viewMeta?.props?._viewIcon ?? viewMeta?.icon,
    ...jsonToObject(tabOptions || {}, {}),
  } as IOpenTabOptions;
  const {
    _viewOutside,
    _viewName,
    _viewIcon,
    _viewNoCache,
    _viewSingle,
    _viewPinned,
    _viewNoDrag,
    ...viewProps
  } = normalizedOptions;

  if (TabViewUrl.isIframeController(viewUrl)) {
    const controllerUrl = TabViewUrl.resolveIframeController(viewUrl).controllerUrl;
    if (!runtime.resolveComponent(controllerUrl)) {
      return Promise.reject(new Error(`视图未注册[${controllerUrl}]`));
    }
  }

  if (TabViewUrl.isIframe(viewUrl)) {
    const newViewUrl = TabViewUrl.resolveIframe(viewUrl);
    if (_viewOutside) {
      if (typeof window === "undefined") return null;
      const { target, features } = typeof _viewOutside === "object" ? _viewOutside : {};
      return window.open(newViewUrl, target, features);
    }
  } else if (!runtime.resolveComponent(viewUrl)) {
    return Promise.reject(new Error(`视图未注册[${viewUrl}]`));
  }

  const newTab = new Tab({
    viewUrl,
    viewName: _viewName,
    viewIcon: _viewIcon,
    viewProps,

    _sourceId: runtime.activeTab?._id,
    _noCache: _viewNoCache,
    _pinned: _viewPinned,
    _noDrag: _viewNoDrag,
    _single: _viewSingle,
    _id: createRandomString(),
  });

  const findTabByProps = getTabByViewUrlAndProps(runtime.tabs, newTab.viewUrl, newTab.viewProps);
  if (findTabByProps) {
    newTab._id = findTabByProps._id;
  }

  if (findTabByProps) {
    return await runtime.changeActiveTab(findTabByProps._id);
  }

  const findTabByViewUrl = runtime.getTabByViewUrl(viewUrl);
  if (!findTabByViewUrl || (findTabByViewUrl && !newTab._single)) {
    const sourceTab = runtime.getTabById(newTab._sourceId);
    await runTabGuard(runtime.options?.onBeforeTabOpen, clone(newTab), clone(sourceTab));
    await runtime.hooks.call("tab:before-open", clone(newTab), clone(sourceTab));
    await runtime.runChangeActiveTabGuards(newTab);

    runtime.insertTab(newTab);

    const tabId = await runtime.changeActiveTab(newTab._id, false);
    await runtime.hooks.call("tab:opened", clone(newTab), clone(sourceTab));
    return tabId;
  }

  const findTab = runtime.getTabById(findTabByViewUrl._id);
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
    if (findTab._id !== runtime.activeTab?._id) {
      await runtime.runChangeActiveTabGuards(nextTab);
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
  await runtime.refreshTab(findTabByViewUrl._id);
  return await runtime.changeActiveTab(findTabByViewUrl._id, false);
}
