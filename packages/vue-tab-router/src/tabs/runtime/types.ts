import type { EventManager } from "../../shared";
import type { ITabsManagerOptions } from "../../types";
import type { Tab } from "../tab";
import type { TabsManagerHooks } from "../tabs-manager-plugin";

export interface TabsManagerRuntimeBase {
  readonly tabs: Tab[];
  readonly activeTab: Tab | undefined;
  readonly options: ITabsManagerOptions;
  readonly hooks: TabsManagerHooks;
  getTabById(tabId: string | undefined): Tab | undefined;
  setActiveTabId(tabId: string | undefined): void;
  persistTabs(): void;
}

export interface TabOpenRuntime extends TabsManagerRuntimeBase {
  getViewMeta(viewUrl: string | undefined): { title?: string; icon?: string; props?: Record<string, unknown> } | undefined;
  getTabByViewUrl(viewUrl: string): Tab | undefined;
  resolveComponent(name: string): unknown;
  insertTab(tab: Tab): void;
  runChangeActiveTabGuards(toTab: Partial<Tab>, fromTab?: Tab): Promise<void>;
  changeActiveTab(tabId: string, triggerHook?: boolean): Promise<string>;
  refreshTab(tabId?: string): Promise<unknown>;
}

export interface TabActiveRuntime extends TabsManagerRuntimeBase {
  setActiveTabId(tabId: string | undefined): void;
}

export interface TabCloseRuntime extends TabsManagerRuntimeBase {
  readonly detachedTab: Partial<Tab> | null;
  readonly events: EventManager;
  setTabs(tabs: Tab[]): void;
  syncTabs(): void;
  getNoCloseTabCloseHandler(): ((tab: Partial<Tab>) => boolean | Promise<boolean>) | undefined;
  runChangeActiveTabGuards(toTab: Partial<Tab>, fromTab?: Tab): Promise<void>;
  closeDetachedTab(): Promise<unknown>;
}

export interface TabsManagerRuntimeHost {
  readonly tabs: Tab[];
  readonly activeTab: Tab | undefined;
  readonly detachedTab: Partial<Tab> | null;
  readonly options: ITabsManagerOptions;
  readonly hooks: TabsManagerHooks;
  readonly events: EventManager;
  getViewMeta(viewUrl: string | undefined): { title?: string; icon?: string; props?: Record<string, unknown> } | undefined;
  getTabById(tabId: string | undefined): Tab | undefined;
  getTabByViewUrl(viewUrl: string): Tab | undefined;
  getNoCloseTabCloseHandler(): ((tab: Partial<Tab>) => boolean | Promise<boolean>) | undefined;
  resolveComponent(name: string): unknown;
  insertTab(tab: Tab): void;
  setTabs(tabs: Tab[]): void;
  setActiveTabId(tabId: string | undefined): void;
  syncTabs(): void;
  persistTabs(): void;
  runChangeActiveTabGuards(toTab: Partial<Tab>, fromTab?: Tab): Promise<void>;
  changeActiveTab(tabId: string, triggerHook?: boolean): Promise<string>;
  refreshTab(tabId?: string): Promise<unknown>;
  closeDetachedTab(): Promise<unknown>;
}
