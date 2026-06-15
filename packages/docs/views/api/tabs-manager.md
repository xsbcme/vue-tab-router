# TabsManager API

`TabsManager` 是标签页状态管理核心。通常通过 `createTabsManager(options)` 创建根实例，通过 `useTabsManager()` 在组件中获取响应式实例。

## createTabsManager(options)

```ts
import { createTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = createTabsManager({
  views: {
    modules: import.meta.glob("@/views/**/page-index.vue", { eager: false }),
  },
  storage: {
    enabled: true,
  },
});
```

返回 `TabsManager` 实例，可传给 `app.use(tabsManager)` 安装。

### options.views

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `modules` | `Record<string, ModuleItem>` | 页面模块映射。key 即 `openTab(viewUrl)` 的 `viewUrl`。 |
| `meta` | `TabViewMeta[]` | 页面元数据树，补充标题、图标、默认打开参数和层级。 |
| `source` | `Partial<AsyncComponentOptions>` | 透传给 `defineAsyncComponent` 的默认配置。 |

### options.storage

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `adapter` | `new StorageAdapter()` | 自定义持久化适配器。 |
| `key` | `"tabs"` | 持久化 key。 |
| `enabled` | `true` | 是否启用持久化。 |

### options.render

| 字段 | 说明 |
| --- | --- |
| `transition` | 页面切换过渡配置。 |
| `keepAlive` | keep-alive 配置，例如 `{ max: 20 }`。 |
| `noActiveComponent` | 没有激活 tab 时展示的占位组件；未配置时使用内置 `DefaultEmptyComponent`。 |
| `noExistComponent` | 目标组件不存在时展示的占位组件；未配置时使用内置 `DefaultNotFoundComponent`。 |
| `loadingComponent` | 默认加载组件。异步组件加载与 iframe 加载未单独配置时使用；未配置时使用内置 `DefaultLoadingComponent`。 |
| `errorComponent` | 默认失败组件。异步组件加载失败且 `views.source.errorComponent` 未配置时使用；未配置时使用内置 `DefaultErrorComponent`。 |
| `tabs.titleMaxLength` | 内置标签栏标题最大显示长度。 |
| `tabs.draggable` | 是否启用内置标签栏拖拽排序，默认 `true`。 |
| `tabs.showIcon` | 是否在内置标签栏显示图标，默认 `true`。 |
| `tabs.virtual` | 内置标签栏虚拟滚动配置。默认 `{ enabled: true, threshold: 30, overscan: 6, estimatedWidth: 148, minWidth: 72, maxWidth: 260 }`。 |

`views.source.loadingComponent`、`views.source.errorComponent` 会继续透传给 Vue `defineAsyncComponent`，优先级高于 `render.loadingComponent`、`render.errorComponent`。如果希望组件页和 iframe 页使用同一套加载视觉，只配置 `render.loadingComponent` 即可；如果 iframe 需要独立视觉，可使用 `iframe.loadingComponent` 覆盖。

### options.detached

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `zIndex` | `1000` | 弹窗显示层级。 |
| `fullscreen` | `true` | 弹窗打开后是否默认全屏。 |

### options.iframe

见 [内置组件 - iframe 通信](/views/api/components#iframe-通信)。

### options.guards

见 [全局守卫](/views/api/plugins#全局守卫)。

## 状态属性

| 属性 | 说明 |
| --- | --- |
| `tabs` | 当前打开的 tab 列表。 |
| `activeTab` | 当前激活 tab。没有激活项时为 `undefined`。 |
| `detachedTab` | 当前弹窗显示的 tab 快照。 |
| `registerTabPaths` | 已注册组件页面路径列表。 |
| `activeTabParentPaths` | 基于注册路径推断出的当前页面父路径列表。 |
| `detachedZIndex` | 弹窗显示层级。 |
| `detachedFullscreen` | 弹窗默认全屏状态。 |
| `hooks` | 插件生命周期 hook 管理器。 |
| `events` | tab 间事件通信管理器。 |

## openTab(viewUrl, options?)

打开组件页面、iframe 页面或链接页面。

```ts
await tabsManager.openTab("/src/views/user/detail/page-index.vue", {
  _viewName: "用户详情",
  _viewSingle: true,
  userId: 1001,
});
```

返回值：

- 普通打开：`Promise<string>`，返回 tabId。
- `_viewOutside: true` 或 `_viewOutside: { target, features }`：`Promise<Window | null>`，返回 `window.open` 的结果。

常用参数：

| 字段 | 说明 |
| --- | --- |
| `_viewName` | tab 标题。 |
| `_viewIcon` | tab 图标。 |
| `_viewSingle` | 是否单例复用同一路径。 |
| `_viewNoCache` | 是否禁用组件/iframe 缓存。 |
| `_viewPinned` | 是否置顶。 |
| `_viewNoDrag` | 是否禁止拖拽排序。 |
| `_viewOutside` | 是否用浏览器新窗口打开链接；也可传 `{ target, features }` 作为 `window.open` 参数。 |

除 `_view*` 外的字段会进入 `tab.viewProps`。

## openFirstTab(viewUrl, options?, mode?)

打开首页标签，并将其标记为不可关闭、不可拖拽。

```ts
await tabsManager.openFirstTab("/src/views/home/page-index.vue", {
  _viewName: "首页",
});
```

`mode` 可选：

| 值 | 说明 |
| --- | --- |
| `replace` | 默认。替换已有首页。 |
| `clear` | 清空全部 tab 后打开首页。 |
| `move` | 打开后移动到首位。 |

## changeActiveTab(tabId)

激活指定 tab。

```ts
await tabsManager.changeActiveTab(tabId);
```

会执行全局进入/离开守卫和页面级进入/离开守卫。

## updateTabOptions(options, tabId?)

更新 tab 标题、图标、缓存策略或业务 props。

```ts
await tabsManager.updateTabOptions({
  _viewName: "用户详情（已保存）",
  status: "saved",
});
```

不传 `tabId` 时默认更新当前激活 tab。非 `_view*` 字段会浅合并到 `viewProps`。

## refreshTab(tabId?) / refreshTabAll()

```ts
await tabsManager.refreshTab();
await tabsManager.refreshTab(tabId);
await tabsManager.refreshTabAll();
```

`refreshTab` 会触发当前 tab 重建。`refreshTabAll` 会通知容器刷新全部 tab。

## closeTab(tabId?, options?)

```ts
await tabsManager.closeTab(tabId, {
  ignoreNoClose: true,
  skipGuard: true,
});
```

| 字段 | 说明 |
| --- | --- |
| `ignoreNoClose` | 忽略不可关闭标记。 |
| `skipGuard` | 跳过关闭守卫和关闭回退时的切换守卫。 |

## 批量关闭

```ts
await tabsManager.closeTabByAll({ continueOnRejected: true });
await tabsManager.closeTabsByLeft(tabId);
await tabsManager.closeTabsByRight(tabId);
await tabsManager.closeTabsByOther(tabId);
```

`continueOnRejected` 表示某个 tab 被守卫拒绝关闭后是否继续处理后续 tab。

## 弹窗显示

```ts
await tabsManager.openDetachedTab(tabId);
await tabsManager.closeDetachedTab();
```

`openDetachedTab` 会把当前 tab 或指定 tab 放入弹窗显示状态。内置 `DetachedContainerComponent` 会消费 `detachedTab`。

## iframe 消息

```ts
tabsManager.postActiveIframeMessage({ type: "reload" });
tabsManager.postIframeMessage(tabId, { type: "set-theme", theme: "dark" });
```

适合从布局工具栏向当前 iframe 或指定 iframe 发送消息。

## tab 间事件

```ts
tabsManager.emit("reload-list", { id: 1001 });
```

事件会发送给当前 tab 的来源 tab。页面内部可用 `defineTabEvents` 接收。

## clear()

```ts
tabsManager.clear();
```

清空全部 tab、持久化状态和事件监听。常用于退出登录。

## createScopedManager(options?)

创建共享页面模块、但隔离 tab 状态的临时 manager。

```ts
const previewManager = tabsManager.createScopedManager({
  storageEnabled: false,
});
```

适合预览容器、弹窗子实例等场景。
