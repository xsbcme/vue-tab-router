import { computed, MaybeRefOrGetter, toValue, type ComputedRef } from "vue";
import type { Tab } from "./tab";
import type { IOpenTabOptions } from "./types";
import { jsonToObject } from "./utils";
import { useTabsManager } from "./use-tabs-manager";

export type TabMenuProps = Record<string, unknown> | string | null | undefined;

/** 可被 useTabMenu 默认识别的菜单项结构。 */
export interface TabMenuItemLike extends Record<string, unknown> {
  /** 菜单唯一标识。没有页面地址时作为兜底 key。 */
  id?: string | number;
  /** 菜单名称，同时会作为打开 tab 的默认标题。 */
  name?: string;
  /** 菜单标题，同时会作为打开 tab 的默认标题。 */
  title?: string;
  /** 页面地址。 */
  url?: string;
  /** 页面地址，兼容 uri 命名。 */
  uri?: string;
  /** 页面地址，兼容 viewUrl 命名。 */
  viewUrl?: string;
  /** 菜单图标，同时会作为打开 tab 的默认图标。 */
  icon?: string;
  /** 打开 tab 时传入的参数。 */
  props?: TabMenuProps;
  /** 打开 tab 时传入的参数，兼容 viewProps 命名。 */
  viewProps?: TabMenuProps;
  /** 子菜单。 */
  children?: TabMenuItemLike[];
}

/** 菜单 key 生成选项。 */
export interface TabMenuKeyOptions {
  /** 是否把不会写入 tab.viewProps 的打开参数计入菜单选中 key。 */
  includeTabOptionsInKey?: boolean;
}

/** useTabMenu 配置项。 */
export interface UseTabMenuOptions<Menu extends object = TabMenuItemLike> extends TabMenuKeyOptions {
  /** 菜单树，可传响应式 getter。 */
  menus?: MaybeRefOrGetter<Menu[] | undefined>;
  /** 自定义读取子菜单。 */
  getChildren?: (menu: Menu) => Menu[] | undefined;
  /** 自定义读取页面地址。 */
  getViewUrl?: (menu: Menu) => string | undefined;
  /** 自定义读取 tab 标题。 */
  getViewName?: (menu: Menu) => string | undefined;
  /** 自定义读取 tab 图标。 */
  getViewIcon?: (menu: Menu) => string | undefined;
  /** 自定义读取打开 tab 时的参数。 */
  getViewProps?: (menu: Menu) => TabMenuProps;
  /** 自定义菜单 key。需要与 getTabKey 保持一致才能正确选中。 */
  getMenuKey?: (menu: Menu) => string;
  /** 自定义 tab key。需要与 getMenuKey 保持一致才能正确选中。 */
  getTabKey?: (tab: Partial<Tab>) => string;
}

/** useTabMenu 返回值。 */
export interface UseTabMenuReturn<Menu extends object = TabMenuItemLike> {
  /** 当前响应式 TabsManager 实例。 */
  tabsManager: ReturnType<typeof useTabsManager>;
  /** 当前菜单选中 key，可直接绑定菜单组件。 */
  selectedKeys: ComputedRef<string[]>;
  /** 获取菜单项 key。 */
  getMenuKey: (menu: Menu) => string;
  /** 获取 tab 对应的菜单 key。 */
  getTabKey: (tab: Partial<Tab>) => string;
  /** 按 key 从菜单树中查找菜单项。 */
  findMenu: (key: string, menus?: Menu[]) => Menu | undefined;
  /** 打开指定菜单项对应的 tab。 */
  openMenu: (menu: Menu) => Promise<unknown>;
  /** 菜单点击处理函数，可直接绑定 menu-item-click。 */
  handleMenuItemClick: (key: string) => Promise<unknown>;
}

const TAB_OPTION_PREFIX = "_view";
const DEFAULT_IGNORED_TAB_OPTION_KEYS = new Set(["_viewName", "_viewIcon", "_viewNoCache", "_viewSingle"]);

function readStringField(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string") return value;
  }
}

function readMenuProps(source: Record<string, unknown>, keys: string[]): TabMenuProps {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" || (value && typeof value === "object")) {
      return value as Record<string, unknown> | string;
    }
  }
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(item => stableStringify(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function normalizeTabMenuProps(props: TabMenuProps, options: TabMenuKeyOptions = {}) {
  const parsedProps = jsonToObject(props ?? {}, {}) as Record<string, unknown>;
  return Object.keys(parsedProps).reduce(
    (result, key) => {
      const value = parsedProps[key];
      if (value === undefined || value === null) return result;
      if (!options.includeTabOptionsInKey && isIgnoredTabOptionKey(key)) return result;
      result[key] = value;
      return result;
    },
    {} as Record<string, unknown>
  );
}

function isIgnoredTabOptionKey(key: string) {
  return key.startsWith(TAB_OPTION_PREFIX) && DEFAULT_IGNORED_TAB_OPTION_KEYS.has(key);
}

/** 根据页面地址和参数创建稳定菜单 key。 */
export function createTabMenuKey(viewUrl: string | undefined, props?: TabMenuProps, options: TabMenuKeyOptions = {}) {
  if (!viewUrl) return "";

  const normalizedProps = normalizeTabMenuProps(props, options);
  const params = new URLSearchParams();
  Object.keys(normalizedProps)
    .sort()
    .forEach(key => {
      const value = normalizedProps[key];
      const values = Array.isArray(value) ? value : [value];
      values.forEach(item => {
        params.append(key, typeof item === "object" ? stableStringify(item) : String(item));
      });
    });

  const query = params.toString();
  return query ? `${viewUrl}?${query}` : viewUrl;
}

/** 根据菜单项创建稳定菜单 key。 */
export function getTabMenuKey(menu: Partial<TabMenuItemLike>, options: TabMenuKeyOptions = {}) {
  const viewUrl = menu.viewUrl ?? menu.url ?? menu.uri;
  if (viewUrl) {
    return createTabMenuKey(viewUrl, menu.viewProps ?? menu.props, options);
  }
  const fallbackKey = menu.id ?? menu.name ?? menu.title;
  return fallbackKey === undefined || fallbackKey === null ? "" : String(fallbackKey);
}

function findMenuByKey<Menu extends object>(
  menus: Menu[],
  key: string,
  getKey: (menu: Menu) => string,
  getChildren: (menu: Menu) => Menu[] | undefined
): Menu | undefined {
  for (const menu of menus) {
    if (getKey(menu) === key) return menu;
    const children = getChildren(menu);
    if (Array.isArray(children)) {
      const child = findMenuByKey(children, key, getKey, getChildren);
      if (child) return child;
    }
  }
}

export function useTabMenu<Menu extends object = TabMenuItemLike>(
  options: UseTabMenuOptions<Menu> = {}
): UseTabMenuReturn<Menu> {
  const tabsManager = useTabsManager();
  const getChildren =
    options.getChildren ??
    ((menu: Menu) => {
      const children = toRecord(menu).children;
      return Array.isArray(children) ? (children as Menu[]) : undefined;
    });
  const getViewUrl = options.getViewUrl ?? ((menu: Menu) => readStringField(toRecord(menu), ["url", "uri", "viewUrl"]));
  const getViewName = options.getViewName ?? ((menu: Menu) => readStringField(toRecord(menu), ["name", "title"]));
  const getViewIcon = options.getViewIcon ?? ((menu: Menu) => readStringField(toRecord(menu), ["icon"]));
  const getViewProps = options.getViewProps ?? ((menu: Menu) => readMenuProps(toRecord(menu), ["props", "viewProps"]));
  const getMenuKey =
    options.getMenuKey ??
    ((menu: Menu) =>
      getTabMenuKey(
        {
          ...menu,
          viewUrl: getViewUrl(menu),
          props: getViewProps(menu),
        },
        options
      ));
  const getTabKey =
    options.getTabKey ??
    ((tab: Partial<Tab>) =>
      getTabMenuKey(
        {
          viewUrl: tab.viewUrl,
          viewProps: tab.viewProps,
        },
        options
      ));

  const selectedKeys = computed(() => {
    if (!tabsManager.activeTab) return [];
    const key = getTabKey(tabsManager.activeTab);
    return key ? [key] : [];
  });

  const findMenu = (key: string, menus = toValue(options.menus) ?? []) => {
    return findMenuByKey(menus, key, getMenuKey, getChildren);
  };

  const openMenu = (menu: Menu) => {
    const viewUrl = getViewUrl(menu);
    if (!viewUrl) return Promise.resolve(undefined);

    const viewProps = jsonToObject(getViewProps(menu) ?? {}, {}) as IOpenTabOptions;
    return tabsManager.openTab(viewUrl, {
      _viewName: getViewName(menu),
      _viewIcon: getViewIcon(menu),
      ...viewProps,
    });
  };

  const handleMenuItemClick = (key: string) => {
    const menu = findMenu(key);
    if (!menu) return Promise.resolve(undefined);
    return openMenu(menu);
  };

  return {
    tabsManager,
    selectedKeys,
    getMenuKey,
    getTabKey,
    findMenu,
    openMenu,
    handleMenuItemClick,
  };
}

function toRecord(source: object) {
  return source as Record<string, unknown>;
}