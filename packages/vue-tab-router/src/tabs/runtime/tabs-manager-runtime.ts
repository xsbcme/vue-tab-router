import type { Tab } from "../tab";
import type { TabsManagerRuntimeHost } from "./types";

export function createTabsManagerRuntime(manager: TabsManagerRuntimeHost) {
  return {
    get tabs() {
      return manager.tabs;
    },
    get activeTab() {
      return manager.activeTab;
    },
    get detachedTab() {
      return manager.detachedTab;
    },
    get options() {
      return manager.options;
    },
    get hooks() {
      return manager.hooks;
    },
    get events() {
      return manager.events;
    },
    getViewMeta(viewUrl: string | undefined) {
      return manager.getViewMeta(viewUrl);
    },
    getTabById(tabId: string | undefined) {
      return manager.getTabById(tabId);
    },
    getTabByViewUrl(viewUrl: string) {
      return manager.getTabByViewUrl(viewUrl);
    },
    getNoCloseTabCloseHandler() {
      return manager.getNoCloseTabCloseHandler();
    },
    resolveComponent(name: string) {
      return manager.resolveComponent(name);
    },
    insertTab(tab: Tab) {
      manager.insertTab(tab);
    },
    setTabs(tabs: Tab[]) {
      manager.setTabs(tabs);
    },
    setActiveTabId(tabId: string | undefined) {
      manager.setActiveTabId(tabId);
    },
    syncTabs() {
      manager.syncTabs();
    },
    persistTabs() {
      manager.persistTabs();
    },
    runChangeActiveTabGuards(toTab: Partial<Tab>, fromTab?: Tab) {
      return manager.runChangeActiveTabGuards(toTab, fromTab);
    },
    changeActiveTab(tabId: string, triggerHook?: boolean) {
      return manager.changeActiveTab(tabId, triggerHook);
    },
    refreshTab(tabId?: string) {
      return manager.refreshTab(tabId);
    },
    closeDetachedTab() {
      return manager.closeDetachedTab();
    },
  };
}

export type TabsManagerRuntime = ReturnType<typeof createTabsManagerRuntime>;
