# 组合式 API

组合式 API 用于在 Vue 组件中访问 `TabsManager`、绑定菜单、声明当前页面行为和注册页面级守卫。

## useTabsManager()

获取当前注入作用域中的响应式 `TabsManager`。

```ts
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

await tabsManager.openTab("/src/views/user/page-index.vue", {
  _viewName: "用户管理",
});
```

必须在已经 `app.use(tabsManager)` 的 Vue 应用上下文中调用。

## useTabMenu(options?)

把业务菜单和当前激活 tab 关联起来。

```ts
const tabMenu = useTabMenu({
  menus: () => menuStore.getMenus,
});
```

返回值：

| 字段 | 说明 |
| --- | --- |
| `tabsManager` | 当前响应式 `TabsManager`。 |
| `selectedKeys` | 当前选中的菜单 key，可绑定菜单组件。 |
| `activeMenuPath` | 当前激活 tab 对应的菜单路径。 |
| `breadcrumbs` | 当前激活 tab 对应的面包屑数据。 |
| `getMenuKey(menu)` | 获取菜单 key。 |
| `getTabKey(tab)` | 获取 tab key。 |
| `findMenu(key, menus?)` | 按 key 查找菜单。 |
| `findMenuPath(key, menus?)` | 按 key 查找菜单路径。 |
| `openMenu(menu)` | 打开菜单对应 tab。 |
| `handleMenuItemClick(key)` | 菜单点击处理函数。 |

默认识别字段：

| 字段 | 说明 |
| --- | --- |
| `url` / `uri` / `viewUrl` | 页面地址。 |
| `name` / `title` | tab 标题。 |
| `icon` | tab 图标。 |
| `props` / `viewProps` | 打开参数。 |
| `children` | 子菜单。 |

自定义菜单字段：

```ts
const tabMenu = useTabMenu({
  menus: () => menus,
  getChildren: menu => menu.routes,
  getViewUrl: menu => menu.path,
  getViewName: menu => menu.label,
  getViewIcon: menu => menu.meta?.icon,
  getViewProps: menu => menu.params,
});
```

## createTabMenuKey(viewUrl, props?, options?)

根据 `viewUrl` 和打开参数生成稳定 key。

```ts
createTabMenuKey("/src/views/user/page-index.vue", { id: 1 });
```

默认会忽略不影响菜单身份的展示参数：

- `_viewName`
- `_viewIcon`
- `_viewNoCache`
- `_viewSingle`

如果希望所有 `_view*` 字段都参与 key，可开启：

```ts
createTabMenuKey(viewUrl, props, {
  includeTabOptionsInKey: true,
});
```

## getTabMenuKey(menu, options?)

根据菜单项生成 key。默认读取 `viewUrl` / `url` / `uri` 和 `props` / `viewProps`。

```ts
const key = getTabMenuKey({
  title: "用户详情",
  viewUrl: "/src/views/user/detail/page-index.vue",
  props: { id: 1001 },
});
```

## normalizeTabMenuProps(props, options?)

标准化菜单参数，用于生成 key 前过滤空值和默认忽略字段。

```ts
const normalized = normalizeTabMenuProps({
  _viewName: "用户详情",
  id: 1001,
});
```

结果只保留会影响菜单身份的字段。

## useTabId()

获取当前页面所在 tabId。

```ts
const tabId = useTabId();
```

只有在 `DynamicContainerComponent` 渲染出的页面内部才有值。

## defineTabOptions(options)

在页面内部声明当前 tab 的标题、图标、单例和缓存策略。

```ts
defineTabOptions({
  viewName: "用户详情",
  viewIcon: "IconUser",
  viewSingle: true,
  viewNoCache: false,
});
```

适合页面加载后根据数据动态决定标题。

## defineTabEvents(events)

注册当前页面可接收的事件。子页面可通过 `tabsManager.emit` 向来源页面发送事件。

```ts
defineTabEvents({
  "reload-list": payload => {
    loadList(payload);
  },
});
```

## 页面级守卫

```ts
onBeforeTabEnter((to, from) => {
  // 进入当前 tab 前
});

onBeforeTabLeave((to, from) => {
  if (hasUnsavedChanges.value) return false;
});

onBeforeTabClose((closingTab, sourceTab) => {
  return confirm("确认关闭？");
});
```

返回 `false`、抛错或返回 rejected Promise 会中断当前流程。

## postCurrentIframeMessage(data, options?)

向当前页面所在 tab 的 iframe 发送消息。

```ts
postCurrentIframeMessage({ type: "reload" });
```

通常用于被容器渲染的页面组件内部，不需要手动传 tabId。
