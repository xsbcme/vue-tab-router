import { computed, MaybeRefOrGetter, toValue, type ComputedRef } from "vue";
import type { Tab } from "./tab";
import type { IOpenTabOptions, TabViewMeta } from "./types";
import { jsonToObject, stableStringify } from "./utils";
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
  /** 当前激活 tab 对应的菜单路径。 */
  activeMenuPath: ComputedRef<Menu[]>;
  /** 当前激活 tab 对应的面包屑数据。 */
  breadcrumbs: ComputedRef<TabBreadcrumbItem<Menu>[]>;
  /** 获取菜单项 key。 */
  getMenuKey: (menu: Menu) => string;
  /** 获取 tab 对应的菜单 key。 */
  getTabKey: (tab: Partial<Tab>) => string;
  /** 按 key 从菜单树中查找菜单项。 */
  findMenu: (key: string, menus?: Menu[]) => Menu | undefined;
  /** 按 key 从菜单树中查找菜单路径。 */
  findMenuPath: (key: string, menus?: Menu[]) => Menu[];
  /** 打开指定菜单项对应的 tab。 */
  openMenu: (menu: Menu) => Promise<unknown>;
  /** 菜单点击处理函数，可直接绑定 menu-item-click。 */
  handleMenuItemClick: (key: string) => Promise<unknown>;
}

/** 面包屑数据项。 */
export interface TabBreadcrumbItem<Menu extends object = TabMenuItemLike> {
  /** 面包屑唯一 key。 */
  key: string;
  /** 面包屑显示标题。 */
  title: string;
  /** 面包屑图标。 */
  icon?: string;
  /** 对应菜单项；fallback 项可能不存在。 */
  menu?: Menu;
  /** 对应页面地址。 */
  viewUrl?: string;
  /** 是否可点击打开对应 tab。 */
  clickable: boolean;
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

export function findMenuPathByKey<Menu extends object>(
  menus: Menu[],
  key: string,
  getKey: (menu: Menu) => string,
  getChildren: (menu: Menu) => Menu[] | undefined
): Menu[] {
  for (const menu of menus) {
    if (getKey(menu) === key) return [menu];
    const children = getChildren(menu);
    if (Array.isArray(children)) {
      const childPath = findMenuPathByKey(children, key, getKey, getChildren);
      if (childPath.length) return [menu, ...childPath];
    }
  }
  return [];
}

function createTabBreadcrumbItem<Menu extends object>(
  tab: Partial<Tab>,
  getTabKey: (tab: Partial<Tab>) => string
): TabBreadcrumbItem<Menu> {
  return {
    key: getTabKey(tab) || tab._id || tab.viewUrl || "active-tab",
    title: tab.viewName || tab.viewUrl || "未命名",
    icon: tab.viewIcon,
    viewUrl: tab.viewUrl,
    clickable: false,
  };
}

function createMenuBreadcrumbItems<Menu extends object>(
  menuPath: Menu[],
  getMenuKey: (menu: Menu) => string,
  getViewUrl: (menu: Menu) => string | undefined,
  getViewName: (menu: Menu) => string | undefined,
  getViewIcon: (menu: Menu) => string | undefined
): TabBreadcrumbItem<Menu>[] {
  return menuPath.map(menu => {
    const viewUrl = getViewUrl(menu);
    return {
      key: getMenuKey(menu),
      title: getViewName(menu) || viewUrl || getMenuKey(menu),
      icon: getViewIcon(menu),
      menu,
      viewUrl,
      clickable: Boolean(viewUrl),
    };
  });
}

function createViewMetaBreadcrumbItems<Menu extends object>(metaPath: TabViewMeta[]): TabBreadcrumbItem<Menu>[] {
  return metaPath.map(meta => ({
    key: meta.viewUrl || String(meta.id ?? meta.title ?? "view-meta"),
    title: meta.title || meta.viewUrl || String(meta.id ?? "未命名"),
    icon: meta.icon,
    viewUrl: meta.viewUrl,
    clickable: Boolean(meta.viewUrl),
  }));
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

  const findMenuPath = (key: string, menus = toValue(options.menus) ?? []) => {
    return findMenuPathByKey(menus, key, getMenuKey, getChildren);
  };

  const activeMenuPath = computed(() => {
    if (!tabsManager.activeTab) return [];
    const key = getTabKey(tabsManager.activeTab);
    return key ? findMenuPath(key) : [];
  });

  const breadcrumbs = computed<TabBreadcrumbItem<Menu>[]>(() => {
    const activeTab = tabsManager.activeTab;
    if (!activeTab) return [];

    const viewMetaPath = tabsManager.getViewMetaPath(activeTab.viewUrl);
    if (viewMetaPath.length) {
      return createViewMetaBreadcrumbItems<Menu>(viewMetaPath);
    }

    const menuPath = activeMenuPath.value;
    if (menuPath.length) {
      return createMenuBreadcrumbItems(menuPath, getMenuKey, getViewUrl, getViewName, getViewIcon);
    }

    const inferredBreadcrumbs = tabsManager.activeTabParentPaths
      .filter(parentPath => parentPath !== activeTab.viewUrl)
      .map(parentPath => {
        const parentMenuPath = findMenuPath(parentPath);
        if (parentMenuPath.length) {
          return createMenuBreadcrumbItems(parentMenuPath, getMenuKey, getViewUrl, getViewName, getViewIcon);
        }

        const parentTab = tabsManager.tabs.find(tab => tab.viewUrl === parentPath);
        if (parentTab) {
          return [createTabBreadcrumbItem<Menu>(parentTab, getTabKey)];
        }

        return [
          {
            key: parentPath,
            title: parentPath,
            viewUrl: parentPath,
            clickable: false,
          },
        ] satisfies TabBreadcrumbItem<Menu>[];
      })
      .flat();

    const uniqueBreadcrumbs = inferredBreadcrumbs.filter((item, index, list) => {
      return list.findIndex(current => current.key === item.key) === index;
    });

    return [...uniqueBreadcrumbs, createTabBreadcrumbItem<Menu>(activeTab, getTabKey)];
  });

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
    activeMenuPath,
    breadcrumbs,
    getMenuKey,
    getTabKey,
    findMenu,
    findMenuPath,
    openMenu,
    handleMenuItemClick,
  };
}

function toRecord(source: object) {
  return source as Record<string, unknown>;
}
