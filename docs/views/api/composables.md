# 组合式 API

组合式 API 分为两类：用户侧常用 API 和高级工具 API。日常业务页面优先使用 `useTabsManager`、`useTabMenu`、`defineTabOptions`、`defineTabEvents` 和页面级守卫；菜单 key、事件管理器等工具主要用于自定义菜单适配、组件封装或高级扩展。

## 用户侧常用 API

### useTabsManager()

获取当前注入作用域中的响应式 `TabsManager`。

```ts
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

await tabsManager.openTab("/src/views/user/page-index.vue", {
  _viewName: "用户管理",
});
```

必须在已经 `app.use(tabsManager)` 的 Vue 应用上下文中调用。

### useTabMenu(options?)

把业务菜单和当前激活 tab 关联起来。

```ts
const tabMenu = useTabMenu({
  menus: () => menuStore.getMenus,
});
```

返回值：

| 字段                        | 说明                                 |
| --------------------------- | ------------------------------------ |
| `tabsManager`               | 当前响应式 `TabsManager`。           |
| `selectedKeys`              | 当前选中的菜单 key，可绑定菜单组件。 |
| `activeMenuPath`            | 当前激活 tab 对应的菜单路径。        |
| `breadcrumbs`               | 当前激活 tab 对应的面包屑数据。      |
| `getMenuKey(menu)`          | 获取菜单 key。                       |
| `getTabKey(tab)`            | 获取 tab key。                       |
| `findMenu(key, menus?)`     | 按 key 查找菜单。                    |
| `findMenuPath(key, menus?)` | 按 key 查找菜单路径。                |
| `openMenu(menu)`            | 打开菜单对应 tab。                   |
| `handleMenuItemClick(key)`  | 菜单点击处理函数。                   |

默认识别字段：

| 字段                      | 说明       |
| ------------------------- | ---------- |
| `url` / `uri` / `viewUrl` | 页面地址。 |
| `name` / `title`          | tab 标题。 |
| `icon`                    | tab 图标。 |
| `props` / `viewProps`     | 打开参数。 |
| `children`                | 子菜单。   |

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

高级选项：

| 字段                     | 说明                                                       |
| ------------------------ | ---------------------------------------------------------- |
| `getMenuKey(menu)`       | 自定义菜单 key。需要与 `getTabKey` 保持一致才能正确选中。  |
| `getTabKey(tab)`         | 自定义 tab key。需要与 `getMenuKey` 保持一致才能正确选中。 |
| `includeTabOptionsInKey` | 是否把默认忽略的展示类 `_view*` 打开参数计入菜单 key。     |

`breadcrumbs` 的生成优先级为：`viewMeta` 层级、菜单路径、已注册页面路径推断、当前 active tab 兜底。

### useTabId()

获取当前页面所在 tabId。

```ts
const tabId = useTabId();
```

只有在 `DynamicContainerComponent` 渲染出的页面内部才有值。

### defineTabOptions(options)

在页面内部声明当前 tab 的默认标题、图标、单例、缓存、置顶和拖拽策略。

```ts
defineTabOptions({
  viewName: "用户详情",
  viewIcon: "IconUser",
  viewSingle: true,
  viewNoCache: false,
  viewPinned: true,
  viewNoDrag: true,
});
```

这些选项只在 tab 容器内生效。当前 tab 已有的标题、图标或打开参数优先级更高；如果需要运行时强制更新标题或业务参数，使用 `tabsManager.updateTabOptions()`。

### defineTabEvents(events)

注册当前页面可接收的事件。子页面可通过 `tabsManager.emit` 向来源页面发送事件。

```ts
defineTabEvents({
  "reload-list": payload => {
    loadList(payload);
  },
});
```

### 页面级守卫

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

### useIframeMessenger()

在当前页面组件内部获取发送当前 iframe 消息的工具。

```ts
import { useIframeMessenger } from "@xsbcme/vue-tab-router";

const iframeMessenger = useIframeMessenger();
iframeMessenger.postMessage({ type: "reload" });
```

通常用于被容器渲染的页面组件内部，不需要手动传 tabId。

`useIframeMessenger()` 返回：

```ts
interface IframeMessenger {
  postMessage(data: unknown, options?: IframePostMessageOptions | null): boolean;
}
```

## iframe controller API

### defineIframeOptions(options)

在 iframe controller 组件内定义当前 iframe tab 的局部配置。

```ts
import { defineIframeOptions } from "@xsbcme/vue-tab-router";

defineIframeOptions({
  src: "https://example.com/report",
  styles: "body { outline: 4px solid rgba(22, 93, 255, .18); }",
  onLoad({ iframe, tab }) {
    console.log("loaded", tab.viewName, iframe.src);
  },
  onMessage(message) {
    if (message.data?.type === "report:ready") return false;
  },
});
```

参数：

| 字段             | 说明                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src`            | 当前 iframe 的实际加载地址。传入后会覆盖 `TabViewUrl.createIframeController(controllerUrl, iframeSrc)` 的 `iframeSrc`。 |
| `styles`         | 注入到同源 iframe 文档里的 CSS 文本，在 iframe `load` 后执行。                                                          |
| `messageOrigins` | 当前 iframe controller tab 允许接收消息的来源。不传时使用全局 `iframe.messageOrigins`。                                 |
| `onLoad`         | 当前 iframe 加载完成后的局部回调，执行顺序早于全局 `iframe.onLoad`。                                                    |
| `onMessage`      | 当前 iframe 发送 `postMessage` 后的局部回调，执行顺序早于全局 `iframe.onMessage`。返回 `false` 会中断后续全局处理。     |

说明：

- 仅在 `TabViewUrl.createIframeController()` 打开的 controller 组件中使用。
- `src` 可覆盖打开时传入的 iframe 地址；不传时使用 `createIframeController(controllerUrl, iframeSrc)` 的第二个参数。
- `openTab` 第二个参数会保存为当前 tab 的 `viewProps`，并作为默认查询参数透传给 iframe。
- 如果 `src` 自身已有同名查询参数，`src` 中的值优先；controller 可以借此重写外部传入的 iframe 参数。
- `styles` 会在 iframe `load` 后注入到同源 iframe 文档中，跨域 iframe 会跳过内部样式注入。
- `messageOrigins` 是局部来源校验；如果不传，仍使用全局 `iframe.messageOrigins`，全局也不传时默认只允许同源。
- `onMessage` 返回 `false` 会阻止全局 `iframe.onMessage` 和 `iframe:message` hook 继续处理。
- controller 组件卸载时不会因为普通标签切换清掉配置；关闭 tab、刷新 iframe tab、清空全部 tab 时会释放配置。

## 高级工具 API

这些 API 是公开导出的工具，不是插件内部私有方法；但业务页面通常不需要直接使用。适合自定义菜单组件、封装布局组件或编写扩展能力时使用。

### useEventManager()

获取当前 `TabsManager` 的事件管理器，等价于 `useTabsManager().events`。

```ts
import { useEventManager } from "@xsbcme/vue-tab-router";

const eventManager = useEventManager();
```

普通页面间通信优先使用 `defineTabEvents` 和 `tabsManager.emit`；只有需要直接注册或管理底层事件时再使用它。

### createTabMenuKey(viewUrl, props?, options?)

根据 `viewUrl` 和打开参数生成稳定 key。

```ts
createTabMenuKey("/src/views/user/page-index.vue", { id: 1 });
```

默认会忽略不影响菜单身份的展示参数。如果这些字段也需要参与 key，可开启 `includeTabOptionsInKey`。

- `_viewName`
- `_viewIcon`
- `_viewNoCache`
- `_viewSingle`

```ts
createTabMenuKey(viewUrl, props, {
  includeTabOptionsInKey: true,
});
```

### getTabMenuKey(menu, options?)

根据菜单项生成 key。默认读取 `viewUrl` / `url` / `uri` 和 `props` / `viewProps`。

```ts
const key = getTabMenuKey({
  title: "用户详情",
  viewUrl: "/src/views/user/detail/page-index.vue",
  props: { id: 1001 },
});
```

### normalizeTabMenuProps(props, options?)

标准化菜单参数，用于生成 key 前过滤空值和默认忽略字段。

```ts
const normalized = normalizeTabMenuProps({
  _viewName: "用户详情",
  id: 1001,
});
```

结果只保留会影响菜单身份的字段。

### findMenuPathByKey(menus, key, getKey, getChildren)

从菜单树中按 key 查找完整路径。`useTabMenu().findMenuPath` 内部也使用它。

```ts
const path = findMenuPathByKey(
  menus,
  activeKey,
  menu => menu.id,
  menu => menu.children
);
```

找不到时返回空数组。
