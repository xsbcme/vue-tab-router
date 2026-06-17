import { Tab } from "./tab";
import type { IOpenTabOptions } from "../types";
import { clone, createRandomString, createViewNotRegisteredError, stableStringify, TabViewUrl } from "../shared";
import { runBeforeOpenGuards } from "./guards";
import { normalizeOpenTabOptions } from "./services";
import type { TabOpenRuntime } from "./runtime/types";

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
  const iframeController = TabViewUrl.isIframeController(viewUrl)
    ? TabViewUrl.resolveIframeController(viewUrl)
    : undefined;
  const normalizedOptions = normalizeOpenTabOptions(viewUrl, viewMeta, tabOptions);

  if (iframeController) {
    const controllerUrl = iframeController.controllerUrl;
    if (!runtime.resolveComponent(controllerUrl)) {
      return Promise.reject(createViewNotRegisteredError(controllerUrl));
    }
  }

  if (TabViewUrl.isIframe(viewUrl)) {
    const newViewUrl = TabViewUrl.resolveIframe(viewUrl);
    if (normalizedOptions.viewOutside) {
      if (typeof window === "undefined") return null;
      const { target, features } = typeof normalizedOptions.viewOutside === "object" ? normalizedOptions.viewOutside : {};
      return window.open(newViewUrl, target, features);
    }
  } else if (!runtime.resolveComponent(viewUrl)) {
    return Promise.reject(createViewNotRegisteredError(viewUrl));
  }

  const newTab = new Tab({
    viewUrl,
    viewName: normalizedOptions.viewName,
    viewIcon: normalizedOptions.viewIcon,
    viewProps: normalizedOptions.viewProps,

    _sourceId: runtime.activeTab?._id,
    _noCache: normalizedOptions.viewNoCache,
    _pinned: normalizedOptions.viewPinned,
    _noDrag: normalizedOptions.viewNoDrag,
    _single: normalizedOptions.viewSingle,
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
    await runBeforeOpenGuards(runtime, newTab, sourceTab);
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
